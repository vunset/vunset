/** An SVG file split into its root's attributes and its markup, to render in an `<svg>` of one's own. */
export interface InlineSvg {
  attrs: Record<string, string>;
  content: string;
}

const ROOT_TAG = /<svg\b([^>]*)>([\s\S]*)<\/svg\s*>/i;
const ATTRIBUTE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;

const NOT_INHERITED = new Set(['width', 'height', 'xmlns', 'xmlns:xlink', 'version', 'id']);

/**
 * Splits an SVG file for rendering under another root: fills become
 * `currentColor`, so one file takes any color, and the root's size, id and
 * namespace are dropped. `null` when there is no `<svg>` in it.
 */
export function parseInlineSvg(raw: string): InlineSvg | null {
  const recolored = raw.replace(/\n/g, '').replace(/fill="(?!none")[^"]*"/g, 'fill="currentColor"');
  const match = ROOT_TAG.exec(recolored);

  if (!match) return null;

  const attrs: Record<string, string> = {};
  ATTRIBUTE.lastIndex = 0;

  for (let attribute = ATTRIBUTE.exec(match[1]); attribute !== null; attribute = ATTRIBUTE.exec(match[1])) {
    const [, name, value] = attribute;
    if (!NOT_INHERITED.has(name.toLowerCase())) {
      attrs[name] = value;
    }
  }

  return { attrs, content: match[2] };
}
