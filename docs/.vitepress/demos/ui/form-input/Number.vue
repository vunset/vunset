<script setup lang="ts">
import { ref } from 'vue';
import { FormInput } from '@vunset/ui';

const quantity = ref('1');
</script>

<template>
  <FormInput
    v-model="quantity"
    label="Quantity"
    type="number"
    :min="0"
    :max="99"
    help="Letters and a minus never land."
    class="w-72"
  >
    <template #end>of 99</template>
  </FormInput>

  <DemoOutput>v-model: {{ quantity }}</DemoOutput>
</template>
