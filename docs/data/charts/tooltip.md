# Chart tooltip

Shows what the pointer is over: the row's heading and each series' value.
Put a `ChartTooltip` in a [`ChartRoot`](/data/charts/overview); a chart
without one shows none.

::: preview chart/Tooltip
:::

## Anatomy

```vue
<template>
  <ChartRoot :data="rows" x-key="month">
    <ChartArea y-key="visits" />
    <ChartTooltip class="chart-tip" />
  </ChartRoot>
</template>
```

The heading is the row's `x-key` value through the x axis' `format`. Each
series' value goes through its own `format`, or its axis'. Its attributes,
`class` among them, land on the box.

## Content of your own

The default slot replaces the content. It gets the `row` under the pointer,
its `heading`, and the `series` showing, each with its `key`, `label`,
`color`, raw `value` and formatted `text`.

```vue
<template>
  <ChartTooltip v-slot="{ row, heading }">
    <strong>{{ heading }}</strong>
    {{ row.visits }} visits
  </ChartTooltip>
</template>
```

The donut has a tooltip of its own, on by default: its `#tooltip` slot gets
the `slice`, and `:tooltip="false"` turns it off.

## Styling

The box is `data-part="chart-tooltip"`. It has no look of its own, so give
it a background, a border and some padding. The default content inside has
parts too:

| Part | Element |
| --- | --- |
| `data-part="tooltip"` | The content. |
| `data-part="tooltip-heading"` | The row's `x-key` value. |
| `data-part="tooltip-rows"` | The list of series. |
| `data-part="tooltip-row"` | One series: a `tooltip-swatch`, `tooltip-label` and `tooltip-value`. |

To make the tooltip glide between points instead of jumping, add a
transition to the wrapper TanStack Charts moves, `.ts-chart-tooltip`:

```css
[data-part='chart'] .ts-chart-tooltip {
  transition: left 120ms ease-out, top 120ms ease-out;
}
```

## API Reference

### ChartTooltip

Renders no element of its own: its attributes go on the box.

::: api chart/ChartTooltip
:::
