<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { ChartAxis, ChartCrosshair, ChartGrid, ChartLegend, ChartLine, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const data = months.map((month, index) => ({
  month,
  web: Math.round(3100 + Math.sin(index / 1.3) * 900 + index * 260),
  mobile: Math.round(2200 + Math.cos(index / 1.7) * 700 + index * 340),
  target: 3000 + index * 250
}));
</script>

<template>
  <ChartRoot :data="data" x-key="month" height="16rem" class="demo-chart">
    <ChartLegend class="demo-chart-legend" />
    <ChartAxis type="x" :num-ticks="6" />
    <ChartAxis type="y" :format="(value) => formatNumber(value, { notation: 'compact' })" />
    <ChartGrid />
    <ChartLine y-key="web" label="Web" points />
    <ChartLine y-key="mobile" label="Mobile" points />
    <ChartLine y-key="target" label="Target" curve="linear" />
    <ChartCrosshair />
    <ChartTooltip />
  </ChartRoot>
</template>
