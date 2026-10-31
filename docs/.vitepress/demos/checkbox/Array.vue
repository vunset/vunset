<script setup lang="ts">
import { ref } from 'vue';
import { CheckboxRoot, CheckboxIndicator } from '@vunset/vue';
import './checkbox.css';

const toppings = ref(['cheese']);
</script>

<template>
  <div class="demo-checkbox-group">
    <label v-for="topping in ['cheese', 'basil', 'chilli']" :key="topping" class="demo-checkbox-label">
      <CheckboxRoot v-model="toppings" :value="topping" class="demo-checkbox">
        <CheckboxIndicator class="demo-checkbox-indicator" />
      </CheckboxRoot>
      {{ topping }}
    </label>
  </div>

  <DemoOutput>v-model: {{ toppings }}</DemoOutput>
</template>
