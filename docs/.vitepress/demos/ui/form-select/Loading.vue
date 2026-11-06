<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const country = ref<string | null>(null);
const options = ref<string[]>([]);
const loading = ref(false);

// Fetches the options the first time the popup opens.
async function onOpen(open: boolean) {
  if (!open || options.value.length || loading.value) return;
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  options.value = ['France', 'Germany', 'Spain', 'Iceland', 'United States'];
  loading.value = false;
}
</script>

<template>
  <FormSelect
    v-model="country"
    label="Country"
    placeholder="Pick a country"
    :options="options"
    :loading="loading"
    class="w-72"
    @update:open="onOpen"
  />

  <DemoOutput>v-model: {{ country }}</DemoOutput>
</template>
