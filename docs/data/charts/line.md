# Chart line

A series drawn as a line alone. Put one in a
[`ChartRoot`](/data/charts/overview) per key you plot, or over bars and bands
to show a trend or a target.

::: preview chart/Line
:::

## Anatomy

```vue
<template>
  <ChartRoot :data="rows" x-key="month">
    <ChartAxis type="x" />
    <ChartAxis type="y" />
    <ChartLine y-key="web" label="Web" points />
    <ChartLine y-key="target" label="Target" curve="linear" />
    <ChartTooltip />
  </ChartRoot>
</template>
```

It takes the same props as [`ChartArea`](/data/charts/area): `y-key`,
`label`, `color`, `points`, `curve`, and `scale` to read against an
[axis of its own](/data/charts/axis#a-second-value-axis). Over bars, a line
runs through the middle of each row.

## API Reference

### ChartLine

Renders no element: it's drawn into the chart's SVG.

::: api chart/ChartLine
:::
