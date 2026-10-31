<script setup lang="ts">
import { ref, useId } from 'vue';
import { Input } from '@vunset/vue';
import './input.css';

const id = useId();
const adjustment = ref('');
</script>

<template>
  <div class="demo-input-field">
    <label :for="id">Balance adjustment</label>
    <Input
      :id="id"
      v-model="adjustment"
      type="number"
      :min="-500"
      :max="500"
      :step="0.01"
      placeholder="0.00"
      class="demo-input"
    />
    <p class="demo-input-hint">Try -20 or 10.50: a negative minimum lets the minus through.</p>
  </div>

  <DemoOutput>v-model: {{ adjustment }}</DemoOutput>
</template>
