<script setup lang="ts">
import { ChartArea, ChartAxis, ChartGrid, ChartLegend, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const data = months.map((month, index) => ({
  month,
  visits: Math.round(4200 + Math.sin(index / 1.6) * 2400 + index * 420),
  signups: Math.round(1100 + Math.cos(index / 2.1) * 700 + index * 130)
}));
</script>

<template>
  <ChartRoot :data="data" x-key="month" height="12rem" class="demo-chart">
    <ChartAxis type="x" />
    <ChartGrid />
    <ChartArea y-key="visits" label="Visits" />
    <ChartArea y-key="signups" label="Sign-ups" />
    <ChartTooltip />
    <ChartLegend placement="bottom" class="demo-chart-legend" />
  </ChartRoot>
</template>
