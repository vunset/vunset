<script setup lang="ts">
import { FieldRoot, FieldLabel, Input, FieldDescription } from '@vunset/vue';
import './field.css';
</script>

<template>
  <FieldRoot class="demo-field">
    <FieldLabel class="demo-field-label">Display name</FieldLabel>
    <Input placeholder="Ada Lovelace" class="demo-field-input" />
    <FieldDescription class="demo-field-description">Shown on your public profile.</FieldDescription>
  </FieldRoot>
</template>
