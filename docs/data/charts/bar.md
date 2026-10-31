# Chart bar

A series drawn as a bar per row. Every `ChartBar` in a
[`ChartRoot`](/data/charts/overview) is grouped with the others: side by side
at each row, or piled into one with `stacked` on the root.

::: preview chart/Bar
:::

## Anatomy

```vue
<template>
  <ChartRoot :data="rows" x-key="quarter" stacked>
    <ChartAxis type="x" />
    <ChartAxis type="y" />
    <ChartGrid />
    <ChartBar y-key="web" label="Web" />
    <ChartBar y-key="mobile" label="Mobile" />
    <ChartTooltip />
  </ChartRoot>
</template>
```

- `gradient` fades a bar towards its foot.
- `rounded-corners` rounds the bar's end; stacked, only the top of each pile.
- `padding` is the gap between rows.
- Bars paint as one group, where the first `ChartBar` sits in the template.
  They share its `scale`, `rounded-corners` and `padding`.

A row without a value leaves a gap, not a bar of zero.

## Examples

### Horizontal

`orientation="horizontal"` on the root grows the bars sideways, with the
`x-key` values down the side. `ChartAxis type="x"` is still the axis of
rows, on the left now.

::: preview chart/Horizontal
:::

### With a line

A `ChartLine` or `ChartArea` beside the bars runs through the middle of each
row. See [Bars with a line](/data/charts/overview#bars-with-a-line).

::: preview chart/Combo
:::

## API Reference

### ChartBar

Renders no element: it's drawn into the chart's SVG.

::: api chart/ChartBar
:::
