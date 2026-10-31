<script setup lang="ts">
import { FormInput } from '@vunset/ui';
</script>

<template>
  <FormInput
    label="Password"
    type="password"
    autocomplete="new-password"
    :min-length="8"
    help="At least 8 characters."
    class="w-72"
  />
</template>
