# AppChartDonut

Parts of a whole, as a ring with the total in the middle, or a pie. It's
[ChartDonut](/data/charts/donut), with an optional legend, in [ui's chart
styles](/ui/charts).

::: preview ui/app-chart-donut/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppChartDonut } from '@vunset/ui/chart';
</script>

<template>
  <AppChartDonut :data="sources" category-key="source" value-key="total" />
</template>
```

`arc-width="0"` fills the ring in, making a pie, which shows no total in the
middle. `gap` parts the slices by an even width in pixels, the same from the
center to the edge, drawn in ui's background color. `legend` adds switches
above it, one per slice.

## API Reference

::: api app/AppChartDonut
:::
