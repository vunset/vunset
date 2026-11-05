import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { HeadConfig, PageData } from 'vitepress';
import { fences } from './markdown/sections.ts';

const INCLUDE = /^<!--\s*@include:\s*(.+?)\s*-->$/gm;

// a page's markdown as written, `<!--@include: -->` resolved, frontmatter dropped
export function readPage(srcDir: string, relativePath: string): string {
  const file = resolve(srcDir, relativePath);
  return readFileSync(file, 'utf8')
    .replace(INCLUDE, (_, path: string) => readFileSync(resolve(dirname(file), path), 'utf8'))
    .replace(/^---\n[\s\S]*?\n---\n/, '');
}

const LIMIT = 160;

// The paragraph under the `# Title`, as plain text, cut at a sentence to fit a
// search snippet. Empty when the page opens with anything but prose.
export function describe(src: string): string {
  const lines = src.split('\n');
  const fenced = fences(lines);
  const title = lines.findIndex((line, index) => !fenced[index] && /^#\s/.test(line));
  if (title === -1) return '';

  let start = title + 1;
  while (start < lines.length && !lines[start].trim()) start++;
  const paragraph: string[] = [];
  for (let index = start; index < lines.length && lines[index].trim(); index++) paragraph.push(lines[index]);
  if (!paragraph.length || /^(:::|#|```|~~~|\||<|>|[-*+] |\d+\. )/.test(paragraph[0])) return '';

  const text = paragraph
    .join(' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*?([^*]+)\*\*?/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= LIMIT) return text;

  let fit = '';
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const next = fit ? `${fit} ${sentence}` : sentence;
    if (next.length > LIMIT) break;
    fit = next;
  }
  return fit || text.slice(0, text.lastIndexOf(' ', LIMIT - 1)).replace(/[,;:]$/, '') + '…';
}

const COMPONENT_GROUPS = /^(actions|forms|navigation|overlays|feedback|layout|data)\//;

// what a search result says the page is, beside its own title
export function titleTemplate(relativePath: string): string {
  if (/^ui\/(app|form)-/.test(relativePath)) return ':title · Vue UI Component - Vunset';
  if (relativePath.startsWith('ui/')) return ':title - Vunset UI';
  if (relativePath.startsWith('nuxt/')) return ':title - Vunset for Nuxt';
  if (COMPONENT_GROUPS.test(relativePath)) return ':title · Headless Vue Component - Vunset';
  if (relativePath.startsWith('utilities/')) return ':title · Vue Utility - Vunset';
  if (relativePath.startsWith('helpers/')) return ':title · TypeScript Helpers - Vunset';
  return ':title - Vunset';
}

export function pagePath(relativePath: string): string {
  return relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '');
}

const PACKAGES = [
  { prefix: 'ui/', name: '@vunset/ui', path: 'ui/get-started' },
  { prefix: 'nuxt/', name: '@vunset/nuxt', path: 'nuxt/get-started' },
  { prefix: '', name: '@vunset/vue', path: 'get-started' }
];

export interface Site {
  /** `https://vunset.com/`: the origin with the base. */
  url: string;
  description: string;
  version: string;
  repository: string;
}

export function pageHead(site: Site, pageData: PageData, title: string, description: string): HeadConfig[] {
  const path = pagePath(pageData.relativePath);
  const url = site.url + path;
  const home = path === '';

  const head: HeadConfig[] = [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:type', content: home ? 'website' : 'article' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: url }]
  ];

  if (home) {
    head.push(jsonLd({
      '@type': 'SoftwareSourceCode',
      name: 'Vunset',
      description: site.description,
      url: site.url,
      codeRepository: site.repository,
      programmingLanguage: ['TypeScript', 'Vue'],
      runtimePlatform: 'Vue 3',
      license: 'https://opensource.org/licenses/MIT',
      version: site.version
    }));
  } else if (path !== 'changelog') {
    const pkg = PACKAGES.find((entry) => pageData.relativePath.startsWith(entry.prefix))!;
    const trail = [
      { name: 'Vunset', item: site.url },
      { name: pkg.name, item: site.url + pkg.path },
      ...(path === pkg.path ? [] : [{ name: pageData.title, item: url }])
    ];
    head.push(jsonLd({
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb }))
    }));
  }

  return head;
}

function jsonLd(data: Record<string, unknown>): HeadConfig {
  // `<` escaped, so no value can close the script early
  const json = JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c');
  return ['script', { type: 'application/ld+json' }, json];
}
