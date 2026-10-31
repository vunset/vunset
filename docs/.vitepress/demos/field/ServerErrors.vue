<script setup lang="ts">
import { ref } from 'vue';
import { Button, FieldRoot, FieldLabel, Input, FieldError, useValidate } from '@vunset/vue';
import './field.css';
import '../button/button.css';

const form = ref({ username: '', email: '' });
const { setErrors, clearErrors } = useValidate();

// stands in for an API that rejects the form with an error per field
function submit() {
  Promise.reject({ username: 'That name is taken.', email: ['Use a work address.'] }).catch(setErrors);
}
</script>

<template>
  <form class="demo-field-col" @submit.prevent="submit">
    <FieldRoot name="username" class="demo-field">
      <FieldLabel class="demo-field-label">Username</FieldLabel>
      <Input v-model="form.username" class="demo-field-input" />
      <FieldError class="demo-field-error" />
    </FieldRoot>

    <FieldRoot name="email" class="demo-field">
      <FieldLabel class="demo-field-label">Work email</FieldLabel>
      <Input v-model="form.email" type="email" class="demo-field-input" />
      <FieldError class="demo-field-error" />
    </FieldRoot>

    <div class="demo-field-row">
      <Button type="submit" class="demo-button">Submit</Button>
      <Button class="demo-button" @click="clearErrors()">Clear errors</Button>
    </div>
  </form>
</template>
