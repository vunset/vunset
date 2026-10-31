<script setup lang="ts">
import { ref } from 'vue';
import { formatNumber } from '@vunset/vue';
import { ChartAxis, ChartBar, ChartGrid, ChartLegend, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

const categories = ['web', 'mobile', 'desktop'];
const data = ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => ({
  quarter,
  web: 1200 + index * 340,
  mobile: 800 + index * 410,
  desktop: 400 + ((index * 170) % 300)
}));

const hidden = ref<string[]>(['desktop']);
</script>

<template>
  <div class="demo-chart-group">
    <ChartRoot v-model:hidden="hidden" :data="data" x-key="quarter" height="14rem" class="demo-chart">
      <ChartAxis type="x" />
      <ChartAxis type="y" :format="(value) => formatNumber(value, { notation: 'compact' })" />
      <ChartGrid />
      <ChartBar v-for="key in categories" :key="key" :y-key="key" />
      <ChartTooltip />
    </ChartRoot>

    <ChartLegend v-model="hidden" :categories="categories" class="demo-chart-legend" />
  </div>

  <DemoOutput>v-model:hidden: {{ JSON.stringify(hidden) }}</DemoOutput>
</template>
