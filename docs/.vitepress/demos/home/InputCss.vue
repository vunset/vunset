<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@vunset/vue';

const email = ref('');
</script>

<template>
  <Input v-model="email" type="email" placeholder="ada@vunset.com" class="email-input" />

  <DemoOutput>v-model: {{ email }}</DemoOutput>
</template>

<style>
.email-input {
  box-sizing: border-box;
  width: 16rem;
  height: 2.25rem;
  padding: 0 0.75rem;
  border: 1px dotted color-mix(in srgb, currentColor 30%, transparent);
  background: color-mix(in srgb, currentColor 3%, transparent);
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  outline: none;
}

.email-input::placeholder {
  opacity: 0.5;
}

.email-input:focus-visible {
  border-color: currentColor;
}
</style>
