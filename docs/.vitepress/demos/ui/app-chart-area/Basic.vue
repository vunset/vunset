<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { AppChartArea } from '@vunset/ui/chart';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const data = months.map((month, index) => ({
  month,
  visits: Math.round(4200 + Math.sin(index / 1.6) * 2400 + index * 420),
  signups: Math.round(1100 + Math.cos(index / 2.1) * 700 + index * 130)
}));

const label = (key: string) => (key === 'visits' ? 'Visits' : 'Sign-ups');
</script>

<template>
  <AppChartArea
    :data="data"
    :categories="['visits', 'signups']"
    x-key="month"
    :y-format="(value) => formatNumber(value, { notation: 'compact' })"
    :label-format="label"
    height="16rem"
    tooltip-class="inverted"
  />
</template>
