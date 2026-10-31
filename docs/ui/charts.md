# Charts

Four ready charts, [AppChartArea](/ui/app-chart-area),
[AppChartLine](/ui/app-chart-line), [AppChartBar](/ui/app-chart-bar) and
[AppChartDonut](/ui/app-chart-donut), and the stylesheet that draws them in
ui's colors and sizes. The stylesheet styles the [chart parts](/data/charts/overview)
of `@vunset/vue/chart` too, so a chart you compose yourself looks the same.

::: preview ui/charts/Area
:::

## Installation

The charts have their own entry point, so an app that doesn't use them never
loads TanStack Charts. Install it alongside:

```sh
npm install @tanstack/charts
```

```ts
import { AppChartArea, AppChartBar } from '@vunset/ui/chart';
```

The stylesheet comes with `@vunset/ui/all.css`, or
[on its own](/ui/theming#only-the-stylesheets-you-use) as
`@vunset/ui/css/app-chart.css`. What it sets:

- **The series palette**, `--chart-color-0` to `-7`, on `:root`: ui's accent,
  then green, amber, violet, rose, cyan, orange and slate, each in a light and
  a dark shade. Set any of them again, on `:root` or one chart, for your own.
- **The chart's `color`**, ui's text color: the axes, their labels and the
  grid are painted in it, so they follow the page's color scheme.
- **The tick labels' size**, `--chart-tick-font-size`, ui's extra-small text.
- **The parts** the charts name: the legend as a row of small toggles (a
  hidden series dimmed), the tooltip's box, heading and rows, and the donut's
  total in the middle.

Its rules have the lowest possible specificity, so any rule of your own wins.

## Ready or composed

An AppChart takes a list of `categories` and draws one series per key, with
both axes, a grid, a tooltip and a legend. For anything else, add parts in
its slot, such as a target line over the bars, or compose a `ChartRoot`
yourself, as above: two value axes, bars beside a line.

## Styling

<<< ../../packages/ui/src/app/app-chart.css
