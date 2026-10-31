<script setup lang="ts">
import { ref } from 'vue';
import { FormCombobox } from '@vunset/ui';

const framework = ref<string | null>(null);
</script>

<template>
  <FormCombobox
    v-model="framework"
    label="Framework"
    help="Type to filter."
    placeholder="Search frameworks"
    :options="['Vue', 'Svelte', 'Solid', 'Angular', 'React']"
    class="w-72"
  />

  <DemoOutput>v-model: {{ framework }}</DemoOutput>
</template>
