<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const currencies = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£' },
  { code: 'UAH', name: 'Hryvnia', symbol: '₴' }
];

const currency = ref(currencies[0]!);
</script>

<template>
  <FormSelect
    v-model.object="currency"
    label="Currency"
    :options="currencies"
    value-key="code"
    label-key="name"
    class="w-72"
  />

  <DemoOutput>{{ currency.symbol }} {{ currency.code }}</DemoOutput>
</template>
