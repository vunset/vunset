<script setup lang="ts">
import { ref } from 'vue';
import { CheckboxGroup, CheckboxRoot, CheckboxIndicator } from '@vunset/vue';
import './checkbox.css';

const toppings = ref(['cheese']);
</script>

<template>
  <CheckboxGroup v-model="toppings" aria-label="Toppings" class="demo-checkbox-group">
    <label class="demo-checkbox-label">
      <CheckboxRoot parent class="demo-checkbox">
        <CheckboxIndicator class="demo-checkbox-indicator" />
      </CheckboxRoot>
      All toppings
    </label>

    <label v-for="topping in ['cheese', 'basil', 'chilli']" :key="topping" class="demo-checkbox-label">
      <CheckboxRoot :value="topping" class="demo-checkbox">
        <CheckboxIndicator class="demo-checkbox-indicator" />
      </CheckboxRoot>
      {{ topping }}
    </label>

    <label class="demo-checkbox-label">
      <CheckboxRoot value="anchovies" disabled class="demo-checkbox">
        <CheckboxIndicator class="demo-checkbox-indicator" />
      </CheckboxRoot>
      anchovies (sold out)
    </label>
  </CheckboxGroup>

  <DemoOutput>v-model: {{ toppings }}</DemoOutput>
</template>
