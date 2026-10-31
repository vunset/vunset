import type { MarkdownRenderer } from 'vitepress';

// Every table, hand-written or from `::: api`, scrolls sideways inside <ScrollTable>.
// The scroll area takes focus while it overflows, so the table drops VitePress's tabindex.
export function scrollTable(md: MarkdownRenderer) {
  md.renderer.rules.table_open = () => '<ScrollTable>\n<table>\n';
  md.renderer.rules.table_close = () => '</table>\n</ScrollTable>\n';
}
