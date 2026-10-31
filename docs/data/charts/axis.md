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
