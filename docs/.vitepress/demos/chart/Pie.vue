<script setup lang="ts">
import { ChartDonut, ChartLegend } from '@vunset/vue/chart';
import './chart.css';

const plans = [
  { plan: 'Free', users: 8200 },
  { plan: 'Pro', users: 2100 },
  { plan: 'Team', users: 640 }
];
</script>

<template>
  <ChartDonut
    :data="plans"
    category-key="plan"
    value-key="users"
    :arc-width="0"
    central-label=""
    central-sub-label=""
    height="12rem"
    class="demo-chart"
  >
    <ChartLegend class="demo-chart-legend" />
  </ChartDonut>
</template>
