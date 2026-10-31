<script setup lang="ts">
import { FormToggleGroup } from '@vunset/ui';
</script>

<template>
  <FormToggleGroup label="View" disabled default-value="list" :options="['list', 'grid']" />
</template>
