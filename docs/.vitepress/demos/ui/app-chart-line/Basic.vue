<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { AppChartLine } from '@vunset/ui/chart';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const data = months.map((month, index) => ({
  month,
  web: Math.round(3100 + Math.sin(index / 1.3) * 900 + index * 260),
  mobile: Math.round(2200 + Math.cos(index / 1.7) * 700 + index * 340),
  desktop: Math.round(1800 + Math.sin(index / 2.2) * 400 + index * 90)
}));

const label = (key: string) => key[0]!.toUpperCase() + key.slice(1);
</script>

<template>
  <AppChartLine
    :data="data"
    :categories="['web', 'mobile', 'desktop']"
    x-key="month"
    :y-format="(value) => formatNumber(value, { notation: 'compact' })"
    :label-format="label"
    :num-ticks="6"
    points
    height="16rem"
    tooltip-class="inverted"
  />
</template>
