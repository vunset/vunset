# AGENTS.md

Guidance for coding agents working in this repository. `CLAUDE.md` files only
import the `AGENTS.md` beside them.

## What this is

vunset: a headless, unstyled Vue 3 component library.

An npm-workspaces monorepo:

- `packages/vue` — `@vunset/vue`, the headless parts, for an app crafting its
  own UI. Most of this file is about it; bare `src/`, `test/` and `specs/` paths
  below mean `packages/vue/`'s.
- `packages/ui` — `@vunset/ui`, ready-to-use components composed from
  `@vunset/vue`'s parts, with their CSS. Depends on it; never the other way
  round. Its naming, styling and props rules are in `packages/ui/AGENTS.md`.
  A component holds no behavior of its own: a gap it finds is fixed in
  `@vunset/vue`.
- `packages/utils` — `@vunset/utils`, plain functions (date, number, chart
  colors, SVG parsing). Depends on nothing, and `@vunset/vue` re-exports it.
- `packages/nuxt` — `@vunset/nuxt`, a Nuxt module registering both packages'
  components and composables. Its rules are in `packages/nuxt/AGENTS.md`.
- `docs/` (VitePress) stays at the root and imports the packages by name.
  It holds only pages; the theme and demos live in `docs/.vitepress/`. Read
  `.agents/docs.md` before touching either. `vite.aliases.ts` points the
  package names at each package's `src/` for the docs and the tests; only
  `build:lib` goes through `dist/`.

## Plan

`TASKS.md`, local and git-ignored, holds what is still open. Read it at the
start of a session when it exists; add follow-ups as work lands, and delete an
item once it is done.
Rules and decisions go beside the code they govern, in `packages/ui/AGENTS.md`,
`packages/nuxt/AGENTS.md` and `.agents/`, not in `TASKS.md`.

## Behavior comes from specs, not other libraries' source

A component's behavior is defined by its tests and, where one exists, its
`specs/<name>.md`. Implement from those. Other libraries may be used to
learn what a component should _do_, but never read or translate their source
into this repo — that is how adapted code (and an attribution obligation) gets
in. Write a behavior spec first when a component's rules are not obvious.

## Commands

```
npm run dev         # docs, http://localhost:5179
npm run build       # vitepress build docs
npm run build:lib   # every package into its own dist/, utils → vue → ui
npm run typecheck   # vue-tsc --noEmit, all packages and the docs
npm test            # vitest run (whole suite, projects `utils`, `vue`, `ui`)
npm run test:watch  # vitest, watch mode
npx vitest run packages/vue/test/select.test.ts          # a single file
npx vitest run packages/vue/test/select.test.ts -t "name" # a single test by name
npx vitest run --project utils                            # one package
```

`build:lib` runs the workspaces in the order `package.json` lists them, because
each package's declarations read its dependency's built `dist/`. Keep that order
when adding a package.

Run `npx vue-tsc --noEmit`, `npx vitest run`, and `npm run build` before
calling anything done, plus `npm run build:lib` when a change touches a
package's entry or what it imports from another package.

## Releasing

All four packages share one version, their `@vunset/*` dependencies pinned to
it exactly. `npm run bump -- <version>` sets it everywhere; add the entry to
`CHANGELOG.md`; `npm run release` publishes utils → vue → ui → nuxt, a
prerelease (`1.0.0-rc.2`) under the `next` tag (`-- --dry-run` to check).

## File layout

- `src/components/<name>/` holds everything only that component uses: its
  `.vue` parts plus any composable or helper nobody else imports
  (`range/use-range.ts`, `range/range-math.ts`).
- `src/shared/` holds internal code used by two or more components
  (`use-listbox.ts`, `use-field.ts`, `merge-props.ts`). Not exported.
- `src/composables/` holds only public composables an app calls itself:
  `use-clipboard.ts`, `use-toast.ts`, `use-virtual-list.ts`.
- Anything that is just a function over plain values goes in
  `packages/utils/src/` instead (`date.ts`, `number.ts`, `chart.ts`), imports
  nothing from Vue or any other package, and is imported as `@vunset/utils`. Its
  tests run in a `node` environment, so a helper that reaches for the DOM fails
  there.
- `.ts` files are kebab-case; `.vue` components stay PascalCase.
- `src/index.ts` exports components, their state/prop types, CSS-variable
  constants, public composables, and re-exports `@vunset/utils` — never internal
  composables or contexts. Tests reach internals by path.
- A component whose optional peer dependency the rest of the library never
  touches gets an entry of its own instead: `src/chart.ts` (`@tanstack/charts`)
  and `src/data-table.ts` (`@tanstack/vue-table`), published as
  `@vunset/vue/chart` and `/data-table`. `src/index.ts` must never reach an
  optional peer, or an app without it installed fails to resolve the import.
- Dev-only code is guarded by `process.env.NODE_ENV !== 'production'`, which the
  app's bundler replaces. Not `import.meta.env.DEV`: library mode bakes that in
  as `false` at build time, so the warnings would never reach the app.

## Root → Part

A compound component is a root plus parts, e.g.
`src/components/dialog/DialogRoot.vue` → `DialogTrigger.vue`.

1. **`XxxRoot.vue`** owns state and behavior, or calls the composable that
   does. It `provide`s a context created by `createContext` holding one props
   bag per part (`triggerProps`, `popupProps`, ...) plus a `state` object, and
   renders `<slot v-bind="state" />`.
2. **Part components** (`XxxTrigger.vue`, `XxxPanel.vue`, ...) call
   `useXxxContext()` for their props bag, merge it with the caller's own attrs
   via `usePartProps`, and render `<Part :as="props.as">` (`src/shared/part.ts`)
   with `inheritAttrs: false`. Not `<component :is>`: it resolves a string
   like `'button'` to an app's globally registered `Button` first. They contain
   no behavior of their own — everything lives in the root or its composable,
   never duplicated in a part.

**Start in the root, not in a composable.** A `useXxx.ts` earns its place only
when two roots need it, or the family needs more than one composable. Read
`.agents/architecture.md` before adding or moving one; it also covers prop
merging, controlled state, dismissal, exit animations, the shared surface parts
and the listbox engine.

## Styling contract

Every rendered part carries a `data-part` attribute plus `data-*` state hooks
generated by `dataAttrs` (`src/shared/data-attrs.ts`) from the composable's
`state` object (`data-open`, `data-disabled`, `data-enter-from`, ...).
That's the sole styling contract — no classes, no inline conditionals in the
template.

## Tests

Vitest + `@vue/test-utils`, one file per feature area in `test/`. A new case is
a docs demo on the component's page, which the SSR suite renders and hydrates.
jsdom has gaps that have made assertions vacuous before: mutate a fix and
confirm the matching test fails before trusting it. `.agents/testing.md` lists
the gaps and the fakes that cover them.

## Detailed references

Read the one that matches the work before starting it:

- `.agents/architecture.md` — when a composable earns its place, prop merging
  and event prevention, surfaces, controlled state, dismissal, exit animations,
  Select/Combobox engine.
- `.agents/charts.md` — `ChartRoot`, its parts, and what is built around
  `@tanstack/charts`.
- `.agents/docs.md` — page structure, demos and their CSS, the theme, VitePress
  pinning and build, the SSR suite.
- `.agents/testing.md` — jsdom gaps, layout fakes, Vue's dropped-click timing.
- `packages/ui/AGENTS.md`, `packages/nuxt/AGENTS.md` — each package's rules and
  decisions.
