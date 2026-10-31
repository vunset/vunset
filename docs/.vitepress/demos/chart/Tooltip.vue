<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { ChartArea, ChartAxis, ChartCrosshair, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const data = months.map((month, index) => ({
  month,
  visits: Math.round(4200 + Math.sin(index / 1.6) * 2400 + index * 420),
  signups: Math.round(1100 + Math.cos(index / 2.1) * 700 + index * 130)
}));
</script>

<template>
  <ChartRoot :data="data" x-key="month" height="12rem" class="demo-chart">
    <ChartAxis type="x" />
    <ChartArea y-key="visits" />
    <ChartCrosshair />
    <ChartTooltip v-slot="{ row, heading }">
      <div class="demo-chart-tooltip">
        <strong>{{ heading }}</strong>
        <span>{{ formatNumber(row.visits) }} visits</span>
        <span>{{ formatNumber(row.signups) }} sign-ups, {{ Math.round((row.signups / row.visits) * 100) }}%</span>
      </div>
    </ChartTooltip>
  </ChartRoot>
</template>
