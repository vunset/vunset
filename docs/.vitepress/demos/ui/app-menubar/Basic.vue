<script setup lang="ts">
import { computed, ref } from 'vue';
import { AppMenubar, type AppMenubarEntry } from '@vunset/ui';

const last = ref('—');
const wrap = ref(true);
const run = (label: string) => () => (last.value = label);

const items = computed<AppMenubarEntry[]>(() => [
  {
    label: 'File',
    items: [
      { label: 'New file', shortcut: '⌘N', onSelect: run('New file') },
      { label: 'Open recent', items: [{ label: 'report.pdf', onSelect: run('report.pdf') }] },
      { type: 'separator' },
      { label: 'Save', shortcut: '⌘S', onSelect: run('Save') }
    ]
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: '⌘Z', onSelect: run('Undo') },
      { label: 'Redo', shortcut: '⇧⌘Z', onSelect: run('Redo') }
    ]
  },
  {
    label: 'View',
    items: [{ type: 'checkbox', label: 'Word wrap', checked: wrap.value, onChange: (v) => (wrap.value = v) }]
  },
  { label: 'Help', items: [{ label: 'About' }], disabled: true }
]);
</script>

<template>
  <AppMenubar :items="items" />

  <DemoOutput>last: {{ last }} · wrap: {{ wrap }}</DemoOutput>
</template>
