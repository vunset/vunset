import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import type { DefaultTheme, Plugin, SiteConfig } from 'vitepress';
import { apiFile, apiMarkdown, readApi, type ApiOptions } from './markdown/api.ts';
import { demoFiles, fence } from './markdown/preview.ts';
import { fences } from './markdown/sections.ts';
import { scan } from './markdown/source-container.ts';
import { describe, readPage } from './seo.ts';

export interface LlmsOptions {
  demos: string;
  api: ApiOptions;
  /** `https://vunset.com/`: the origin with the base. */
  url: string;
  /** Under the `# Vunset` of `llms.txt` and `llms-full.txt`. */
  intro: string;
}

interface Page {
  path: string;
  title: string;
  description: string;
}

interface Group {
  title: string;
  pages: Page[];
}

const PREVIEW = /^::: preview\s+(.+?)\s*$/;
const API = /^::: api\s+(.+?)\s*$/;
const SNIPPET = /^<<<\s+(\S+)\s*$/;
const SIDEBARS: [key: string, label: string][] = [
  ['/', '@vunset/vue'],
  ['/ui/', '@vunset/ui'],
  ['/nuxt/', '@vunset/nuxt']
];

// A page with each demo's source and API table written out, where the site renders them from files.
export function pageMarkdown(options: LlmsOptions, srcDir: string, relativePath: string): string {
  const env = { relativePath };
  let src = readPage(srcDir, relativePath);

  // a sheet or component several demos import is written out under the first one
  const shown = new Set<string>();
  src = scan(src, PREVIEW, ({ arg, body }) => [
    ...body,
    '',
    ...demoFiles(options.demos, arg).flatMap(({ path, lines }, index) => {
      if (index > 0 && shown.has(path)) return [];
      shown.add(path);
      const [open, ...rest] = fence(path, lines);
      return [`${open} [${basename(path)}]`, ...rest, ''];
    })
  ], env);

  src = scan(src, API, ({ arg }) => ['', ...apiMarkdown(readApi(options.api, apiFile(options.api, arg, relativePath)))], env);

  const lines = src.split('\n');
  const fenced = fences(lines);
  const dir = dirname(resolve(srcDir, relativePath));
  src = lines
    .flatMap((line, index) => {
      const snippet = !fenced[index] && line.match(SNIPPET)?.[1];
      if (!snippet) return [line];
      const file = snippet.startsWith('@/') ? resolve(srcDir, snippet.slice(2)) : resolve(dir, snippet);
      const [open, ...rest] = fence(file, readFileSync(file, 'utf8').trimEnd().split('\n'));
      return [`${open} [${basename(file)}]`, ...rest];
    })
    .join('\n');

  // site links → absolute, so they still lead somewhere outside the site
  src = src.replace(/\]\((\/[^)\s]*)\)/g, (_, link: string) => `](${options.url}${link.slice(1)})`);

  return src.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// the sidebars' groups, in their order; a page no sidebar lists isn't in the index
function groups(site: SiteConfig<DefaultTheme.Config>): Group[] {
  const sidebar = site.site.themeConfig.sidebar as DefaultTheme.SidebarMulti;
  const out: Group[] = [];

  for (const [key, label] of SIDEBARS) {
    const items = sidebar[key];
    if (!Array.isArray(items)) continue;
    for (const group of items) {
      const pages = (group.items ?? [])
        .filter((item) => item.link)
        .map((item) => page(site, item.link!.replace(/^\//, ''), item.text ?? ''));
      if (pages.length) out.push({ title: `${label}: ${group.text}`, pages });
    }
  }

  return out;
}

function page(site: SiteConfig, path: string, text: string): Page {
  const src = readPage(site.srcDir, `${path}.md`);
  const title = src.match(/^#\s+(.+)$/m)?.[1].replace(/`/g, '') ?? text;
  const set = readFileSync(join(site.srcDir, `${path}.md`), 'utf8').match(/^---\n[\s\S]*?^description:\s*(.+)$/m)?.[1];
  return { path, title, description: set?.trim() || describe(src) };
}

export function llmsTxt(options: LlmsOptions, site: SiteConfig<DefaultTheme.Config>): string {
  const sections = groups(site).flatMap((group) => [
    `## ${group.title}`,
    '',
    ...group.pages.map((entry) => {
      const link = `- [${entry.title}](${options.url}${entry.path}.md)`;
      return entry.description ? `${link}: ${entry.description}` : link;
    }),
    ''
  ]);

  return [
    '# Vunset',
    '',
    `> ${site.site.description}`,
    '',
    options.intro,
    '',
    `Every page below in one file: ${options.url}llms-full.txt`,
    '',
    ...sections,
    '## Optional',
    '',
    `- [Changelog](${options.url}changelog.md)`,
    ''
  ].join('\n');
}

export function llmsFullTxt(options: LlmsOptions, site: SiteConfig<DefaultTheme.Config>): string {
  const pages = groups(site).flatMap((group) => group.pages);
  return [
    '# Vunset',
    '',
    `> ${site.site.description}`,
    '',
    options.intro,
    '',
    ...pages.flatMap((entry) => [
      '---',
      '',
      `Source: ${options.url}${entry.path}`,
      '',
      pageMarkdown(options, site.srcDir, `${entry.path}.md`)
    ])
  ].join('\n');
}

// every page's markdown copy beside its HTML, then the two indexes
export function writeLlms(options: LlmsOptions, site: SiteConfig<DefaultTheme.Config>) {
  for (const relativePath of site.pages) {
    if (relativePath === 'index.md' || relativePath === '404.md') continue;
    const file = join(site.outDir, relativePath);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, pageMarkdown(options, site.srcDir, relativePath));
  }
  writeFileSync(join(site.outDir, 'llms.txt'), llmsTxt(options, site));
  writeFileSync(join(site.outDir, 'llms-full.txt'), llmsFullTxt(options, site));
}

// the same files from the dev server, made on each request
export function llmsDev(options: LlmsOptions): Plugin {
  let site: SiteConfig<DefaultTheme.Config>;

  return {
    name: 'vunset:llms',
    apply: 'serve',
    configResolved(config) {
      site = (config as unknown as { vitepress: SiteConfig<DefaultTheme.Config> }).vitepress;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // the dev client imports each page as `<page>.md`: that request is Vite's, not a reader's
        const dest = req.headers['sec-fetch-dest'];
        if ((dest && dest !== 'document' && dest !== 'empty') || req.url?.includes('?')) return next();
        const path = decodeURIComponent((req.url ?? '').split('?')[0]).slice(site.site.base.length);
        let body: string | undefined;
        if (path === 'llms.txt') body = llmsTxt(options, site);
        else if (path === 'llms-full.txt') body = llmsFullTxt(options, site);
        else if (path.endsWith('.md') && path !== 'index.md' && !path.includes('..') && existsSync(join(site.srcDir, path))) {
          body = pageMarkdown(options, site.srcDir, path);
        }
        if (body === undefined) return next();
        res.setHeader('Content-Type', `text/${path.endsWith('.md') ? 'markdown' : 'plain'}; charset=utf-8`);
        res.end(body);
      });
    }
  };
}
