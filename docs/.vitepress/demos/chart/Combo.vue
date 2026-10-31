<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { ChartArea, ChartAxis, ChartBar, ChartGrid, ChartLegend, ChartLine, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const data = months.map((month, index) => ({
  month,
  orders: Math.round(820 + Math.sin(index / 1.5) * 260 + index * 45),
  returns: Math.round(90 + Math.cos(index / 1.2) * 30 + index * 4),
  average: Math.round(780 + index * 48)
}));
</script>

<template>
  <ChartRoot :data="data" x-key="month" height="16rem" class="demo-chart">
    <ChartLegend class="demo-chart-legend" />
    <ChartAxis type="x" :num-ticks="6" />
    <ChartAxis type="y" :format="(value) => formatNumber(value)" />
    <ChartGrid />
    <ChartArea y-key="average" label="Trend" curve="linear" />
    <ChartBar y-key="orders" label="Orders" />
    <ChartBar y-key="returns" label="Returns" />
    <ChartLine y-key="average" label="Trend" curve="linear" />
    <ChartTooltip />
  </ChartRoot>
</template>
