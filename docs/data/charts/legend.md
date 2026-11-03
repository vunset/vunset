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
(bars and a line through them) is one entry, and hides both.

## Content of your own

The `item` slot replaces what each button shows, a swatch and the label,
and keeps the button: its toggling, `aria-pressed` and `data-hidden` stay.
It gets the entry's `category`, `label`, `color`, whether it is `hidden`, its
`index` and a `toggle()`.

```vue
<template>
  <ChartLegend v-slot:item="{ label, color, hidden }">
    <span class="dot" :style="{ borderColor: color, background: hidden ? 'transparent' : color }" />
    {{ label }}
  </ChartLegend>
</template>
```

To draw the buttons yourself, use the default slot instead: it gets an
`items` list, each with the same fields, and the `hidden` list.

## Examples

### Below the chart

A legend sits above the drawing; `placement="bottom"` puts it below, in the
page as well as on screen, so it's read after the chart. It has to be among
the root's own content for that, not inside a component of yours. It carries
`data-placement`, for spacing it either way.

::: preview chart/LegendBottom
:::

```vue
<template>
  <ChartRoot :data="rows" x-key="month">
    <ChartArea y-key="visits" />
    <ChartLegend placement="bottom" />
  </ChartRoot>
</template>
```

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

Each default button carries `data-part="legend-item"`, `item-class` if given,
`data-hidden` while its series is hidden, and `aria-pressed`; inside it, `data-part="legend-swatch"`
and `data-part="legend-label"`.
