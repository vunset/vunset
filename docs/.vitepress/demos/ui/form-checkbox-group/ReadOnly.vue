<script setup lang="ts">
import { FormCheckboxGroup } from '@vunset/ui';
</script>

<template>
  <FormCheckboxGroup label="Topics" read-only :default-value="['Vue', 'CSS']" :options="['Vue', 'CSS', 'Rust']" />
</template>
