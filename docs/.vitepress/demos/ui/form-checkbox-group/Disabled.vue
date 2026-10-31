<script setup lang="ts">
import { FormCheckboxGroup } from '@vunset/ui';
</script>

<template>
  <FormCheckboxGroup label="Topics" disabled :options="['Vue', 'CSS', 'Rust']" />
</template>
