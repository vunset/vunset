# AppChartArea

One or more series over an ordered axis, each a line with a band fading
beneath it. It's a [ChartRoot](/data/charts/overview) of
[ChartArea](/data/charts/area) parts with both axes, a grid, a crosshair, a
tooltip and a legend, in [ui's chart styles](/ui/charts).

::: preview ui/app-chart-area/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppChartArea } from '@vunset/ui/chart';
</script>

<template>
  <AppChartArea :data="rows" :categories="['visits', 'signups']" x-key="month" />
</template>
```

Each key in `categories` becomes a series. `label-format` names them,
`x-format` and `y-format` format the axes and the tooltip. The legend shows
for more than one series; `legend` or `:legend="false"` decides it yourself.
`:x-axis`, `:y-axis`, `:grid` and `:tooltip` set to `false` leave those out.
`x-label` and `y-label` title the axes, and `x-axis-line` and `y-axis-line`
draw each axis' own line along the plot's edge. `:gradient="false"` fills each band
evenly, and `:line="false"` leaves out the lines along their tops.
`palette-size` matches a theme of more or fewer than eight colors.

## Examples

### With a line

The default slot takes more [parts](/data/charts/overview), drawn over the
bands: here a goal line.

::: preview ui/app-chart-area/WithLine
:::

### Over time

`x-scale` places the rows by their `x-key` value, here on d3-scale's
`scaleUtc`, with [`toChartRows`](/data/charts/axis#a-time-axis) turning one
record per reading into one row per time. `x-label` and `y-label` title the axes, and
`tooltip-mode="point"` shows only the point under the pointer. A click pins
the tooltip; `:tooltip-sticky="false"` turns that off.

::: preview ui/app-chart-area/OverTime
:::

## API Reference

::: api app/AppChartArea
:::
