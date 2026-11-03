<script setup lang="ts">
import { scaleUtc } from 'd3-scale';
import { toChartRows } from '@vunset/vue';
import { AppChartArea } from '@vunset/ui/chart';

// One record per node per reading, as an API sends them.
const start = Date.UTC(2026, 0, 1);
const records = ['node-a', 'node-b', 'node-c', 'node-d'].flatMap((node, n) =>
  Array.from({ length: 48 }, (_, step) => ({
    date: new Date(start + step * 1_800_000),
    node,
    load: Math.round(30 + n * 10 + Math.sin((step + n * 7) / 5) * 16)
  }))
);

const { rows, series } = toChartRows(records, { x: 'date', series: 'node', value: 'load' });

// In UTC, as `scaleUtc` ticks.
const heading = (date: Date) =>
  date.toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' });
</script>

<template>
  <AppChartArea
    :data="rows"
    :categories="series"
    x-key="date"
    :x-scale="scaleUtc"
    x-label="Time"
    y-label="CPU load"
    :y-format="(value) => `${Math.round(value)}%`"
    :num-ticks="6"
    tooltip-mode="point"
    :tooltip-heading-format="heading"
    curve="linear"
    label="Node CPU load over time"
    height="18rem"
    tooltip-class="inverted"
  />
</template>
