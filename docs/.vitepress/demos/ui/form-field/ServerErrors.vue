<script setup lang="ts">
import { AppButton, FormField } from '@vunset/ui';
import { FieldGroup, Input, useValidate } from '@vunset/vue';

const { setErrors, clearErrors } = useValidate();

function submit() {
  setErrors({ username: 'That username is taken.' });
}
</script>

<template>
  <form class="grid w-72 gap-3" @submit.prevent="submit">
    <FormField label="Username" name="username">
      <FieldGroup class="form-control form-input">
        <Input class="form-input-control" default-value="ada" />
      </FieldGroup>
    </FormField>

    <div class="flex gap-2">
      <AppButton type="submit" variant="solid" tone="accent">Sign up</AppButton>
      <AppButton variant="soft" @click="clearErrors()">Clear</AppButton>
    </div>
  </form>
</template>
