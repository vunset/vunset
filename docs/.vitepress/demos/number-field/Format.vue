<script setup lang="ts">
import { ref } from 'vue';
import { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } from '@vunset/vue';
import './number-field.css';

const price = ref<number | null>(1249.5);
const discount = ref<number | null>(0.15);
</script>

<template>
  <div class="demo-number-field-stack">
    <NumberFieldRoot
      v-model="price"
      :min="0"
      :step="0.5"
      :large-step="100"
      :format="{ style: 'currency', currency: 'EUR' }"
      locale="de-DE"
      class="demo-number-field"
    >
      <NumberFieldDecrement class="demo-number-field-button">−</NumberFieldDecrement>
      <NumberFieldInput class="demo-number-field-input" aria-label="Price" />
      <NumberFieldIncrement class="demo-number-field-button">+</NumberFieldIncrement>
    </NumberFieldRoot>

    <NumberFieldRoot
      v-model="discount"
      :min="0"
      :max="1"
      :step="0.05"
      :format="{ style: 'percent' }"
      wheel
      class="demo-number-field"
    >
      <NumberFieldDecrement class="demo-number-field-button">−</NumberFieldDecrement>
      <NumberFieldInput class="demo-number-field-input" aria-label="Discount" />
      <NumberFieldIncrement class="demo-number-field-button">+</NumberFieldIncrement>
    </NumberFieldRoot>
  </div>

  <DemoOutput>price: {{ price }} · discount: {{ discount }}</DemoOutput>
</template>
