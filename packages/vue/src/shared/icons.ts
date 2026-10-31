import { parseInlineSvg, type InlineSvg } from '@vunset/utils';

export type InlineIcons = Record<string, () => Promise<string>>;

let sprite = '/sprite.svg';
let inlineIcons: InlineIcons = {};

// Per name, so a table of 5k icons looks up and parses each file once.
const found = new Map<string, (() => Promise<string>) | undefined>();
const parsed = new Map<string, Promise<InlineSvg | null>>();
// What has already arrived, so the next icon of that name draws in its first render.
const loaded = new Map<string, InlineSvg | null>();

// The layer under the app's: markup a library ships, parsed on first use and drawn at once.
const defaults = new Map<string, string>();
const defaultsParsed = new Map<string, InlineSvg | null>();

export interface ConfigureIconsOptions {
  /** Where the sprite is served from. @default '/sprite.svg' */
  sprite?: string;
  /** The folder, already globbed. See {@link InlineIcons}. */
  inline?: InlineIcons;
}

/**
 * Tells `Icon` where the icons are. Call it once, wherever the app starts.
 *
 * ```ts
 * configureIcons({
 *   sprite: '/sprite.svg',
 *   inline: import.meta.glob('./assets/icons/*.svg', { query: '?raw', import: 'default' }),
 * });
 * ```
 */
export function configureIcons(options: ConfigureIconsOptions): void {
  if (options.sprite !== undefined) {
    sprite = options.sprite;
  }

  if (options.inline !== undefined) {
    inlineIcons = options.inline;
    found.clear();
    parsed.clear();
    loaded.clear();
  }
}

export function iconSprite() {
  return sprite;
}

/**
 * Icons a library ships, under the app's: a name the app's `inline` folder has
 * wins. Markup, not loaders, so they draw in the render that asks for them.
 *
 * ```ts
 * registerDefaultIcons({ close: '<svg viewBox="0 0 16 16">…</svg>' });
 * ```
 */
export function registerDefaultIcons(icons: Record<string, string>): void {
  for (const [name, markup] of Object.entries(icons)) {
    defaults.set(name, markup);
    defaultsParsed.delete(name);
  }
}

/** A default icon, parsed; `undefined` when the defaults have no such name. */
export function defaultIcon(name: string): InlineSvg | null | undefined {
  const markup = defaults.get(name);
  if (markup === undefined) return undefined;

  if (!defaultsParsed.has(name)) defaultsParsed.set(name, parseInlineSvg(markup));
  return defaultsParsed.get(name);
}

/** Whether the app's inline icons or the defaults have `name`. A sprite isn't asked: it can't say. */
export function hasIcon(name: string): boolean {
  return findInlineIcon(name) !== undefined || defaults.has(name);
}

export function findInlineIcon(name: string): (() => Promise<string>) | undefined {
  if (!found.has(name)) {
    const target = `${name}.svg`;
    const entry = Object.entries(inlineIcons).find(([path]) => path === target || path.endsWith(`/${target}`));
    found.set(name, entry?.[1]);
  }
  return found.get(name);
}

/** The parsed file, shared by every icon of that name. `undefined` when there is no such file. */
export function loadInlineIcon(name: string): Promise<InlineSvg | null> | undefined {
  const load = findInlineIcon(name);
  if (!load) return undefined;

  let entry = parsed.get(name);
  if (!entry) {
    entry = load().then((markup) => {
      const svg = parseInlineSvg(markup);
      loaded.set(name, svg);
      return svg;
    });
    // A failed read is retried by the next icon, not remembered.
    entry.catch(() => parsed.delete(name));
    parsed.set(name, entry);
  }
  return entry;
}

/** The parsed file, when an earlier icon has already loaded it. */
export function loadedInlineIcon(name: string): InlineSvg | null | undefined {
  return loaded.get(name);
}
