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

`arc-width="0"` fills the ring in, making a pie. `legend` adds switches
above it, one per slice.

## API Reference

::: api app/AppChartDonut
:::
