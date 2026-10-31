<script setup lang="ts">
import { ref } from 'vue';
import { CheckboxGroup, CheckboxRoot, CheckboxIndicator } from '@vunset/vue';
import './checkbox.css';

const toppings = ref(['cheese']);
</script>

<template>
  <CheckboxGroup v-model="toppings" name="toppings" aria-label="Toppings" class="demo-checkbox-group">
    <label v-for="topping in ['cheese', 'basil', 'chilli']" :key="topping" class="demo-checkbox-label">
      <CheckboxRoot :value="topping" class="demo-checkbox">
        <CheckboxIndicator class="demo-checkbox-indicator" />
      </CheckboxRoot>
      {{ topping }}
    </label>
  </CheckboxGroup>

  <DemoOutput>v-model: {{ toppings }}</DemoOutput>
</template>
