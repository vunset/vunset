<script setup lang="ts">
import { ref } from 'vue';
import { FormCombobox } from '@vunset/ui';

const cities = ref(['Paris', 'Berlin', 'Madrid', 'Lisbon']);
</script>

<template>
  <FormCombobox
    v-model="cities"
    label="Cities"
    multiple
    :flatten="2"
    :options="['Paris', 'Berlin', 'Madrid', 'Lisbon', 'Prague', 'Vienna']"
    class="w-72"
  />

  <DemoOutput>v-model: {{ cities }}</DemoOutput>
</template>
