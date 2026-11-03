# Chart colors

How a chart is colored: the series palette, the axes and grid, and
`chartColors` for anything of your own that has to match.

::: preview chart/Colors
:::

## The palette

A series is colored `var(--chart-color-N)`, where `N` is its place among the
chart's series (or a slice's place in the data), counting from 0. Define the
variables once in your theme. To give one series another color, pass it a
`color`. A series keeps its color when another one is hidden.

Past the palette, the colors start over: the ninth series takes
`--chart-color-0` again. The palette is eight colors unless the chart's
`palette-size` says otherwise, so a theme defining more sets it to match.
A color your theme leaves undefined falls back to `currentColor`, the chart's
text color, rather than to nothing.

```css
:root {
  --chart-color-0: #5b8cff;
  --chart-color-1: #47d6a8;
  --chart-color-2: #ffa94d;
}
```

```vue
<template>
  <!-- A theme of eleven colors: the twelfth series takes the first again. -->
  <ChartRoot :data="rows" x-key="time" :palette-size="11">…</ChartRoot>
</template>
```

`ChartDonut` and a `ChartLegend` beside a chart take `palette-size` too.

## Axes and grid

The axes, their labels and the grid use the chart's text color, with the
grid fainter. Set `color` on the chart to recolor them all.
`--chart-tick-font-size` sizes the tick labels (11px by default), and the
axes make room for them. Everything else is a part you style like any other
element.

```css
[data-part='chart'] {
  --chart-tick-font-size: 0.75rem;
}
```

## Matching a chart

`chartColors` gives the same list a chart uses, for drawing something that
has to match it, such as a legend or table of your own:

```ts
import { chartColors } from '@vunset/utils';

chartColors(2); // ['var(--chart-color-0, currentColor)', 'var(--chart-color-1, currentColor)']
chartColors(2, '--series-', '#888'); // ['var(--series-0, #888)', 'var(--series-1, #888)']
chartColors(3, undefined, undefined, 2); // --chart-color-0, -1, then -0 again
```

They are `var()` references, not colors: they follow whatever your CSS sets
the variables to, light and dark mode included. It comes from
`@vunset/utils`; `@vunset/vue` exports it too, and
[`@vunset/nuxt`](/nuxt/get-started) imports it for you.

## API Reference

### chartColors

`(count: number, prefix?: string, fallback?: string, size?: number) => string[]`:
`count` CSS variable references, from `0`, starting over after `size`, each
falling back to `fallback`. `prefix` is `CHART_COLOR_PREFIX`,
`'--chart-color-'`, by default, `fallback` `'currentColor'`, and `size`
`CHART_PALETTE_SIZE`, `8`.
