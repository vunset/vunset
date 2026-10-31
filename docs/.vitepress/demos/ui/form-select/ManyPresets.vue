<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';
import { MANY_OPTIONS, MANY_PRESETS } from '../many-presets';

const chosen = ref<string[]>([]);
</script>

<template>
  <FormSelect
    v-model="chosen"
    label="Companies"
    multiple
    searchable
    placeholder="None yet"
    :flatten="5"
    :options="MANY_OPTIONS"
    :presets="MANY_PRESETS"
    presets-label="Presets"
    :preset-columns="3"
    class="w-72"
  />

  <DemoOutput>{{ chosen.length }} chosen</DemoOutput>
</template>
