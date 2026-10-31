<script setup lang="ts">
import { ref } from 'vue';
import { AppButton, AppGroup, FormInput, FormSelect } from '@vunset/ui';

const query = ref('');
const amount = ref('120');
const currency = ref('EUR');
</script>

<template>
  <div class="grid w-full max-w-sm gap-4">
    <AppGroup label="Search" class="w-full">
      <FormInput v-model="query" placeholder="Search orders" aria-label="Search orders" />
      <AppButton variant="outline">Search</AppButton>
    </AppGroup>

    <AppGroup label="Amount" class="w-full">
      <FormInput v-model="amount" inputmode="decimal" aria-label="Amount" />
      <FormSelect v-model="currency" :options="['EUR', 'USD', 'GBP']" aria-label="Currency" align-with-trigger />
    </AppGroup>
  </div>

  <DemoOutput>query: {{ query }} · {{ amount }} {{ currency }}</DemoOutput>
</template>
