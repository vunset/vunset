# Changelog

All four packages are released together under one version.

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
