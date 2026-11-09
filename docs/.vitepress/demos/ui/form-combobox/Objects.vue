<script setup lang="ts">
import { ref } from 'vue';
import { FormCombobox } from '@vunset/ui';

const cities = [
  { id: 1, name: 'Kyiv', country: 'Ukraine' },
  { id: 2, name: 'Warsaw', country: 'Poland' },
  { id: 3, name: 'Vienna', country: 'Austria' },
  { id: 4, name: 'Lisbon', country: 'Portugal' }
];

const picked = ref([cities[0]!]);
</script>

<template>
  <FormCombobox
    v-model.object="picked"
    label="Cities"
    :options="cities"
    value-key="id"
    label-key="name"
    multiple
    placeholder="Add a city"
    class="w-72"
  />

  <DemoOutput>{{ picked.map((city) => city.country).join(', ') || 'None' }}</DemoOutput>
</template>
