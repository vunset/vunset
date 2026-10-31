<script setup lang="ts">
import { ref } from 'vue';
import { FormInput } from '@vunset/ui';

const search = ref('vunset');
</script>

<template>
  <FormInput v-model="search" label="Search" clearable placeholder="Anything" class="w-72">
    <template #start>
      <svg viewBox="0 0 16 16" class="size-4" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5L14 14" />
      </svg>
    </template>
  </FormInput>

  <DemoOutput>v-model: {{ search }}</DemoOutput>
</template>
