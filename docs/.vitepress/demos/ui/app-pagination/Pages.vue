<script setup lang="ts">
import { AppPagination } from '@vunset/ui';
</script>

<template>
  <div class="grid gap-3">
    <AppPagination :total-pages="40" :default-value="20" />
    <AppPagination :total-pages="40" :default-value="20" :siblings="2" :boundaries="2" />
  </div>
</template>
