<script setup lang="ts">
import { ref } from 'vue';
import { AppIcon, FormCombobox } from '@vunset/ui';
import { MANY_OPTIONS, MANY_PRESETS } from '../many-presets';

const chosen = ref<string[]>([]);
</script>

<template>
  <FormCombobox
    v-model="chosen"
    label="Companies"
    multiple
    placeholder="Add a company"
    :flatten="5"
    :options="MANY_OPTIONS"
    :presets="MANY_PRESETS"
    presets-label="Presets"
    :preset-columns="4"
    class="w-72"
  >
    <template #start><AppIcon name="search" /></template>
  </FormCombobox>

  <DemoOutput>{{ chosen.length }} chosen</DemoOutput>
</template>
