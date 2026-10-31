<script setup lang="ts">
import { ref } from 'vue';
import { FormCombobox } from '@vunset/ui';

const REGIONS = {
  Iberia: ['Lisbon', 'Porto', 'Madrid', 'Seville'],
  DACH: ['Berlin', 'Munich', 'Vienna', 'Zurich'],
  Benelux: ['Amsterdam', 'Brussels', 'Luxembourg'],
  Nordics: ['Oslo', 'Stockholm', 'Copenhagen', 'Helsinki'],
  Baltics: ['Tallinn', 'Riga', 'Vilnius'],
  'British Isles': ['London', 'Dublin', 'Edinburgh'],
  'Central Europe': ['Paris', 'Prague', 'Budapest'],
  Balkans: ['Zagreb', 'Belgrade', 'Sofia']
};

const CITIES = Object.values(REGIONS).flat();
const PRESETS = [
  ...Object.entries(REGIONS).map(([label, values]) => ({ label, values })),
  {
    label: 'Trips',
    collapsed: true,
    presets: [
      { label: 'Rail pass', values: ['Paris', 'Brussels', 'Amsterdam', 'Berlin'] },
      { label: 'Capitals', values: ['Lisbon', 'Madrid', 'Paris', 'Berlin', 'Vienna'] },
      { label: 'Night train', values: ['Vienna', 'Zurich'], disabled: true }
    ]
  }
];

const cities = ref<string[]>(['Porto']);
</script>

<template>
  <FormCombobox
    v-model="cities"
    label="Cities"
    multiple
    placeholder="Add a city"
    :flatten="3"
    :options="CITIES"
    :presets="PRESETS"
    presets-label="Regions"
    :preset-columns="2"
    class="w-72"
  />

  <DemoOutput>v-model: {{ cities }}</DemoOutput>
</template>
