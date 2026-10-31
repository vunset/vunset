<script setup lang="ts">
import { ref } from 'vue';
import type { AsyncStatus } from '@vunset/vue';
import { AppAsyncState, AppButton, FormToggleGroup } from '@vunset/ui';

const outcome = ref<'orders' | 'none' | 'fail'>('orders');
const status = ref<AsyncStatus>('idle');
const orders = ref<string[]>([]);

async function load() {
  status.value = 'pending';
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (outcome.value === 'fail') {
    status.value = 'error';
    return;
  }
  orders.value = outcome.value === 'orders' ? ['#1042 · Lisbon', '#1043 · Porto', '#1044 · Faro'] : [];
  status.value = 'success';
}
</script>

<template>
  <div class="grid w-full max-w-md gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <FormToggleGroup
        v-model="outcome"
        keep-one
        :options="[
          { value: 'orders', label: 'Orders' },
          { value: 'none', label: 'None' },
          { value: 'fail', label: 'Fail' }
        ]"
      />
      <AppButton variant="outline" @click="load">Load</AppButton>
    </div>

    <AppAsyncState
      :status="status"
      :data="orders"
      soft-loading
      empty-title="No orders yet"
      empty-text="Orders show up here once they're placed."
      error-text="The server hung up."
      class="min-h-40 rounded-lg border border-current/15"
      @retry="load"
    >
      <ul class="m-0 grid list-none gap-1 p-3">
        <li v-for="order in orders" :key="order">{{ order }}</li>
      </ul>

      <template #idle>
        <p class="m-0 p-8 text-center opacity-60">Press Load.</p>
      </template>
    </AppAsyncState>
  </div>

  <DemoOutput>status: {{ status }}</DemoOutput>
</template>
