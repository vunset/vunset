// JetBrains completions from the docs' API rows. Run from packages/vue or packages/ui:
//   node ../../scripts/web-types.ts

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiFile, readApi, type ApiOptions } from '../docs/.vitepress/markdown/api.ts';
import { fences } from '../docs/.vitepress/markdown/sections.ts';
import { describe, pagePath, readPage } from '../docs/.vitepress/seo.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const SITE = 'https://vunset.com/';
const ENTRIES = ['index.ts', 'chart.ts', 'data-table.ts'];
const EXPORT = /export\s*\{\s*default as (\w+)[^}]*\}\s*from\s*'(\.[^']+\.vue)'/g;

const api: ApiOptions = {
  root: join(ROOT, 'packages/vue/src/components'),
  uiRoot: join(ROOT, 'packages/ui/src'),
  tsconfig: join(ROOT, 'docs/.vitepress/tsconfig.api.json')
};

interface Doc {
  url: string;
  description: string;
}

// every `::: api`: the component's file → its page, and the prose under its `###`
function docs(): Map<string, Doc> {
  const found = new Map<string, Doc>();

  for (const relativePath of pages(DOCS)) {
    const src = readPage(DOCS, relativePath);
    const lines = src.split('\n');
    const fenced = fences(lines);
    const url = SITE + pagePath(relativePath);
    let prose: string[] = [];

    lines.forEach((line, index) => {
      if (fenced[index]) return;
      if (/^#{1,3}\s/.test(line)) prose = [];
      const arg = line.match(/^::: api\s+(.+?)\s*$/)?.[1];
      if (arg) {
        const file = apiFile(api, arg, relativePath);
        const own = plain(prose.join('\n').trim().split(/\n\s*\n/)[0] ?? '');
        const summary = describe(src);
        if (!found.has(file)) found.set(file, { url, description: [summary, own].filter(Boolean).join('\n\n') });
        // a part with no `::: api` of its own falls back to its folder's page
        found.set(dirname(file), found.get(dirname(file)) ?? { url, description: summary });
        prose = [];
      } else if (!/^#{1,3}\s/.test(line) && !line.startsWith(':::')) {
        prose.push(line);
      }
    });
  }
  return found;
}

function pages(dir: string, base = ''): string[] {
  return readdirSync(join(dir, base), { withFileTypes: true }).flatMap((entry) => {
    const path = join(base, entry.name);
    if (entry.isDirectory()) return entry.name.startsWith('.') ? [] : pages(dir, path);
    return entry.name.endsWith('.md') ? [path] : [];
  });
}

function plain(text: string): string {
  return text
    .replace(/\]\((\/[^)\s]*)\)/g, (_, link: string) => `](${SITE}${link.slice(1)})`)
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

function component(name: string, module: string, file: string, doc: Doc | undefined) {
  const { sections } = readApi(api, file);
  const rows = (title: string) => sections.find((section) => section.title === title)?.rows ?? [];

  return {
    name,
    source: { module, symbol: name },
    description: doc?.description || undefined,
    'doc-url': doc?.url,
    props: rows('Props').map((row) => ({
      name: row.name,
      type: row.type,
      default: row.default || undefined,
      required: row.required || undefined,
      description: row.description || undefined
    })),
    slots: rows('Slots').map((row) => ({
      name: row.name.replace(/^#/, ''),
      description: row.description || undefined,
      'vue-properties': row.fields?.map((field) => ({
        name: field.name,
        type: field.type,
        description: field.description || undefined
      }))
    })),
    js: {
      events: rows('Events').map((row) => ({
        name: row.name.replace(/^@/, ''),
        description: [row.description, row.type && `Receives \`${row.type}\`.`].filter(Boolean).join(' ')
      }))
    }
  };
}

const dir = process.cwd();
const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
const pages_ = docs();
const components = ENTRIES.flatMap((entry) => {
  let source: string;
  try {
    source = readFileSync(join(dir, 'src', entry), 'utf8');
  } catch {
    return [];
  }
  const module = entry === 'index.ts' ? pkg.name : `${pkg.name}/${basename(entry, '.ts')}`;
  return [...source.matchAll(EXPORT)].map(([, name, path]) => {
    const file = resolve(dir, 'src', path);
    return component(name, module, file, pages_.get(file) ?? pages_.get(dirname(file)));
  });
});

const webTypes = {
  $schema: 'https://json.schemastore.org/web-types',
  name: pkg.name,
  version: pkg.version,
  framework: 'vue',
  'js-types-syntax': 'typescript',
  'description-markup': 'markdown',
  contributions: { html: { 'vue-components': components } }
};

writeFileSync(join(dir, 'dist/web-types.json'), JSON.stringify(webTypes));
console.log(`web-types: ${components.length} components → ${relative(ROOT, join(dir, 'dist/web-types.json'))}`);
