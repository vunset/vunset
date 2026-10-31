<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const COUNTRIES = ['France', 'Germany', 'Spain', 'Iceland', 'United States', 'Brazil', 'Canada'];

const country = ref<string | null>('Spain');
</script>

<template>
  <FormSelect
    v-model="country"
    label="Country"
    searchable
    search-placeholder="Find a country"
    empty-text="No country by that name"
    :options="COUNTRIES"
    class="w-72"
  />

  <DemoOutput>v-model: {{ country }}</DemoOutput>
</template>
