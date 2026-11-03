# Donut chart

Parts of a whole, as a ring with the total in the middle, or a pie. See the
[overview](/data/charts/overview) for installation and colors. Unlike the
other charts it's one component, not a `ChartRoot` of parts: a ring has no
axes or grid to compose.

::: preview chart/Donut
:::

## Anatomy

```vue
<script setup lang="ts">
import { ChartDonut, ChartLegend } from '@vunset/vue/chart';
</script>

<template>
  <ChartDonut :data="rows" category-key="source" value-key="total">
    <ChartLegend />
  </ChartDonut>
</template>
```

`category-key` names each slice and `value-key` holds its size. The middle
shows the total of the slices showing, through `value-format`;
`central-label` and `central-sub-label` replace it, and an empty string leaves
it out, as does `false`. `arc-width`, `pad-angle` and `corner-radius` shape
the ring.

## Examples

### Pie

`arc-width="0"` fills the ring in. A pie has no middle, so it shows no total
unless you give it a `central-label`.

`pad-angle` parts the slices by an angle, so on a pie its gaps narrow to
nothing at the center. `gap` parts them by a width in pixels instead, the same
from the center to the edge, and `:gap="0"` leaves no space at all. The slices
touch, and a line that wide in `--chart-gap-color` divides them: set it to the
color behind the chart, the page's own by default.

```css
[data-part='chart'] {
  --chart-gap-color: #fff;
}
```

::: preview chart/Pie
:::

## API Reference

### ChartDonut

The element carries `data-part="chart"` and `data-chart="donut"`.

::: api chart/ChartDonut
:::
