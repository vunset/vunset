# AppChartLine

One or more series over an ordered axis, each a line. It's a
[ChartRoot](/data/charts/overview) of [ChartLine](/data/charts/line) parts
with both axes, a grid, a crosshair, a tooltip and a legend, in [ui's chart
styles](/ui/charts).

::: preview ui/app-chart-line/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppChartLine } from '@vunset/ui/chart';
</script>

<template>
  <AppChartLine :data="rows" :categories="['web', 'mobile']" x-key="month" points />
</template>
```

It takes the same props as [AppChartArea](/ui/app-chart-area).

## Examples

### A second axis

Series in other units go on an axis of their own: put a `ChartAxis` and a
series with the same `scale` in the default slot. Each axis reads in its
series' color, and hiding a series takes its axis with it. See
[a second value axis](/data/charts/axis#a-second-value-axis).

::: preview ui/app-chart-line/Dual
:::

## API Reference

::: api app/AppChartLine
:::
