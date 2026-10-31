<script setup lang="ts">
import { ref } from 'vue';
import { AppButton, AppNumberFlow } from '@vunset/ui';
import { formatCurrency } from '@vunset/utils';

const revenue = ref(12480.5);

function refresh() {
  revenue.value = Math.round(Math.random() * 5_000_000) / 100;
}
</script>

<template>
  <div class="grid justify-items-center gap-3">
    <AppNumberFlow :value="formatCurrency(revenue)" appear class="text-3xl font-semibold" />
    <AppButton variant="outline" @click="refresh">Refresh</AppButton>
  </div>
</template>
