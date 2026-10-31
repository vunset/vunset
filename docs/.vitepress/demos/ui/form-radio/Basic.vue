<script setup lang="ts">
import { ref } from 'vue';
import { FormRadioGroup } from '@vunset/ui';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro', help: 'Billed yearly.' },
  { value: 'team', label: 'Team', disabled: true }
];

const plan = ref<string>();
</script>

<template>
  <FormRadioGroup
    v-model="plan"
    label="Plan"
    help="You can change it any time."
    :options="PLANS"
    name="plan"
    required
    :error="plan ? undefined : 'Pick a plan'"
  />

  <DemoOutput>v-model: {{ plan }}</DemoOutput>
</template>
