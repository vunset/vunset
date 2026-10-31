import { readFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import type { MarkdownRenderer } from 'vitepress';
import { sourceContainer } from './source-container';

const STYLE_IMPORT = /^import ['"]([^'"]+\.css)['"];?\n/gm;
const COMPONENT_IMPORT = /^import \w+ from ['"](\.{1,2}\/[^'"]+\.vue)['"];?$/gm;
const DEMO_OUTPUT = /\n(?:[ \t]*\n)*[ \t]*<DemoOutput\b[^>]*>[\s\S]*?<\/DemoOutput>[ \t]*(?=\n)/g;

export function previewContainer(md: MarkdownRenderer, { root }: { root: string }) {
  sourceContainer(md, 'preview', ({ arg, body, env }) => {
    const demo = join(root, `${arg}.vue`);
    const source = readFileSync(demo, 'utf8');

    const files = [
      { path: demo, code: source.replace(DEMO_OUTPUT, '') },
      ...[...source.matchAll(COMPONENT_IMPORT), ...source.matchAll(STYLE_IMPORT)].map((match) => {
        const path = resolve(dirname(demo), match[1]);
        return { path, code: readFileSync(path, 'utf8') };
      })
    ].map(({ path, code }) => ({ path, lines: code.trimEnd().split('\n') }));

    env.includes?.push(...files.map((file) => file.path));

    const names = JSON.stringify(files.map((file) => basename(file.path))).replace(/"/g, "'");
    const counts = JSON.stringify(files.map((file) => file.lines.length));

    const out = [`<Preview src="${arg}" :files="${names}" :lines="${counts}">`];
    if (body.some((line) => line.trim())) out.push('', ...body, '');
    files.forEach((file, index) =>
      out.push(`<template #file-${index}>`, '', ...fence(file.path, file.lines), '', '</template>')
    );
    out.push('</Preview>');
    return out;
  });
}

function fence(path: string, lines: string[]): string[] {
  const longest = Math.max(2, ...lines.flatMap((line) => line.match(/`+/g) ?? []).map((run) => run.length));
  const marker = '`'.repeat(longest + 1);
  return [marker + extname(path).slice(1), ...lines, marker];
}
