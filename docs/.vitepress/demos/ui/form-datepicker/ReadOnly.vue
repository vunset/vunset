<script setup lang="ts">
import { FormDatepicker } from '@vunset/ui';
</script>

<template>
  <FormDatepicker label="Signed on" read-only :default-value="new Date(2026, 9, 3)" class="w-72" />
</template>
