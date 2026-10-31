<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { ChartAxis, ChartLine } from '@vunset/vue/chart';
import { AppChartLine } from '@vunset/ui/chart';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const data = months.map((month, index) => ({
  month,
  revenue: Math.round(38000 + Math.sin(index / 1.4) * 14000 + index * 2600),
  rate: Number((2.4 + Math.cos(index / 1.9) * 1.1 + index * 0.08).toFixed(2))
}));
</script>

<template>
  <AppChartLine
    :data="data"
    :categories="['revenue']"
    x-key="month"
    :y-format="(value) => formatNumber(value, { notation: 'compact', currency: 'USD' })"
    :label-format="() => 'Revenue'"
    legend
    points
    height="16rem"
    tooltip-class="inverted"
  >
    <ChartAxis type="y" scale="conversion" :format="(value) => `${value}%`" />
    <ChartLine y-key="rate" label="Conversion" scale="conversion" points />
  </AppChartLine>
</template>
