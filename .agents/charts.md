# Charts

`@vunset/vue/chart` (`packages/vue/src/chart.ts`) draws with `@tanstack/charts`.
`@vunset/ui/chart`'s ready charts are in `packages/ui/AGENTS.md`.

A cartesian chart is `ChartRoot` plus renderless parts (`ChartArea`,
`ChartLine`, `ChartBar`, `ChartAxis`, `ChartGrid`, `ChartCrosshair`,
`ChartTooltip`): each registers its options through `useChartPart`, and the
root builds the one TanStack definition from them. Parts render only a comment,
whose place in the page gives template order (paint order) once mounted, so a
part shown later by `v-if` keeps its place. A part registers during its own
setup, after the root has rendered, so `ChartFrame` takes getters and draws in
a child placed after the slot; a `ChartLegend` before the series fills in just
after hydration, the server and the client's first render agreeing. All bars go
into one TanStack mark, so they group and stack together. `ChartDonut` stays one
component. `ChartFrame.vue` holds the legend slot, tooltip box and the donut's
middle; scale and label helpers are in `chart-scales.ts`.

What TanStack leaves out is done around it: it takes the tick labels' size as a
number, so `ChartFrame` reads `--chart-tick-font-size` off a hidden probe and
the root passes it on; it paints every tick label alike, so with two value
axes the root colors each after every draw. `trimLabels` is ours, sized from
the measured row width. A focused point keeps TanStack's own focus ring.

The row axis is TanStack's band/point scale over row indexes, unless
`x-scale` names a continuous one: then each point's `at` is its `x-key` value,
and ticks keep the scale's own format unless the axis has one. Bars stay on
the band scale (a dev warning leaves them out otherwise). `x-scale` takes a
factory rather than a name, so a time scale comes from the app's d3-scale,
never from a dependency of ours. `ChartTooltip`'s `mode="point"` swaps
`rowFocus` for `pointFocus`; pinning is TanStack's `sticky`, with `pinned`
passed through `ChartFrame` as `data-pinned` and a slot prop.
