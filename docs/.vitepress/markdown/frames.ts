import type { MarkdownRenderer } from 'vitepress';
import { fences, quote, section, type Section } from './sections.ts';

// `## Examples` → <Examples>, one window. Two or more `###` become tabs beside
// it, any text before the first `###` under the heading; a single example keeps
// its `##` above the window. Inside, each run of text is a card of its own,
// between the previews and code blocks.
export function framesContainer(md: MarkdownRenderer) {
  md.core.ruler.before('normalize', 'framed-sections', (state) => {
    state.src = frames(state.src);
  });
}

export function frames(src: string): string {
  const lines = src.split('\n');
  const found = section(lines, 'Examples');
  if (!found) return src;

  const tabs = found.items.length > 1;
  lines.splice(found.start, found.end - found.start, ...(tabs ? exampleTabs(lines, found) : example(lines, found)));
  return lines.join('\n');
}

const slot = (name: string, body: string[]) => [`<template #${name}>`, '', ...body, '', '</template>'];

function example(lines: string[], { start, end }: Section): string[] {
  return [lines[start], '', '<Examples>', '', ...cards(lines.slice(start + 1, end)), '', '</Examples>', ''];
}

function exampleTabs(lines: string[], { start, lead, items }: Section): string[] {
  return [
    '',
    `<Examples :items="[${items.map((item) => quote(item.label)).join(', ')}]">`,
    ...slot('title', [lines[start]]),
    ...(lead.some((line) => line.trim()) ? slot('lead', lead) : []),
    ...items.flatMap((item, index) => slot(`example-${index}`, cards(item.lines))),
    '</Examples>',
    ''
  ];
}

// text runs wrapped in `.example-text`; previews (already expanded to
// <Preview>, or still `::: preview`) and fenced code left as they are
const OPEN = /^(?:<Preview\b|:::\s*preview\b)/;
const CLOSE = /^(?:<\/Preview>|:::)\s*$/;

function cards(lines: string[]): string[] {
  const fenced = fences(lines);
  const out: string[] = [];
  let text: string[] = [];
  let preview = false;

  const flush = () => {
    if (text.some((line) => line.trim())) out.push('', '<div class="example-text">', '', ...text, '', '</div>', '');
    text = [];
  };

  lines.forEach((line, index) => {
    if (!fenced[index] && !preview && OPEN.test(line)) preview = true;
    if (fenced[index] || preview) {
      flush();
      out.push(line);
      // a blank line after, or markdown-it reads what follows as part of the HTML
      if (preview && !fenced[index] && CLOSE.test(line)) {
        preview = false;
        out.push('');
      }
      return;
    }
    text.push(line);
  });
  flush();
  return out;
}
