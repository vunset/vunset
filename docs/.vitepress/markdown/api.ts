import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MarkdownRenderer } from 'vitepress';
import { createChecker, type ComponentMeta, type PropertyMeta, type PropertyMetaSchema } from 'vue-component-meta';
import { sourceContainer, type SourceContainer } from './source-container.ts';
import { section } from './sections.ts';

export interface ApiOptions {
  root: string;
  uiRoot: string;
  tsconfig: string;
}

type Slot = ComponentMeta['slots'][number];

interface Row {
  name: string;
  type?: string;
  default?: string;
  required?: boolean;
  note?: string;
  description?: string;
  fields?: Row[];
}

interface Section {
  title: string;
  intro?: string;
  rows: Row[];
}

// `::: api button/Button` → props, state attributes, slots and events, read by vue-tsc's checker.
export function apiContainer(md: MarkdownRenderer, options: ApiOptions) {
  sourceContainer(md, 'api', ({ arg, env }) => {
    const file = apiFile(options, arg, env.relativePath);
    env.includes?.push(file);
    return render(md, readApi(options, file), arg.split('/').pop()!);
  });

  // after the containers above have expanded, so a part can count their rows
  md.core.ruler.before('normalize', 'api-parts', (state) => {
    state.src = parts(state.src);
  });
}

export function apiFile({ root, uiRoot }: ApiOptions, arg: string, relativePath = ''): string {
  return join(relativePath.startsWith('ui/') ? uiRoot : root, `${arg}.vue`);
}

// Dev rereads a component every time, as a type it imports may have changed; only the rows are kept.
let checker: ReturnType<typeof createChecker> | null = null;
const read = new Map<string, { source: string; api: Api }>();

export interface Api {
  sections: Section[];
  renders?: string;
}

export function readApi({ tsconfig }: ApiOptions, file: string): Api {
  const source = readFileSync(file, 'utf8');
  const cached = read.get(file);
  if (process.env.NODE_ENV === 'production' && cached?.source === source) return cached.api;

  checker ??= createChecker(tsconfig, { schema: true, forceUseTs: true });
  checker.updateFile(file, source);

  const meta = checker.getComponentMeta(file);
  // the checker skips JSDoc on `defineEmits<{ name: [...] }>` entries
  for (const event of meta.events) event.description ||= emitDoc(source, event.name);
  const api = { sections: sections(meta), renders: unquote(meta.props.find((prop) => prop.name === 'as')?.default) };
  read.set(file, { source, api });
  return api;
}

// the same rows as markdown tables, for `llms.ts`
export function apiMarkdown({ sections }: Api): string[] {
  const cell = (value: string | undefined) => flatten(value).replace(/\|/g, '\\|');
  const code = (value: string | undefined) => (value ? '`' + cell(value) + '`' : '');

  return sections.flatMap((section) => {
    const rows = section.rows.flatMap((row) => [
      row,
      ...(row.fields ?? []).map((field) => ({ ...field, name: `${row.name}.${field.name}` }))
    ]);
    return [
      `**${section.title}**`,
      '',
      ...(section.intro ? [flatten(section.intro), ''] : []),
      '| Name | Type | Default | Description |',
      '| --- | --- | --- | --- |',
      ...rows.map((row) => {
        const description = [row.required ? 'Required.' : '', row.note ? `(${row.note})` : '', cell(row.description)];
        return `| ${code(row.name)} | ${code(row.type)} | ${code(row.default)} | ${description.filter(Boolean).join(' ')} |`;
      }),
      ''
    ];
  });
}

function sections(meta: ComponentMeta): Section[] {
  const props = meta.props.filter((prop) => !prop.global);
  const defaultSlot = meta.slots.find((slot) => slot.name === 'default');

  return [
    {
      title: 'Props',
      rows: props.map((prop) => ({
        name: kebab(prop.name),
        type: type(prop.schema),
        default: defaultOf(prop),
        required: prop.required,
        description: prop.description
      }))
    },
    state(defaultSlot),
    { title: 'Slots', rows: slots(meta.slots, defaultSlot) },
    {
      title: 'Events',
      rows: meta.events.map((event) => ({
        name: `@${event.name}`,
        type: event.type.replace(/^\[(.*)\]$/, '$1'),
        description: event.description
      }))
    }
  ].filter((section) => section.rows.length);
}

// State is both slot props and `data-*`: `@attribute` overrides a field's attribute (`none` for none),
// `@slotOnly` says the part carries none of it.
function state(slot: Slot | undefined): Section {
  if (!slot || isTemplate(slot)) return { title: 'State', rows: [] };

  const slotOnly = slot.tags.find((tag) => tag.name === 'slotOnly');
  const rows = slotProps(slot).map((field): Row => {
    const base = { type: type(field.schema), description: field.description };
    const tagged = field.tags.find((tag) => tag.name === 'attribute')?.text;

    if (slotOnly || tagged === 'none') return { name: field.name, ...base, note: slotOnly ? undefined : 'slot only' };
    if (tagged !== undefined) return { name: field.name, ...base, note: tagged };
    return { name: `data-${field.name.toLowerCase()}`, ...base };
  });

  return {
    title: 'State',
    intro:
      slotOnly && (slotOnly.text || 'The element carries none of it as attributes.') + ' The default slot receives it.',
    rows
  };
}

function slots(all: Slot[], defaultSlot: Slot | undefined): Row[] {
  const stateNames = slotProps(defaultSlot).map((field) => field.name);
  const rows: Row[] = [];

  for (const slot of all) {
    const name = `#${slot.name}`;
    // `@internal`: what the slot hands over is the root's own machinery, not a list worth reading
    if (slot.tags.some((tag) => tag.name === 'internal')) {
      rows.push({ name, description: slot.description });
      continue;
    }

    const fields = slotProps(slot);
    const names = fields.map((field) => field.name);
    const shape = names.length ? `{ ${names.join(', ')} }` : undefined;

    // the default slot, or one handed the same values, receives the state listed above
    const same = !isTemplate(slot) && sameNames(names, stateNames);
    if (same || (slot.name === 'default' && !isTemplate(slot))) {
      if (!names.length && !slot.description) continue;
      const description = slot.description || (slot.name === 'default' ? 'Receives the state, to render from it.' : '');
      rows.push({
        name,
        type: shape,
        description: same && slot.name !== 'default' ? `${description} It receives the same state.`.trim() : description
      });
      continue;
    }

    // `@template`: rendered once per item, with that item's props rather than the part's state
    rows.push({
      name,
      type: shape,
      description: slot.description,
      fields: fields.map((field) => ({ name: field.name, type: type(field.schema), description: field.description }))
    });
  }
  return rows;
}

function render(md: MarkdownRenderer, { sections: all, renders }: Api, name: string): string[] {
  const count = all.reduce((sum, section) => sum + section.rows.length, 0);

  const inline = (value: string | undefined) => md.renderInline(flatten(value));
  const esc = md.utils.escapeHtml;

  // `v-pre`, so a `{{` in a type isn't read as Vue; the head sits in a <button>, so only spans.
  function renderRow(row: Row, nested = false): string[] {
    const badge = 'rounded px-1.5 py-0.5 font-mono text-xs/none';
    const meta =
      row.type || row.default || row.required || row.note
        ? [
            '<span class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5" v-pre>',
            row.type ? `<code class="api-type ${badge} whitespace-normal wrap-break-word">${esc(row.type)}</code>` : '',
            row.required ? `<span class="${badge} bg-docs-danger text-[#f2f2f2]">required</span>` : '',
            row.default ? `<code class="${badge} bg-docs-text/10">${esc(row.default)}</code>` : '',
            row.note ? `<span class="text-xs text-docs-text/50">${inline(row.note)}</span>` : '',
            '</span>'
          ]
        : ['<span></span>'];

    return [
      nested ? '<ApiRow nested>' : '<ApiRow>',
      '<template #head>',
      `<span class="min-w-0" v-pre><code class="${badge} inline-block max-w-full bg-docs-text/10 text-docs-text break-all duration-150 group-hover:text-docs-accent group-focus-visible:text-docs-accent">${esc(row.name)}</code></span>`,
      ...meta,
      '</template>',
      row.description
        ? `<div class="api-description pt-2.5 text-sm/[1.4] max-w-160" v-pre>${inline(row.description)}</div>`
        : '',
      ...(row.fields?.length
        ? [
            '<div class="mt-2 pl-4 border-l border-docs-border">',
            ...row.fields.flatMap((field) => renderRow(field, true)),
            '</div>'
          ]
        : []),
      '</ApiRow>'
    ].filter(Boolean);
  }

  // one HTML block: no blank lines, or markdown-it would end it early
  return [
    '',
    `<div class="api clear-both flow-root space-y-1.5" data-name="${esc(name)}" data-count="${count}"${renders ? ` data-renders="${esc(renders)}"` : ''}>`,
    ...all.flatMap((section) => [
      '<div class="flex flex-col gap-1">',
      `<div class="px-1.5 py-1 text-xs font-medium uppercase text-docs-text/50">${section.title}</div>`,
      section.intro ? `<div class="px-1.5 pb-1 text-sm" v-pre>${inline(section.intro)}</div>` : '',
      ...section.rows.flatMap((row) => renderRow(row)),
      '</div>'
    ]),
    '</div>',
    ''
  ].filter((line, index, lines) => line || index === 0 || index === lines.length - 1);
}

// `## API Reference` → <ApiAccordion>; text before the first `###` holding a part gets an item of its own.
function parts(src: string): string {
  const lines = src.split('\n');
  const found = section(lines, 'API Reference');
  if (!found) return src;
  const { start, end, lead } = found;
  const items = [...found.items];

  const intro: string[] = [];
  const name = lead.join('\n').match(/<div class="api[^"]*" data-name="([^"]+)"/)?.[1];
  if (name) items.unshift({ label: name, lines: lead });
  else intro.push(...lead);
  if (!items.length) return src;

  const meta = items.map((part) => {
    const text = part.lines.join('\n');
    const counts = [...text.matchAll(/<div class="api[^"]*" [^>]*data-count="(\d+)"/g)].map((match) =>
      Number(match[1])
    );
    const renders = text.match(/<div class="api[^"]*" [^>]*data-renders="([^"]+)"/)?.[1];
    const count = counts.reduce((sum, value) => sum + value, 0) + tableRows(part.lines);
    return { label: part.label, count: count || undefined, renders };
  });

  const out = [
    ...lines.slice(0, start + 1),
    ...intro,
    '',
    `<ApiAccordion :parts="${JSON.stringify(meta).replace(/"/g, "'")}">`,
    ...items.flatMap((part, index) => [`<template #part-${index}>`, '', ...part.lines, '', '</template>']),
    '</ApiAccordion>',
    '',
    ...lines.slice(end)
  ];
  return out.join('\n');
}

// a hand-written table's rows: every `|` line but each table's header and divider
function tableRows(lines: string[]): number {
  const table = lines.filter((line) => line.startsWith('|'));
  const dividers = table.filter((line) => /^\|[\s:|-]+\|?$/.test(line)).length;
  return Math.max(0, table.length - dividers * 2);
}

function isTemplate(slot: Slot): boolean {
  return slot.tags.some((tag) => tag.name === 'template');
}

// the comment right above `name: [...]` (or `'name': [...]`) in the component's source
function emitDoc(source: string, name: string): string {
  const key = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`/\\*\\*((?:(?!\\*/)[\\s\\S])*)\\*/\\s*'?${key}'?\\s*:\\s*\\[`));
  return match ? match[1].replace(/^\s*\*\s?/gm, '').trim() : '';
}

function sameNames(names: string[], others: string[]): boolean {
  return names.length > 0 && names.length === others.length && names.every((name) => others.includes(name));
}

function slotProps(slot: Slot | undefined): PropertyMeta[] {
  const schema = slot?.schema;
  return typeof schema === 'object' && schema.kind === 'object' ? Object.values(schema.schema ?? {}) : [];
}

// Aliases expanded, `undefined` dropped (optional says it), `string & {}` read as `string`.
function type(schema: PropertyMetaSchema): string {
  if (typeof schema === 'string') return clean(schema);
  if (schema.kind !== 'enum') return clean(schema.type);

  let members = (schema.schema ?? []).map(type).filter((member) => member !== 'undefined');
  if (members.includes('true') && members.includes('false')) {
    members = members.map((member) => (member === 'false' ? 'boolean' : member)).filter((member) => member !== 'true');
  }
  members = [...new Set(members)];
  // `'sm' | 'md' | string`: the open-ended `string` reads best after the values it suggests
  if (members.some((member) => member.startsWith("'"))) {
    members.sort((a, b) => Number(a === 'string') - Number(b === 'string'));
  }
  return members.join(' | ');
}

function clean(type: string): string {
  return type
    .replace(/\(?string & \{\}\)?/g, 'string')
    .replace(/"([^"]*)"/g, "'$1'")
    .replace(/ \| undefined$/, '');
}

function defaultOf(prop: ComponentMeta['props'][number]): string {
  const tagged = prop.tags.find((tag) => tag.name === 'default')?.text;
  const value = prop.default ?? tagged;
  // `withDefaults({ open: undefined })` leaves a prop unset on purpose: no default shown unless a `@default` tag says
  if (prop.default === 'undefined') return tagged !== undefined ? clean(tagged) : '';
  if (value !== undefined) return clean(value);
  // Vue casts an absent boolean prop to false
  return type(prop.schema) === 'boolean' ? 'false' : '';
}

// `'div'` → `div`; anything but a plain tag name (a component, an expression) → nothing
function unquote(value: string | undefined): string | undefined {
  return value?.match(/^['"]([a-z][a-z0-9-]*)['"]$/)?.[1];
}

function flatten(value: string | undefined): string {
  return (value ?? '').replace(/\s*\n\s*/g, ' ').trim();
}

function kebab(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
