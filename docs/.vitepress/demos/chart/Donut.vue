<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { ChartDonut, ChartLegend } from '@vunset/vue/chart';
import './chart.css';

const sources = [
  { source: 'Organic search', total: 5820 },
  { source: 'Direct', total: 3140 },
  { source: 'Referral', total: 1680 },
  { source: 'Social', total: 960 }
];
</script>

<template>
  <ChartDonut
    :data="sources"
    category-key="source"
    value-key="total"
    :value-format="(value) => formatNumber(value, { notation: 'compact' })"
    central-sub-label="Visits"
    height="14rem"
    class="demo-chart"
  >
    <ChartLegend class="demo-chart-legend" />
  </ChartDonut>
</template>
