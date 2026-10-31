import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseInlineSvg } from '@vunset/utils';

export interface SpriteIcon {
  name: string;
  svg: string;
}

export interface Sprite {
  svg: string;
  /** The names drawn, in order. */
  names: string[];
  /** Files with no `<svg>` in them. */
  invalid: string[];
}

/** The `.svg` files of each folder, in order; a name an earlier folder has is left out. */
export function readIcons(folders: string[]): SpriteIcon[] {
  const icons = new Map<string, string>();
  for (const folder of folders) {
    if (!existsSync(folder)) continue;
    for (const file of readdirSync(folder).filter((file) => file.endsWith('.svg')).sort()) {
      const name = basename(file, '.svg');
      if (!icons.has(name)) icons.set(name, readFileSync(join(folder, file), 'utf8'));
    }
  }
  return [...icons].map(([name, svg]) => ({ name, svg }));
}

/**
 * One `<symbol>` per icon, parsed as an inline icon is: fills become
 * `currentColor`, and the root's own attributes (`viewBox`, a stroke) move to
 * the symbol, so a stroke icon keeps its stroke.
 */
export function buildSprite(icons: SpriteIcon[]): Sprite {
  const names: string[] = [];
  const invalid: string[] = [];
  const symbols: string[] = [];

  for (const { name, svg } of icons) {
    const parsed = parseInlineSvg(svg);
    if (!parsed) {
      invalid.push(name);
      continue;
    }
    // `Icon` draws a sprite icon with `fill="none"`, which a shape with no fill
    // of its own would inherit through `<use>`: such a file is filled, as it is alone.
    const attrs = { fill: 'currentColor', ...parsed.attrs };
    const attributes = Object.entries(attrs)
      .map(([key, value]) => ` ${key}="${value}"`)
      .join('');
    symbols.push(`<symbol id="${name}"${attributes}>${parsed.content.trim()}</symbol>`);
    names.push(name);
  }

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" style="display: none">\n${symbols.join('\n')}\n</svg>\n`,
    names,
    invalid
  };
}
