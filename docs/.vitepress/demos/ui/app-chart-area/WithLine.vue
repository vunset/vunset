<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { ChartLine } from '@vunset/vue/chart';
import { AppChartArea } from '@vunset/ui/chart';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const data = months.map((month, index) => ({
  month,
  visits: Math.round(4200 + Math.sin(index / 1.6) * 2400 + index * 420),
  goal: 4000 + index * 450
}));
</script>

<template>
  <AppChartArea
    :data="data"
    :categories="['visits']"
    x-key="month"
    :y-format="(value) => formatNumber(value, { notation: 'compact' })"
    :label-format="() => 'Visits'"
    legend
    height="16rem"
  >
    <ChartLine y-key="goal" label="Goal" curve="linear" />
  </AppChartArea>
</template>
