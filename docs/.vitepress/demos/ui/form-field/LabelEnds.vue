<script setup lang="ts">
import { FormInput, AppIcon } from '@vunset/ui';
</script>

<template>
  <FormInput label="Password" type="password">
    <template #label-start><AppIcon name="alert-info" /></template>
    <template #label-end><a href="#">Forgot password?</a></template>
  </FormInput>
</template>
