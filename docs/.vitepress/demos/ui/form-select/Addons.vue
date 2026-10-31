<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const country = ref<string | null>(null);
</script>

<template>
  <FormSelect
    v-model="country"
    label="Ship to"
    placeholder="Pick a country"
    :options="['France', 'Germany', 'Spain']"
    class="w-72"
  >
    <template #start>
      <svg viewBox="0 0 16 16" class="size-4" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="8" cy="8" r="6" />
        <path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" />
      </svg>
    </template>
  </FormSelect>
</template>
