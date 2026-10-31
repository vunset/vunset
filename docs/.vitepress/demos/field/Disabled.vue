<script setup lang="ts">
import { FieldRoot, FieldLabel, Input } from '@vunset/vue';
import './field.css';
</script>

<template>
  <div class="demo-field-col">
    <FieldRoot read-only class="demo-field">
      <FieldLabel class="demo-field-label">Read-only</FieldLabel>
      <Input default-value="Can be selected, not edited" class="demo-field-input" />
    </FieldRoot>

    <FieldRoot disabled class="demo-field">
      <FieldLabel class="demo-field-label">Disabled</FieldLabel>
      <Input default-value="Unavailable" class="demo-field-input" />
    </FieldRoot>
  </div>
</template>
