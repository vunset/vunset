import type { MarkdownRenderer } from 'vitepress';

const MANAGERS = [
  ['npm', 'npm install'],
  ['pnpm', 'pnpm add'],
  ['yarn', 'yarn add'],
  ['bun', 'bun add']
] as const;

const INSTALL = /^npm install /;

// A `sh` block of nothing but `npm install` lines → <InstallTabs>, the same
// lines once per package manager. Every line loses the same width, so trailing
// comments stay aligned.
export function installTabs(md: MarkdownRenderer) {
  const fence = md.renderer.rules.fence!;

  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]!;
    const lines = token.content.trimEnd().split('\n');
    if (token.info.trim() !== 'sh' || !lines.every((line) => INSTALL.test(line))) {
      return fence(tokens, index, options, env, self);
    }

    const content = token.content;
    const panels = MANAGERS.map(([name, command]) => {
      token.content = lines.map((line) => line.replace('npm install', command)).join('\n') + '\n';
      return `<template #${name}>${fence(tokens, index, options, env, self)}</template>`;
    });
    token.content = content;

    return `<InstallTabs>${panels.join('')}</InstallTabs>\n`;
  };
}
