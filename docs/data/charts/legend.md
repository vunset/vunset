# Legend

A list of a chart's series, each a button that hides or shows it. A hidden
series is removed, not drawn as zero, and the others keep their colors.

::: preview chart/Bar
:::

## Anatomy

```vue
<template>
  <ChartRoot :data="rows" x-key="quarter">
    <ChartLegend />
    <ChartBar y-key="web" label="Web" />
    <ChartBar y-key="mobile" label="Mobile" />
  </ChartRoot>
</template>
```

Inside a chart, a legend picks up the chart's series, their labels and
colors, and controls it, with nothing to wire up. A key drawn by two series
(bars and a line through them) is one entry, and hides both. To draw your own buttons, use its
default slot: it gets an `items` list, each with its `label`, `color`,
`hidden` and a `toggle()`.

## Examples

### Beside the chart

To put the legend somewhere else on the page, give it the `categories` and
bind the same list of hidden series to both: `v-model` on the legend,
`v-model:hidden` on the `ChartRoot`.

```vue
<script setup lang="ts">
const hidden = ref<string[]>([]);
</script>

<template>
  <ChartRoot v-model:hidden="hidden" :data="rows" x-key="quarter">
    <ChartBar y-key="web" />
    <ChartBar y-key="mobile" />
  </ChartRoot>
  <ChartLegend v-model="hidden" :categories="['web', 'mobile']" />
</template>
```

::: preview chart/Legend
:::

## API Reference

### ChartLegend

::: api chart/ChartLegend
:::

Each default button carries `data-part="legend-item"`, `data-hidden` while its
series is hidden, and `aria-pressed`; inside it, `data-part="legend-swatch"`
and `data-part="legend-label"`.
