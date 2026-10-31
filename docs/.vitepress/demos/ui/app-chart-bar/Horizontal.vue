<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { AppChartBar } from '@vunset/ui/chart';

const traffic = [
  { channel: 'Organic search', visits: 5820 },
  { channel: 'Direct', visits: 3140 },
  { channel: 'Referral', visits: 1680 },
  { channel: 'Social', visits: 960 },
  { channel: 'Email', visits: 610 }
];
</script>

<template>
  <AppChartBar
    :data="traffic"
    :categories="['visits']"
    x-key="channel"
    orientation="horizontal"
    :rounded-corners="4"
    :bar-padding="0.25"
    :y-format="(value) => formatNumber(value, { notation: 'compact' })"
    :label-format="() => 'Visits'"
    height="14rem"
  />
</template>
