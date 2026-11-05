# Docs

`docs/` (VitePress) stays at the root and imports the packages by name.

## Pages

`docs/` holds only pages: a `@vunset/vue` page sits in the folder of its
sidebar group (`docs/forms/select.md`, `docs/data/charts/area.md`),
`@vunset/ui`'s are all in `docs/ui/`. Pages stay plain markdown:
`## Examples` renders as one window, a tab per `###` when there are two or
more, each run of text a card between its previews and code
(`markdown/frames.ts`); `## API Reference` as an accordion of cards
(`markdown/api.ts`).

## Theme

The theme's components carry their Tailwind classes inline, on each element
they render; what they style inside a slot (the markdown's `p`, `h3`, a table's
cells) gets one parent class, written in the component's own `<style>`
(`@reference '../style.css'`), never as `[&_p]:` variants.
`theme/article.css` styles only the prose.

Six color tokens (`docs-bg`, `-surface`, `-border`, `-text`, `-accent`,
`-danger`); muted text is `docs-text` at an opacity. A `window` (border, `bg`)
holds `card`s (`surface`). `<Frame>` draws the window unless an ancestor already
did: a preview, code block, table or install tabs on the page gets its own,
inside an example or the API reference it shows as bare cards. A card inside a
card redefines `--color-docs-surface` to `bg` for its children.

## Base path

The site is served from `https://vunset.com/` (`base` in `config.mts`, `/`
for now; the code below keeps a subpath working). Markdown links and CSS `url()`s get the base on their own; a
theme component's internal `href` goes through `withBase`, and compares the
page with `usePagePath()` (`theme/sidebar.ts`), never `route.path`, which
includes the base. A public file a script asks for starts from
`import.meta.env.BASE_URL` (the icon sprite in `theme/index.ts`).

## Search engines and assistants

- **`seo.ts`**: a page's description is the paragraph under its `# Title`
  (cut at a sentence, ~160 characters), unless its frontmatter sets
  `description:`, which a page opening with anything but prose needs. The title
  template says what the page is by its folder (`· Headless Vue Component`,
  `· Vue UI Component`). `transformHead` adds the canonical link, `og:*` and
  JSON-LD (the project on the home page, a breadcrumb elsewhere).
- **`llms.ts`**: every page is also written as `<page>.md` beside its HTML, with
  each `::: preview`'s files (a sheet several demos import, once) and each
  `::: api` as markdown tables, plus `llms.txt` (the sidebars as an index) and
  `llms-full.txt` (every page). The dev server serves the same files. A page no
  sidebar lists is left out of both indexes.
- **`scripts/web-types.ts`** runs at the end of the vue and ui builds and
  writes `dist/web-types.json` (the `web-types` field), from the same rows as
  the API tables, each component linked to the page whose `::: api` shows it
  (a part with none, to its folder's page), for JetBrains IDEs.
- **The deploy checks out the full history** (`fetch-depth: 0`): `lastUpdated`
  reads each page's git date for the sitemap's `lastmod`.

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
- **Deployed by `.github/workflows/docs.yml`** to GitHub Pages on every push to
  `main`.
- **The build's chunk-size warning** is the docs pages: each preview's
  highlighted source is compiled into its page.
- **The SSR suite** (`packages/vue/test/ssr.test.ts`) renders every docs demo and
  hydrates it. Its vitest project aliases Vue to the ESM builds
  and inlines it (with `@tanstack`), so each case gets a fresh Vue; without that
  `vi.resetModules()` never reached Vue's CommonJS build and a mismatch was
  reported only once.
