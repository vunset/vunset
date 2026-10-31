<script setup lang="ts">
import { FormSelect } from '@vunset/ui';
</script>

<template>
  <FormSelect label="Country" disabled placeholder="Pick a country" :options="['France', 'Germany']" class="w-72" />
</template>
