<script setup lang="ts">
import { onScopeDispose, ref } from 'vue';
import { AppButton, AppNumberFlow } from '@vunset/ui';
import { formatCurrency } from '@vunset/utils';

const value = ref<string>(formatCurrency(4210.75));
let timer: ReturnType<typeof setTimeout> | undefined;

function recompute() {
  value.value = 'Computing…';
  clearTimeout(timer);
  timer = setTimeout(() => (value.value = formatCurrency(Math.round(Math.random() * 900_000) / 100)), 1200);
}

onScopeDispose(() => clearTimeout(timer));
</script>

<template>
  <div class="grid justify-items-center gap-3">
    <AppNumberFlow :value="value" class="text-3xl font-semibold" />
    <AppButton variant="outline" @click="recompute">Recompute</AppButton>
  </div>
</template>
