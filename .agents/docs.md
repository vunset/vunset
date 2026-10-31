# Docs

`docs/` (VitePress) stays at the root and imports the packages by name.

## Pages

`docs/` holds only pages: a `@vunset/vue` page sits in the folder of its
sidebar group (`docs/forms/select.md`, `docs/data/charts/area.md`),
`@vunset/ui`'s are all in `docs/ui/`. Pages stay plain markdown:
`## Anatomy`, `## Examples` and `## Keyboard` render as framed windows,
examples as tabs when there are two or more (`markdown/frames.ts`), and
`## API Reference` as cards (`markdown/api.ts`).

## Theme

The theme's components carry their Tailwind classes inline, on each element
they render; what they style inside a slot (the markdown's `p`, `h3`, a table's
cells) gets one parent class, written in the component's own `<style>`
(`@reference '../style.css'`), never as `[&_p]:` variants.
`theme/article.css` styles only the prose.

## Demos

What the pages render lives in `docs/.vitepress/` beside the theme: the demos
in `demos/`, one folder per page (`demos/select/`, `demos/ui/form-select/`).
Every case is a demo on its page, the heavy ones too (hundreds of options, size
matrices, deep nesting, collisions), under a plain heading toward the end of
`## Examples`.

VitePress bundles every sheet into one, so a demo's CSS sticks to its own
`demo-*` classes. A `@vunset/vue` demo uses no Tailwind utilities, its layout
wrappers included: they are `demo-*` classes in its own sheet, so the code tab
shows everything it takes.

## VitePress decisions

- **VitePress `2.0.0-alpha.20`, pinned;** needs Node 22+. Alphas rename options,
  so read the changelog before bumping. The build needs ~2 GB of heap (peak RSS
  ~2.8 GB): Node's default, sized from RAM, covers it, but a CI deploy (GitHub
  Pages) should set `NODE_OPTIONS=--max-old-space-size=4096`.
- **The build's chunk-size warning** is the docs pages: each preview's
  highlighted source is compiled into its page.
- **The SSR suite** (`packages/vue/test/ssr.test.ts`) renders every docs demo and
  hydrates it. Its vitest project aliases Vue to the ESM builds
  and inlines it (with `@tanstack`), so each case gets a fresh Vue; without that
  `vi.resetModules()` never reached Vue's CommonJS build and a mismatch was
  reported only once.
