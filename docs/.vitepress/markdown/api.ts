import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MarkdownRenderer } from 'vitepress';
import { createChecker, type ComponentMeta, type PropertyMeta, type PropertyMetaSchema } from 'vue-component-meta';
import { sourceContainer, type SourceContainer } from './source-container.ts';
import { section } from './sections.ts';

export interface ApiOptions {
  /** Where components live: `button/Button` is `<root>/button/Button.vue`. */
  root: string;
  /** The same for pages under `ui/`: `form/FormInput` is `<uiRoot>/form/FormInput.vue`. */
  uiRoot: string;
  tsconfig: string;
}

type Slot = ComponentMeta['slots'][number];

interface Row {
  name: string;
  type?: string;
  default?: string;
  required?: boolean;
  /** Rendered HTML, under the type. */
  note?: string;
  /** Markdown. */
  description?: string;
  /** A slot's props, listed under it. */
  fields?: Row[];
}

interface Section {
  title: string;
  /** Markdown, above the rows. */
  intro?: string;
  rows: Row[];
}

// `::: api button/Button` → the component's props (JSDoc, `withDefaults`), its
// state as `data-*` attributes and slot props, its slots and events, read by
// the same checker as vue-tsc. Each `###` part under `## API Reference` then
// becomes an item of <ApiAccordion>.
export function apiContainer(md: MarkdownRenderer, { root, uiRoot, tsconfig }: ApiOptions) {
  let checker: ReturnType<typeof createChecker> | null = null;

  function read(arg: string, env: SourceContainer['env']): ComponentMeta {
    const file = join(env.relativePath?.startsWith('ui/') ? uiRoot : root, `${arg}.vue`);
    env.includes?.push(file);

    const source = readFileSync(file, 'utf8');
    checker ??= createChecker(tsconfig, { schema: true, forceUseTs: true });
    checker.updateFile(file, source);

    const meta = checker.getComponentMeta(file);
    // the checker skips JSDoc on `defineEmits<{ name: [...] }>` entries
    for (const event of meta.events) event.description ||= emitDoc(source, event.name);
    return meta;
  }

  sourceContainer(md, 'api', ({ arg, env }) => render(md, read(arg, env), arg.split('/').pop()!));

  // after the containers above have expanded, so a part can count their rows
  md.core.ruler.before('normalize', 'api-parts', (state) => {
    state.src = parts(state.src);
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

// A root renders `<slot v-bind="state" />` and `dataAttrs(state)` on its element,
// so one list covers both. A state field whose attribute is mapped differently
// says so with `@attribute` in its JSDoc (`@attribute none` when there is none);
// `@slotOnly` says the part carries none of it, and its text what it carries instead.
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

function render(md: MarkdownRenderer, meta: ComponentMeta, name: string): string[] {
  const all = sections(meta);
  const count = all.reduce((sum, section) => sum + section.rows.length, 0);
  const renders = unquote(meta.props.find((prop) => prop.name === 'as')?.default);

  const inline = (value: string | undefined) => md.renderInline(flatten(value));
  const esc = md.utils.escapeHtml;

  // <ApiRow>: the name and the type always show, a click opens the rest. Text
  // goes in `v-pre` elements, so a `{{` in a type isn't read as Vue; the head
  // sits in a <button>, so it holds only spans.
  function renderRow(row: Row, nested = false): string[] {
    const meta =
      row.type || row.default || row.required || row.note
        ? [
            '<span class="flex flex-wrap items-center gap-x-3 gap-y-1.5" v-pre>',
            row.required ? '<span class="pill rounded-xl text-xs bg-accent text-canvas">required</span>' : '',
            row.type
              ? `<code class="pill rounded-xl text-xs whitespace-normal wrap-break-word">${esc(row.type)}</code>`
              : '',
            row.default
              ? `<span class="font-mono text-xs text-amber"><code class="p-0 bg-transparent text-amber text-xs">${esc(row.default)}</code></span>`
              : '',
            row.note ? `<span class="text-xs text-current/50">${inline(row.note)}</span>` : '',
            '</span>'
          ]
        : ['<span class="flex flex-wrap items-center gap-x-3 gap-y-1.5"></span>'];

    return [
      nested ? '<ApiRow nested>' : '<ApiRow>',
      '<template #head>',
      `<span v-pre><code class="p-0 bg-transparent font-mono text-xs text-surface whitespace-normal group-hover:text-accent group-focus-visible:text-accent">${esc(row.name)}</code></span>`,
      ...meta,
      '</template>',
      row.description
        ? `<div class="api-description text-sm/relaxed text-current/75 pr-8 max-w-160" v-pre>${inline(row.description)}</div>`
        : '',
      ...(row.fields?.length
        ? [
            '<div class="mt-1 mb-3 pl-4 border-l border-edge-subtle">',
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
    `<div class="api clear-both flow-root space-y-3" data-name="${esc(name)}" data-count="${count}"${renders ? ` data-renders="${esc(renders)}"` : ''}>`,
    ...all.flatMap((section) => [
      '<div>',
      '<div class="inset-card overflow-clip pb-1">',
      `<div class="inline-block text-amber px-4 pt-4">${section.title}</div>`,
      section.intro ? `<div class="px-4 pb-3 text-sm" v-pre>${inline(section.intro)}</div>` : '',
      ...section.rows.flatMap((row) => renderRow(row)),
      '</div>',
      '</div>'
    ]),
    '</div>',
    ''
  ].filter((line, index, lines) => line || index === 0 || index === lines.length - 1);
}

// `## API Reference` → <ApiAccordion>, an item per `###` part. Text before the
// first `###` stays above it, unless it holds a part of its own (a page for a
// single component), which then gets an item named after it.
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

// `Size | undefined` → `'md' | 'sm' | 'lg' | string`: aliases expanded,
// `undefined` dropped (optional already says it), `string & {}` read as `string`.
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
  // `withDefaults({ open: undefined })` keeps a prop unset on purpose (controlled-only,
  // or a default that depends on others), so it has no default to show, not even
  // `false`, unless a `@default` tag says what the code falls back to
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
