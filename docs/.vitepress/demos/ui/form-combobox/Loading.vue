<script setup lang="ts">
import { ref, watch } from 'vue';
import { FormCombobox } from '@vunset/ui';

const ALL = ['Vue', 'Svelte', 'Solid', 'Angular', 'React', 'Preact', 'Qwik', 'Lit', 'Ember', 'Alpine'];

const framework = ref<string | null>(null);
const query = ref('');
const options = ref<string[]>([]);
const loading = ref(false);
let latest = 0;

// Stands in for a server search; only the latest query's answer lands.
watch(query, async (text) => {
  if (!text.trim()) return;
  const id = ++latest;
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (id !== latest) return;
  options.value = ALL.filter((name) => name.toLowerCase().includes(text.trim().toLowerCase()));
  loading.value = false;
});
</script>

<template>
  <FormCombobox
    v-model="framework"
    v-model:query="query"
    label="Framework"
    placeholder="Type to search"
    empty-text="Type a name to search"
    :options="options"
    :loading="loading"
    class="w-72"
  />

  <DemoOutput>v-model: {{ framework }} · query: {{ query }}</DemoOutput>
</template>
