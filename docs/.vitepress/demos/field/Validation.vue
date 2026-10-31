<script setup lang="ts">
import { computed, ref } from 'vue';
import { FieldRoot, FieldLabel, Input, FieldError } from '@vunset/vue';
import './field.css';

const email = ref('');
const error = computed(() => {
  if (email.value === '') return 'An email address is required.';
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email.value)) return 'That does not look like an email address.';
  return '';
});
</script>

<template>
  <FieldRoot v-slot="{ touched }" required :invalid="!!error" class="demo-field">
    <FieldLabel class="demo-field-label">Email</FieldLabel>
    <Input v-model="email" type="email" placeholder="you@example.com" class="demo-field-input" />
    <FieldError :match="touched && !!error" class="demo-field-error">{{ error }}</FieldError>
  </FieldRoot>
</template>
