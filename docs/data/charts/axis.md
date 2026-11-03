# Chart axes and grid

The axes, the lines across the plot, and the guide that follows the pointer.
Each is a part of its own in a [`ChartRoot`](/data/charts/overview); a chart
without them draws none.

::: preview chart/Line
:::

## Anatomy

```vue
<template>
  <ChartRoot :data="rows" x-key="month">
    <ChartAxis type="x" :num-ticks="6" />
    <ChartAxis type="y" :format="usd" />
    <ChartGrid />
    <ChartArea y-key="revenue" />
    <ChartCrosshair />
  </ChartRoot>
</template>
```

`ChartAxis type="x"` labels the rows from `x-key`; `type="y"` labels the
values. That holds whichever way the chart lies: on a horizontal chart the
row axis is down the side.

- `format` formats the labels. The x axis' formats the tooltip's heading,
  and a y axis' formats the values of its series in the tooltip, unless a
  series has a `format` of its own.
- `num-ticks` is how many labels an axis aims for. The x axis otherwise labels
  every row it has room for, leaving out the ones that would collide.
  `trim-labels` cuts long row labels to fit instead.
- `side` moves an axis to another edge.
- `label` writes a title along the axis, such as its unit.
- `line` draws the axis' own line along the edge of the plot, under its
  labels. Each label has a short tick mark beside it; `:tick-marks="false"`
  leaves them out.

`ChartGrid` draws a line at each value tick; `type="x"` draws one per row.
`ChartCrosshair` draws a guide through the row under the pointer.

## Examples

### A second value axis

Series in different units each read against a scale of their own. Give a
series a `scale` name, and an axis the same: it sits on the far side, and
with one series on it, its labels take that series' color. Hiding the
series takes its axis with it, and the grid moves to the axis still drawn.

::: preview chart/Dual
:::

```vue
<template>
  <ChartRoot :data="rows" x-key="month">
    <ChartAxis type="y" :format="usd" />
    <ChartAxis type="y" scale="conversion" :format="(value) => `${value}%`" />
    <ChartArea y-key="revenue" />
    <ChartLine y-key="rate" scale="conversion" />
  </ChartRoot>
</template>
```

### A time axis

By default the rows sit evenly along the x axis, in order. `x-scale` places
them by their `x-key` value instead: `linear` for numbers, or a scale factory
for anything else, such as d3-scale's `scaleUtc` for dates. TanStack Charts
already installs d3-scale, so it can be imported as it is; install it yourself
to choose its version, along with `@types/d3-scale` for TypeScript. Without a
`format`, the ticks read as the scale writes them, so a time scale names the
hour or the day as the range needs.

::: preview chart/Time
:::

```vue
<script setup lang="ts">
import { scaleUtc } from 'd3-scale';
import { toChartRows } from '@vunset/vue';

// One record per node per reading, into one row per time.
const { rows, series } = toChartRows(records, { x: 'date', series: 'node', value: 'load' });
</script>

<template>
  <ChartRoot :data="rows" x-key="date" :x-scale="scaleUtc">
    <ChartLegend />
    <ChartAxis type="x" label="Time" :num-ticks="6" />
    <ChartAxis type="y" label="CPU load" :format="(value) => `${value}%`" />
    <ChartArea v-for="node in series" :key="node" :y-key="node" />
    <ChartTooltip mode="point" :heading-format="(date) => date.toUTCString()" />
  </ChartRoot>
</template>
```

The ticks are in UTC, so the tooltip's `heading-format` writes the time in
UTC too; a date heading otherwise reads in the reader's own time zone.

`toChartRows` turns records of one value each into the rows a chart takes:
one per `x` value, a key per series, in time order. A series with no reading at a time
leaves a gap there. Bars need rows spaced evenly, so they stay on the default
`category` scale.

## API Reference

### ChartAxis

Renders no element: it's drawn into the chart's SVG, its labels as
`text[data-ts-key^="<scale>-tick-label"]`.

::: api chart/ChartAxis
:::

### ChartGrid

::: api chart/ChartGrid
:::

### ChartCrosshair

Takes no props.
