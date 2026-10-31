<script setup lang="ts">
import { FormCombobox } from '@vunset/ui';
</script>

<template>
  <FormCombobox label="Framework" disabled placeholder="Not now" :options="['Vue', 'Svelte']" class="w-72" />
</template>
