<script setup lang="ts">
import { ref } from 'vue';
import { formatNumber } from '@vunset/vue';
import { AppChartBar } from '@vunset/ui/chart';
import { FormSwitch } from '@vunset/ui';

const data = ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => ({
  quarter,
  web: 1200 + index * 340,
  mobile: 800 + index * 410,
  desktop: 400 + ((index * 170) % 300)
}));

const label = (key: string) => key[0]!.toUpperCase() + key.slice(1);
const stacked = ref(false);
</script>

<template>
  <div class="grid w-full gap-4">
    <AppChartBar
      :data="data"
      :categories="['web', 'mobile', 'desktop']"
      x-key="quarter"
      :stacked="stacked"
      gradient
      :y-format="(value) => formatNumber(value, { notation: 'compact' })"
      :label-format="label"
      height="16rem"
    />
    <FormSwitch v-model="stacked" label="Stacked" />
  </div>
</template>
