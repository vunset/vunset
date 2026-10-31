# Charts overview

Charts you compose from parts, drawn with
[TanStack Charts](https://tanstack.com/charts). A `ChartRoot` holds the
rows; inside it, each series, axis, grid line, the crosshair, the tooltip and
the legend is a part of its own. Leave out what you don't want, and mix bars,
bands and lines in one chart.

::: preview chart/Area
:::

## Installation

Charts have their own entry point, so an app that doesn't use them never
loads TanStack Charts. Install it alongside:

```sh
npm install @tanstack/charts
```

```ts
import { ChartRoot, ChartArea, ChartAxis, ChartGrid, ChartTooltip } from '@vunset/vue/chart';
```

## Anatomy

```vue
<template>
  <ChartRoot :data="rows" x-key="month">
    <ChartLegend />
    <ChartAxis type="x" />
    <ChartAxis type="y" />
    <ChartGrid />
    <ChartBar y-key="orders" />
    <ChartLine y-key="target" />
    <ChartCrosshair />
    <ChartTooltip />
  </ChartRoot>
</template>
```

`data` is the rows and `x-key` the key along the x axis. Each series part
plots one key, its `y-key`. The root draws only what its parts ask for: no
axis without a `ChartAxis`, no tooltip without a `ChartTooltip`.

Series paint in template order, so a later one sits on top. A bar, band or
line can be shown or removed with `v-if` and keeps its place.

## The parts

| Part | For |
| --- | --- |
| [ChartArea](/data/charts/area) | A line with a band fading beneath it. |
| [ChartLine](/data/charts/line) | A line alone. |
| [ChartBar](/data/charts/bar) | A bar per row, side by side or stacked with the other bars. |
| [ChartAxis, ChartGrid, ChartCrosshair](/data/charts/axis) | The axes, the lines across and the guide under the pointer. A second value axis puts series in other units on a scale of their own. |
| [ChartLegend](/data/charts/legend) | Buttons that hide and show each series. |
| [ChartTooltip](/data/charts/tooltip) | What the pointer is over. |

[ChartDonut](/data/charts/donut) is a whole chart on its own.

## Examples

### Bars with a line

Bars, a band and a line in one chart. The band comes first, so it sits
behind the bars, and the line over them.

::: preview chart/Combo
:::

## Colors

Each series is `var(--chart-color-N)`, from 0 in its place among the chart's
series, unless it has a `color` of its own. See [Colors](/data/charts/colors)
for the palette, the axes' color and the tick size.

## Parts

| Part | Element |
| --- | --- |
| `data-part="chart"` | The root, with `data-orientation`. Your classes and attributes land on it. The donut's carries `data-chart="donut"`. |
| `data-part="legend"` | A [legend](/data/charts/legend), with its `legend-item` buttons. |
| `data-part="chart-plot"` | The drawing, after the legend. |
| `data-part="chart-tooltip"` | The [tooltip](/data/charts/tooltip)'s box, around its `tooltip` content. |
| `data-part="chart-center"` | The donut's middle, laid over the plot: a `chart-center-label` and a `chart-center-sub-label`. |

The series, axes, grid and crosshair render no element of their own: they
are drawn into the chart's SVG.

## API Reference

### ChartRoot

The element carries `data-part="chart"`.

::: api chart/ChartRoot
:::
