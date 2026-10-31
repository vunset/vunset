# AppChartBar

Values as bars, side by side or stacked, upright or sideways. It's a
[ChartRoot](/data/charts/overview) of [ChartBar](/data/charts/bar) parts
with both axes, a grid, a tooltip and a legend, in [ui's chart
styles](/ui/charts).

::: preview ui/app-chart-bar/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppChartBar } from '@vunset/ui/chart';
</script>

<template>
  <AppChartBar :data="rows" :categories="['web', 'mobile']" x-key="quarter" stacked />
</template>
```

Each key in `categories` becomes a bar at every row. `stacked` piles them,
`gradient` fades each towards its foot, and `rounded-corners` and
`bar-padding` shape them. On upright bars, labels that don't fit are left
out; `trim-labels` shortens them instead.

## Examples

### Horizontal

::: preview ui/app-chart-bar/Horizontal
:::

### With a line

The default slot takes more [parts](/data/charts/overview): a `ChartLine`
runs through the middle of each row.

::: preview ui/app-chart-bar/WithLine
:::

## API Reference

::: api app/AppChartBar
:::
