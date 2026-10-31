<script setup lang="ts">
import { computed, ref } from 'vue';
import { AppMenu, AppButton, type AppMenuEntry } from '@vunset/ui';

const wrap = ref(true);
const minimap = ref(false);
const sort = ref<string | number>('name');

// A computed, so each item reads the current value.
const items = computed<AppMenuEntry[]>(() => [
  {
    type: 'group',
    label: 'Editor',
    items: [
      { type: 'checkbox', label: 'Word wrap', checked: wrap.value, onChange: (v) => (wrap.value = v) },
      { type: 'checkbox', label: 'Minimap', checked: minimap.value, onChange: (v) => (minimap.value = v) }
    ]
  },
  { type: 'separator' },
  {
    type: 'radio',
    label: 'Sort by',
    value: sort.value,
    onChange: (v) => (sort.value = v),
    options: [
      { value: 'name', label: 'Name' },
      { value: 'date', label: 'Date modified' },
      { value: 'size', label: 'Size' }
    ]
  }
]);
</script>

<template>
  <AppMenu trigger="View" :as="AppButton" variant="outline" :items="items" />

  <DemoOutput>wrap: {{ wrap }} · minimap: {{ minimap }} · sort: {{ sort }}</DemoOutput>
</template>
