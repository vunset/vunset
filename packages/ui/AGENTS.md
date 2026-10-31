# @vunset/ui

Ready-to-use components composed from `@vunset/vue`'s parts, with their CSS.
A component holds no behavior of its own: a gap it finds is fixed in
`@vunset/vue`.

## Rules

- **Naming.** `Form*` is anything holding a value a form submits (input, switch,
  checkbox, select, combobox, range, calendar, toggle group). `App*` is
  everything else (button, badge, drawer, popover, ...). Tabs and Pagination are
  `App*`: they navigate rather than submit a value.
- **CSS classes** follow the component name in kebab-case: `form-field`,
  `form-label`, `form-help`, `form-error`, `form-switch`, `app-badge`,
  `app-drawer`, `app-popover`. Part classes extend it: `form-switch-thumb`.
- **One stylesheet per component**, beside it (`form/form-switch.css`), listed in
  `src/all.css`. A component's sheet imports nothing, so a bundler never includes
  one twice; the build copies them flat into `dist/css/`, published as
  `@vunset/ui/css/<name>.css` beside `base.css` and `all.css`. Rules sit in
  `@layer components`; tokens are `--ui-*` on `:root` in `@layer theme`, the lowest,
  so an app's `:root` wins wherever it sits; colors via `light-dark()`.
  A new sheet goes in `all.css` after the sheets it builds on, or the cascade
  order changes, and in the "Needs first" table in `docs/ui/theming.md`.
- **A reset underneath.** Components assume Tailwind's Preflight or ui's own
  `preflight.css` (opt-in, not in `all.css`, `@layer base`): no `box-sizing`, and no
  margin/padding/border/background/color/font reset on a button or input in a
  component's sheet. `outline: none`, heading and paragraph margins, and rules that
  undo another class stay. `base.css` and `preflight.css` both open with
  Tailwind's `@layer theme, base, components, utilities;`, so ui loads before or
  after Tailwind alike; the Nuxt module adds `all.css` before the app's CSS.
- **`.form-control`** (`form/form-control.css`) is the box every `Form*` field
  draws its value in: height, padding, border, radius, type, focus ring, and its
  open/invalid/read-only/disabled looks. A field's own sheet adds only what is its
  own. AppButton writes its own box, the same height at `md`. AppGroup joins its
  children by finding `.form-control`, `.app-button` or a toggle group (a `toolbar`
  AppGroup spaces them instead, a bare `Separator` in it drawn as `app-separator`).
- **Props.** Every useful prop of the parts it wraps, plus `label`/`help`/`error`
  for `Form*`, plus conveniences specific to the component (e.g. show or hide the
  clear button on Select/Combobox). Default texts stay props.
- **Classes, not layout props.** No prop that only toggles a layout a class can
  do (`block` is gone from AppButton and AppTabs; `app-table-striped` and
  `app-table-numeric` are classes). `class` and `style` land on the outermost
  element (a `Form*`'s field); a one-control `Form*` puts its other attrs on
  the control (`aria-label`, `data-*`), split by `useFieldAttrs`
  (`form/use-field-attrs.ts`). Inner parts take
  `<part>-class` (`HTMLAttributes['class']`), merged beside their own:
  `control-class` on every `Form*`'s box, `popup-class` on anything with a
  popup, `trigger-class`, `backdrop-`/`header-`/`body-`/`footer-class` on the
  overlays, `tabs-`/`tab-`/`panel-`/`indicator-class` on AppTabs, and
  `table-`/`header-`/`body-`/`footer-`/`row-`/`th-`/`td-`/`tf-class` on
  AppDataTable (`table-class` on AppTable). Table cells inherit their
  `text-align` from `.app-table`, so a class there aligns them all.
- **A class-only look gets a thin component too** when that saves the app from
  knowing the class: AppAppear (`app-appear`), AppTable (`app-table`), AppGroup
  (`app-group`). Separator and Addon stay classes (`app-separator`, `form-addon`).
- **Used as they are, not wrapped:** `ScrollArea` and `DragRoot`/`DragItem` (an
  app mostly wants its own look).
- **Charts** (`@vunset/ui/chart`): AppChartArea, AppChartLine and AppChartBar
  are a `ChartRoot` of one series part per key in `categories`, with axes, grid,
  tooltip and legend, through the internal AppChartFrame; their slot takes more
  parts. AppChartDonut wraps `ChartDonut`, its legend opt-in. `app-chart.css` styles
  every chart part by `data-part`, composed or ready: the `--chart-color-N`
  palette on `:root`, the chart's `color` (TanStack paints axes and grid in
  `currentColor`), the legend, tooltip and donut-center parts at `:where()`
  specificity. Raw docs' wireframes set what it would otherwise leak.
- **Presentational pieces** with no headless part are ui's own: AppCard,
  AppEmptyState (AppAsyncState's views), AppSpinner (the one spinner:
  AppAsyncState, toasts; a loading AppButton draws stripes, a spinner only if put
  beside its label), AppDotMatrix, `kbd.css` styling every `<kbd>`, the
  `app-text-shimmer` class (masks the element itself, so its real text shimmers),
  and the `inverted` class (the other `color-scheme` from its parent's, read by a
  style query on a registered `light-dark()` probe, so it nests and needs no
  theme hook). They render `as` through `Part`, exported from `@vunset/vue`
  for that. No Avatar: a few lines an app writes itself.
- **Icons** ui draws go through AppIcon from `UI_ICONS`, so an app icon of the
  same name replaces them everywhere. No inline SVG in ui.
- **Optional peers** get their own entry: `@vunset/ui/chart`, `@vunset/ui/data-table` (AppDataTable),
  like `@vunset/vue/chart` and `/data-table`. The main entries never reach
  `@tanstack`.
- **Docs.** Every component gets a page in `docs/ui/`, demos in
  `docs/.vitepress/demos/ui/<page>/`; the ui sidebar mirrors the Vue
  sidebar's groups.

## Decisions

- **`light-dark()` and Vite.** Vite 8 minifies CSS with lightningcss, whose default
  targets rewrite `light-dark()` into `--lightningcss-light/-dark` variables that
  only a `color-scheme` in the same CSS sets; `useTheme()`'s inline one, or none,
  leaves ui's colors invalid. The Nuxt module excludes `Features.LightDark`;
  `docs/ui/get-started.md` tells a Vite app to. The docs work without it
  because their CSS declares `color-scheme`.
- **Overlay trigger attrs:** an attr that is also the overlay's own prop
  (`AppDialog`'s `size`, `AppDrawer`'s/`AppPopover`'s `side`) is taken by the
  overlay, not the trigger.
- **A select-all box** renders before the boxes it counts. `CheckboxGroup`'s
  `allValues` lets a server render get it right; `FormCheckboxGroup` passes its
  `options`, but with `FormCheckbox` children it still starts unchecked.
- **AppMeter's `tone`** is the app's call: the headless Meter has no
  low/high/optimum. Thresholds would be a `@vunset/vue` addition, if wanted.
- **AppDataTable's URL-synced sort** is the app's, through `sort-query` and a
  provided `routeQueryKey` (`docs/.vitepress/demos/data-table/SortInURL.vue`):
  ui doesn't depend on vue-router.
- **A toolbar AppGroup** is a bordered strip that resets what its tools draw to
  stand alone (a FormToggleGroup's track); a ToggleGroup in any toolbar doesn't
  wrap by default, so the arrows carry on past it (`specs/toggle-group.md`).
- **In AppGroup, a `Form*` keeps its field:** a `label` would sit above its box,
  so members take an `aria-label`. An outline button in a plain group takes a
  field's `--ui-bg` fill and `--ui-border` line, so a field and its button read
  as one box; elsewhere it stays unfilled, its border its tone.
