# Changelog

All four packages are released together under one version.

## 1.0.0-rc.9

### @vunset/vue

- Right-to-left layouts swap the left and right arrow keys in tabs, toggle
  groups, toolbars, horizontal accordions, radio groups, menubars, menus,
  calendars, drag lists and timepickers. The direction is read from the
  focused element, `dir` or CSS `direction`.
- A submenu opens to the left in a right-to-left layout, and ArrowLeft opens
  it. Tabs' `data-activation-direction` names the side the selection moved to.
- `AvatarRoot`, `AvatarImage` and `AvatarFallback`: an image loaded before it's
  shown, so a broken one never appears, and a fallback until then.
- `NumberFieldRoot`, `NumberFieldInput`, `NumberFieldIncrement` and
  `NumberFieldDecrement`: a number typed in its locale and `format`, stepped by
  the buttons (held, they repeat), the arrow and Page keys, or the wheel;
  clamped to `min`/`max` on commit, submitted as the plain number.
- `OtpRoot` and `OtpInput`: a one-time code or PIN, one box per character, one
  value. Typing, Backspace and the arrows move along the boxes; a paste or a
  code offered from a message fills them all; `@complete` fires once full. Put
  boxes in a `Group` to join them.
- `useMediaQuery('(max-width: 1024px)')`: whether a media query matches, kept
  up to date as the window or a system setting changes.

### @vunset/ui

- AppAvatar: with no image, or a broken one, it shows the `#fallback` slot, the
  initials of `title` with `initials`, or `fallback` (`N/A`). `title` names it
  for screen readers and on hover. `size`, and the `app-avatar-square` class.
- FormNumberField: a number field with − and + buttons in a form control box.
- FormOtp: a one-time code field.
- AppNumberFlow rolls a changed digit on a wheel, up or down as the value moves.

### @vunset/utils

- `getInitials(name, max = 2)`: the first and the last word's initials,
  upper-cased.
- `parseNumber(text, { locale, ...format })` reads back what `formatNumber`
  writes: `'1.234,5'` in German is `1234.5`, `'12%'` is `0.12`. `null` for
  empty text, `NaN` for text that isn't a number.

## 1.0.0-rc.8

### @vunset/ui

- FormSelect, FormCombobox and FormToggleGroup take `v-model.object`: the model
  holds the whole option, matched by `value-key`, or by identity without one.
- FormCombobox's search text moves to a new line below the chips once it no
  longer fits beside them.
- An icon button at the start of a FormCombobox keeps its square width.

## 1.0.0-rc.7

### @vunset/vue

- `ComboboxRoot` and `SelectRoot` take `v-model:query`, the typed text: `''`
  while nothing is typed, and again once a choice is made. Setting it seeds or
  clears the search. Bound or listened to, the search is yours: the list shows
  `options` as given, unfiltered, unless a `filter` is passed.

### @vunset/ui

- FormSelect and FormCombobox take `loading`: the box draws a moving stripes and the list is marked busy, but it stays usable,
  so a search goes on typing.
- FormSelect's placeholder ellipsis is muted with the placeholder.

## 1.0.0-rc.6

### @vunset/vue

- `Input` and `Textarea` keep the caret where you type. With `v-model`, an
  edit in the middle threw it to the end.
- A collapsible's height follows content that changes while it's open.
- `ChartLegend` takes `isolate`: a click shows only that series, a second
  shows all again. Shift, Ctrl or ⌘ adds or removes one.
- A virtual table's `rowHeight` is set on each row as `height`.

### @vunset/ui

- Anything with a `title` takes `title-class`.
- FormCheckbox checked and disabled keeps its color, faded.
- AppChartArea, AppChartLine, AppChartBar and AppChartDonut take
  `legend-isolate`.

## 1.0.0-rc.5

### @vunset/vue

- `ChartDonut` takes `gap`: an even gap between slices, in pixels, the same
  width from the center to the edge, pie or ring; `:gap="0"` for none. It's a
  line in `--chart-gap-color`, the page's background by default; ui sets it to
  its own. `pad-angle`'s gaps, by an angle, still narrow towards the center.
- A pie (`arc-width="0"`) shows no total in its middle unless given a
  `central-label`, and `false` leaves out either line, as an empty string
  does.
- `ChartDonut` redraws at once again when a slice is toggled. Tweening its
  arcs swung a slice the long way round for a few frames.
- `ChartArea` takes `:gradient="false"` for an evenly filled band, and
  `:line="false"` to leave out the line along its top.
- `ChartAxis` takes `line`, drawing the axis' own line along the plot's edge,
  and `:tick-marks="false"`, leaving out the short mark at each label.

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
