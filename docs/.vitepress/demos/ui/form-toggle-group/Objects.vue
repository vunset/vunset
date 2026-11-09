<script setup lang="ts">
import { ref } from 'vue';
import { FormToggleGroup } from '@vunset/ui';

const plans = [
  { code: 'free', label: 'Free', price: 0 },
  { code: 'pro', label: 'Pro', price: 12 },
  { code: 'team', label: 'Team', price: 30 }
];

const plan = ref(plans[1]!);
</script>

<template>
  <FormToggleGroup v-model.object="plan" label="Plan" :options="plans" value-key="code" keep-one />

  <DemoOutput>{{ plan.label }}: ${{ plan.price }} a month</DemoOutput>
</template>
