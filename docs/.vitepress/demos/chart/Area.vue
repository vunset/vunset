<script setup lang="ts">
import { ref } from 'vue';
import { formatNumber } from '@vunset/vue';
import { ChartArea, ChartAxis, ChartCrosshair, ChartGrid, ChartLegend, ChartRoot, ChartTooltip } from '@vunset/vue/chart';
import './chart.css';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const data = months.map((month, index) => ({
  month,
  visits: Math.round(4200 + Math.sin(index / 1.6) * 2400 + index * 420),
  signups: Math.round(1100 + Math.cos(index / 2.1) * 700 + index * 130)
}));

const smooth = ref(true);
</script>

<template>
  <ChartRoot :data="data" x-key="month" height="16rem" class="demo-chart">
    <ChartLegend class="demo-chart-legend" />
    <ChartAxis type="x" />
    <ChartAxis type="y" :format="(value) => formatNumber(value, { notation: 'compact' })" />
    <ChartGrid />
    <ChartArea y-key="visits" label="Visits" points :curve="smooth ? 'smooth' : 'linear'" />
    <ChartArea y-key="signups" label="Sign-ups" points :curve="smooth ? 'smooth' : 'linear'" />
    <ChartCrosshair />
    <ChartTooltip />
  </ChartRoot>

  <DemoOutput>
    <label class="demo-chart-option"><input v-model="smooth" type="checkbox" /> Smooth</label>
  </DemoOutput>
</template>
