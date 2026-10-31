<script setup lang="ts">
import { chartColors, formatNumber } from '@vunset/vue';
import { ChartAxis, ChartBar, ChartGrid, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

const series = [
  { key: 'web', label: 'Web' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'desktop', label: 'Desktop' }
];
const data = ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => ({
  quarter,
  web: 1200 + index * 340,
  mobile: 800 + index * 410,
  desktop: 400 + ((index * 170) % 300)
}));

// The same `var()`s the chart paints its series with, for a table of our own.
const colors = chartColors(series.length);
const total = (key: string) => data.reduce((sum, row) => sum + row[key as 'web'], 0);
</script>

<template>
  <div class="demo-chart-group">
    <ChartRoot :data="data" x-key="quarter" height="12rem" class="demo-chart">
      <ChartAxis type="x" />
      <ChartAxis type="y" :format="(value) => formatNumber(value, { notation: 'compact' })" />
      <ChartGrid />
      <ChartBar v-for="entry in series" :key="entry.key" :y-key="entry.key" :label="entry.label" />
      <ChartTooltip />
    </ChartRoot>

    <table class="demo-chart demo-chart-table">
      <tbody>
        <tr v-for="(entry, index) in series" :key="entry.key">
          <td><span class="demo-chart-swatch" :style="{ background: colors[index] }" /> {{ entry.label }}</td>
          <td>{{ formatNumber(total(entry.key)) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
