<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { AppChartDonut } from '@vunset/ui/chart';

const sources = [
  { source: 'Organic search', total: 5820 },
  { source: 'Direct', total: 3140 },
  { source: 'Referral', total: 1680 },
  { source: 'Social', total: 960 }
];
</script>

<template>
  <AppChartDonut
    :data="sources"
    category-key="source"
    value-key="total"
    :value-format="(value) => formatNumber(value, { notation: 'compact' })"
    central-sub-label="Visits"
    legend
    height="16rem"
  />
</template>
