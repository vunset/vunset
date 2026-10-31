<script setup lang="ts">
import { h, ref } from 'vue';
import { AppMenu, AppButton, type AppMenuEntry } from '@vunset/ui';

const icon = (d: string) => () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, h('path', { d }));

const last = ref('—');
const run = (label: string) => () => (last.value = label);

const items: AppMenuEntry[] = [
  { label: 'New file', icon: icon('M4 2.5h5l3 3v8H4z'), shortcut: '⌘N', onSelect: run('New file') },
  { label: 'Open…', shortcut: '⌘O', onSelect: run('Open') },
  {
    label: 'Open recent',
    items: [
      { label: 'report.pdf', onSelect: run('report.pdf') },
      { label: 'notes.md', onSelect: run('notes.md') },
      { type: 'separator' },
      { label: 'Clear recent', disabled: true }
    ]
  },
  { type: 'separator' },
  { label: 'Delete', icon: icon('M3 4.5h10M6 4.5v-2h4v2M4.5 4.5l.5 9h6l.5-9'), tone: 'danger', onSelect: run('Delete') }
];
</script>

<template>
  <AppMenu trigger="File" :as="AppButton" variant="outline" :items="items" />

  <DemoOutput>last: {{ last }}</DemoOutput>
</template>
