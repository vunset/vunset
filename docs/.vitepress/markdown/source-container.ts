import type { MarkdownRenderer } from 'vitepress';

export interface SourceContainer {
  /** The rest of the opening line, after the container name. */
  arg: string;
  /** The lines between the markers. */
  body: string[];
  /** Level of the last heading above the container, 0 when there is none. */
  heading: number;
  /** The page's markdown env; `includes` re-renders the page when a listed file changes. */
  env: { includes?: string[]; relativePath?: string };
}

const FENCE = /^(`{3,}|~{3,})/;
const HEADING = /^(#{1,6})\s/;

// `::: <name> <arg>` ... `:::`, rewritten to markdown before parsing, so what it
// expands to (`<<<`, tables, headings) is handled by VitePress like hand-written text.
export function sourceContainer(md: MarkdownRenderer, name: string, expand: (container: SourceContainer) => string[]) {
  const open = new RegExp(`^::: ${name}\\s+(.+?)\\s*$`);

  md.core.ruler.before('normalize', `${name}-container`, (state) => {
    state.src = scan(state.src, open, expand, state.env);
  });
}

function scan(src: string, open: RegExp, expand: (container: SourceContainer) => string[], env: SourceContainer['env']) {
  const out: string[] = [];
  let fence: string | null = null;
  let heading = 0;
  let current: { line: string; arg: string; body: string[] } | null = null;

  for (const line of src.split('\n')) {
    // leave fenced code alone, so a page can show the syntax itself
    const marker = line.match(FENCE)?.[1];
    if (marker && !current) {
      if (!fence) fence = marker;
      else if (line.trim() === fence) fence = null;
    }
    if (fence) {
      out.push(line);
      continue;
    }

    if (!current) {
      const match = line.match(open);
      if (match) {
        current = { line, arg: match[1], body: [] };
        continue;
      }
      heading = line.match(HEADING)?.[1].length ?? heading;
      out.push(line);
    } else if (line.trim() === ':::') {
      out.push(...expand({ arg: current.arg, body: current.body, heading, env }));
      current = null;
    } else {
      current.body.push(line);
    }
  }

  // unclosed: leave it as written rather than swallow the rest of the page
  if (current) out.push(current.line, ...current.body);
  return out.join('\n');
}
