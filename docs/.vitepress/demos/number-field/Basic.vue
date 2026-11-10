<script setup lang="ts">
import { ref } from 'vue';
import { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } from '@vunset/vue';
import './number-field.css';

const quantity = ref<number | null>(1);
</script>

<template>
  <NumberFieldRoot v-model="quantity" :min="0" :max="99" class="demo-number-field">
    <NumberFieldDecrement class="demo-number-field-button">−</NumberFieldDecrement>
    <NumberFieldInput class="demo-number-field-input" aria-label="Quantity" />
    <NumberFieldIncrement class="demo-number-field-button">+</NumberFieldIncrement>
  </NumberFieldRoot>

  <DemoOutput>v-model: {{ quantity }}</DemoOutput>
</template>
