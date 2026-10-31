<script setup lang="ts">
import { computed, ref } from 'vue';
import { FormInput } from '@vunset/ui';

const email = ref('');
const error = computed(() => {
  if (email.value === '') return 'An email address is required.';
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email.value)) return 'That does not look like an email address.';
  return undefined;
});
</script>

<template>
  <FormInput
    v-model="email"
    label="Email"
    type="email"
    required
    autocomplete="email"
    placeholder="you@example.com"
    :error="error"
    class="w-72"
  />

  <DemoOutput>v-model: {{ email }}</DemoOutput>
</template>
