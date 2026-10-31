<script setup lang="ts">
import { FormField } from '@vunset/ui';
import { FieldGroup, Input } from '@vunset/vue';
</script>

<template>
  <FormField label="Username" help="Letters, digits and dashes." class="w-72">
    <FieldGroup class="form-control form-input">
      <Input class="form-input-control" placeholder="ada-l" />
    </FieldGroup>
  </FormField>
</template>
