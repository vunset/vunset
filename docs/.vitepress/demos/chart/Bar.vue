<script setup lang="ts">
import { ref } from 'vue';
import { formatNumber } from '@vunset/vue';
import { ChartAxis, ChartBar, ChartGrid, ChartLegend, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

const data = ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => ({
  quarter,
  web: 1200 + index * 340,
  mobile: 800 + index * 410,
  desktop: 400 + ((index * 170) % 300)
}));

const stacked = ref(false);
</script>

<template>
  <ChartRoot :data="data" x-key="quarter" :stacked="stacked" height="16rem" class="demo-chart">
    <ChartLegend class="demo-chart-legend" />
    <ChartAxis type="x" />
    <ChartAxis type="y" :format="(value) => formatNumber(value, { notation: 'compact' })" />
    <ChartGrid />
    <ChartBar y-key="web" label="Web" />
    <ChartBar y-key="mobile" label="Mobile" />
    <ChartBar y-key="desktop" label="Desktop" />
    <ChartTooltip />
  </ChartRoot>

  <DemoOutput>
    <label class="demo-chart-option"><input v-model="stacked" type="checkbox" /> Stacked</label>
  </DemoOutput>
</template>
