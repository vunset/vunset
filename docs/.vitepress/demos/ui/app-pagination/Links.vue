<script setup lang="ts">
import { AppPagination } from '@vunset/ui';
</script>

<template>
  <AppPagination :total-pages="12" :default-value="4" :to="(page) => `#page-${page}`" />
</template>
