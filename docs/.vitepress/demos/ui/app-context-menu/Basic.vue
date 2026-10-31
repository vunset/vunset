<script setup lang="ts">
import { computed, ref } from 'vue';
import { AppContextMenu, AppMenuItems, type AppMenuEntry } from '@vunset/ui';

const last = ref('—');
const grid = ref(true);
const run = (label: string) => () => (last.value = label);

const items = computed<AppMenuEntry[]>(() => [
  { label: 'Cut', shortcut: '⌘X', onSelect: run('Cut') },
  { label: 'Copy', shortcut: '⌘C', onSelect: run('Copy') },
  { label: 'Paste', shortcut: '⌘V', disabled: true },
  { type: 'separator' },
  { type: 'checkbox', label: 'Show grid', checked: grid.value, onChange: (v) => (grid.value = v) },
  {
    label: 'Arrange',
    items: [
      { label: 'Bring to front', onSelect: run('Bring to front') },
      { label: 'Send to back', onSelect: run('Send to back') }
    ]
  },
  { type: 'separator' },
  { label: 'Delete', tone: 'danger', onSelect: run('Delete') }
]);
</script>

<template>
  <AppContextMenu
    class="grid h-40 w-full max-w-sm place-items-center rounded-lg border border-dotted border-current/30 text-sm opacity-80"
  >
    <template #trigger>Right-click, or long-press, here</template>

    <AppMenuItems :items="items" />
  </AppContextMenu>

  <DemoOutput>last: {{ last }} · grid: {{ grid }}</DemoOutput>
</template>
