<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { ChartArea, ChartAxis, ChartCrosshair, ChartGrid, ChartLegend, ChartLine, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const data = months.map((month, index) => ({
  month,
  revenue: Math.round(38000 + Math.sin(index / 1.4) * 14000 + index * 2600),
  rate: Number((2.4 + Math.cos(index / 1.9) * 1.1 + index * 0.08).toFixed(2))
}));
</script>

<template>
  <ChartRoot :data="data" x-key="month" height="16rem" class="demo-chart">
    <ChartLegend class="demo-chart-legend" />
    <ChartAxis type="x" />
    <ChartAxis type="y" :format="(value) => formatNumber(value, { notation: 'compact', currency: 'USD' })" />
    <ChartAxis type="y" scale="conversion" :format="(value) => `${value}%`" />
    <ChartGrid />
    <ChartArea y-key="revenue" label="Revenue" />
    <ChartLine y-key="rate" label="Conversion" scale="conversion" />
    <ChartCrosshair />
    <ChartTooltip />
  </ChartRoot>
</template>
