# Changelog

All four packages are released together under one version.

## 1.0.0-rc.4

### @vunset/vue

- `ChartRoot`'s `x-scale` places the rows by their `x-key` value: `linear` for
  numbers, or a scale factory such as d3-scale's `scaleUtc` for a time axis.
  Bars stay on the default, `category`.
- `ChartAxis` takes a `label`, a title along the axis.
- `ChartTooltip` takes `mode="point"`, the one point nearest the pointer rather
  than the whole row, and `heading-format`, for a heading apart from the x
  axis' ticks.

### @vunset/ui

- AppChartArea, AppChartLine and AppChartBar take `x-label`, `y-label`,
  `tooltip-mode`, `tooltip-sticky` and `tooltip-heading-format`; AppChartArea
  and AppChartLine take `x-scale` too.

### @vunset/utils

- `toChartRows` turns records of one value each (a time, a node, a load)
  into a chart's rows: one per `x`, a key per series.

## 1.0.0-rc.3

### @vunset/vue

- `Input` with `v-model.number` keeps a decimal as it's typed. `1.` and `1.0`
  no longer collapse to `1` mid-keystroke, so `1.05` can be typed. A
  different number set from outside still replaces the text.

### @vunset/nuxt

- `useInfinityFetch` loads the next page on a zoomed page. Zoomed, the
  scrolled-to end could sit a fraction of a pixel short, and nothing loaded.

## 1.0.0-rc.2

### @vunset/vue

- No longer depends on `d3-shape`. A smooth line or area draws the same curve
  as before, with its own.

## 1.0.0-rc.1

Hello World!

### @vunset/vue

- **187 headless components**, parts included (`DialogRoot`, `DialogTrigger`, …),
  for actions, forms, navigation, overlays, feedback, layout and data, each a
  root plus parts styled through `data-*` attributes.
- Charts composed from parts at `@vunset/vue/chart` and the data table at
  `@vunset/vue/data-table`, each behind its own optional peer dependency.
- **9 public composables**, among them `useClipboard`, `useToast` and
  `useVirtualList`.

### @vunset/ui

- **51 ready-to-use components** built on `@vunset/vue`, with their CSS and a
  theme set through CSS variables. The charts and the data table have entries
  of their own, `@vunset/ui/chart` and `@vunset/ui/data-table`.

### @vunset/nuxt

- A Nuxt module that registers all **238 components**, the **9 composables** and the
  helpers from the packages, each chart and table only with its peer installed.

### @vunset/utils

- **51 helpers** and constants for dates, numbers, strings, CSV, chart colors,
  SVG and functions, with no dependencies.
