<script setup lang="ts">
import { ref } from 'vue';
import { FormRange } from '@vunset/ui';

const price = ref([200, 800]);
</script>

<template>
  <FormRange
    v-model="price"
    label="Price"
    :min="0"
    :max="1000"
    :step="10"
    :min-steps-between-values="5"
    :format="{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }"
    class="w-72"
  />

  <DemoOutput>v-model: {{ price }}</DemoOutput>
</template>
