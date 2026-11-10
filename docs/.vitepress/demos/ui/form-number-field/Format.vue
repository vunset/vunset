<script setup lang="ts">
import { ref } from 'vue';
import { FormNumberField } from '@vunset/ui';

const budget = ref<number | null>(2500);
const tip = ref<number | null>(0.18);
</script>

<template>
  <div class="grid w-56 gap-4">
    <FormNumberField
      v-model="budget"
      label="Budget"
      :min="0"
      :step="50"
      :large-step="500"
      :format="{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }"
    />
    <FormNumberField v-model="tip" label="Tip" :min="0" :max="1" :step="0.01" :format="{ style: 'percent' }" wheel />
  </div>

  <DemoOutput>budget: {{ budget }} · tip: {{ tip }}</DemoOutput>
</template>
