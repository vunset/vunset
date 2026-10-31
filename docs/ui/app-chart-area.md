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

## Examples

### With a line

The default slot takes more [parts](/data/charts/overview), drawn over the
bands: here a goal line.

::: preview ui/app-chart-area/WithLine
:::

## API Reference

::: api app/AppChartArea
:::
