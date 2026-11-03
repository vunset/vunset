<script setup lang="ts">
import { scaleUtc } from 'd3-scale';
import { toChartRows } from '@vunset/vue';
import { ChartArea, ChartAxis, ChartGrid, ChartLegend, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

// What an API sends: one record per node per reading.
const start = Date.UTC(2026, 0, 1);
const records = ['node-a', 'node-b', 'node-c'].flatMap((node, n) =>
  Array.from({ length: 24 }, (_, hour) => ({
    date: new Date(start + hour * 3_600_000),
    node,
    load: Math.round(35 + n * 12 + Math.sin((hour + n * 5) / 3) * 18)
  }))
);

const { rows, series } = toChartRows(records, { x: 'date', series: 'node', value: 'load' });

const percent = (value: number) => `${Math.round(value)}%`;
// In UTC, as `scaleUtc` ticks.
const heading = (date: Date) =>
  date.toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' });
</script>

<template>
  <ChartRoot
    :data="rows"
    x-key="date"
    :x-scale="scaleUtc"
    label="Node CPU load over time"
    height="16rem"
    class="demo-chart"
  >
    <ChartLegend />
    <ChartAxis type="x" label="Time" :num-ticks="6" />
    <ChartAxis type="y" label="CPU load" :format="percent" />
    <ChartGrid />
    <ChartArea v-for="node in series" :key="node" :y-key="node" curve="linear" />
    <ChartTooltip mode="point" :heading-format="heading" />
  </ChartRoot>
</template>
