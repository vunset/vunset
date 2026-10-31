<script setup lang="ts">
import { ref } from 'vue';
import { FormCombobox } from '@vunset/ui';

const framework = ref<string | null>(null);
</script>

<template>
  <FormCombobox
    v-model="framework"
    label="Framework"
    required
    :options="['Vue', 'Svelte', 'Solid']"
    :error="framework ? undefined : 'Pick a framework'"
    class="w-72"
  />
</template>
