<script setup lang="ts">
import { FormField } from '@vunset/ui';
import { CheckboxRoot, CheckboxIndicator } from '@vunset/vue';
</script>

<template>
  <FormField layout="inline" label="Remember me" help="For thirty days on this device.">
    <CheckboxRoot class="form-checkbox">
      <CheckboxIndicator class="form-checkbox-indicator">
        <svg class="form-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
      </CheckboxIndicator>
    </CheckboxRoot>
  </FormField>
</template>
