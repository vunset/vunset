import type { MarkdownRenderer } from 'vitepress';
import { quote, section, type Section } from './sections.ts';

// `## Anatomy`, `## Examples` and `## Keyboard` → a <SectionFrame>: the `##`
// heading beside, the section's text in a <SectionCard>. Examples, when there
// are two or more, become <ExampleTabs>, a tab per `###`, with any text before
// the first `###` under the heading.
export function framesContainer(md: MarkdownRenderer) {
  md.core.ruler.before('normalize', 'framed-sections', (state) => {
    state.src = frames(state.src);
  });
}

const TITLES = ['Examples'];

export function frames(src: string): string {
  const lines = src.split('\n');
  const found = TITLES.map((title) => section(lines, title)).filter((item): item is Section => item !== null);

  // from the bottom up, so each section's lines are still where they were found
  for (const item of found.sort((a, b) => b.start - a.start)) {
    const tabs = lines[item.start].includes('Examples') && item.items.length > 1;
    lines.splice(item.start, item.end - item.start, ...(tabs ? exampleTabs(lines, item) : frame(lines, item)));
  }
  return lines.join('\n');
}

const slot = (name: string, body: string[]) => [`<template #${name}>`, '', ...body, '', '</template>'];

function frame(lines: string[], { start, end }: Section): string[] {
  return [
    '',
    '<SectionFrame>',
    ...slot('title', [lines[start]]),
    '<SectionCard>',
    '',
    ...lines.slice(start + 1, end),
    '',
    '</SectionCard>',
    '</SectionFrame>',
    ''
  ];
}

function exampleTabs(lines: string[], { start, lead, items }: Section): string[] {
  return [
    '',
    `<ExampleTabs :items="[${items.map((item) => quote(item.label)).join(', ')}]">`,
    ...slot('title', [lines[start]]),
    ...(lead.some((line) => line.trim()) ? slot('lead', lead) : []),
    ...items.flatMap((item, index) => slot(`example-${index}`, item.lines)),
    '</ExampleTabs>',
    ''
  ];
}
