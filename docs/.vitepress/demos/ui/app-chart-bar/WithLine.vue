<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { ChartLine } from '@vunset/vue/chart';
import { AppChartBar } from '@vunset/ui/chart';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const data = months.map((month, index) => ({
  month,
  orders: Math.round(820 + Math.sin(index / 1.5) * 260 + index * 45),
  average: Math.round(780 + index * 48)
}));
</script>

<template>
  <AppChartBar
    :data="data"
    :categories="['orders']"
    x-key="month"
    :y-format="(value) => formatNumber(value)"
    :label-format="() => 'Orders'"
    legend
    height="16rem"
  >
    <ChartLine y-key="average" label="Trend" curve="linear" />
  </AppChartBar>
</template>
