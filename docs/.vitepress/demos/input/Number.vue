<script setup lang="ts">
import { ref, useId } from 'vue';
import { Input } from '@vunset/vue';
import './input.css';

const id = useId();
const quantity = ref('1');
</script>

<template>
  <div class="demo-input-field">
    <label :for="id">Quantity</label>
    <Input :id="id" v-model="quantity" type="number" :min="0" :max="99" class="demo-input" />
    <p class="demo-input-hint">Letters never land, and with a minimum of 0 neither does a minus. Over 99, the border turns solid: <code>data-invalid</code>.</p>
  </div>

  <DemoOutput>v-model: {{ quantity }}</DemoOutput>
</template>
