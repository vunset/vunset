# Chart area

A series drawn as a line with a band fading beneath it. Put one in a
[`ChartRoot`](/data/charts/overview) per key you plot.

::: preview chart/Area
:::

## Anatomy

```vue
<template>
  <ChartRoot :data="rows" x-key="month">
    <ChartAxis type="x" />
    <ChartAxis type="y" />
    <ChartArea y-key="visits" label="Visits" />
    <ChartArea y-key="signups" label="Sign-ups" />
    <ChartTooltip />
  </ChartRoot>
</template>
```

`y-key` is the key it plots, and `label` its name in the legend, the tooltip
and the chart's accessible name. `points` marks each row with a dot. The
line curves smoothly through the rows without overshooting them;
`curve="linear"` draws it straight.

Bands don't stack: each one fades down to zero, and a later one is drawn over
an earlier one.

`:gradient="false"` fills the band evenly in its color instead of fading it,
and `:line="false"` leaves out the line along its top, the band then taking
the pointer and the keyboard itself. A solid band sits at a quarter of its
color's strength; set `fill-opacity` on `.ts-chart__area path` for another.

```vue
<template>
  <ChartArea y-key="load" :line="false" :gradient="false" />
</template>
```

## API Reference

### ChartArea

Renders no element: it's drawn into the chart's SVG.

::: api chart/ChartArea
:::
