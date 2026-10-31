<script setup lang="ts">
import { FormSelect } from '@vunset/ui';
</script>

<template>
  <FormSelect label="Country" read-only default-value="France" :options="['France', 'Germany']" class="w-72" />
</template>
