<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { ChartAxis, ChartBar, ChartGrid, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

const traffic = [
  { channel: 'Organic search', visits: 5820 },
  { channel: 'Direct', visits: 3140 },
  { channel: 'Referral', visits: 1680 },
  { channel: 'Social', visits: 960 },
  { channel: 'Email', visits: 610 }
];
</script>

<template>
  <ChartRoot :data="traffic" x-key="channel" orientation="horizontal" height="14rem" class="demo-chart">
    <ChartAxis type="x" />
    <ChartAxis type="y" :format="(value) => formatNumber(value, { notation: 'compact' })" />
    <ChartGrid />
    <ChartBar y-key="visits" label="Visits" :rounded-corners="4" :padding="0.25" />
    <ChartTooltip />
  </ChartRoot>
</template>
