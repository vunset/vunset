<script setup lang="ts">
import { ref } from 'vue';
import { ContextMenuRoot, ContextMenuTrigger, Portal, Positioner, Popup, MenuItem, Separator } from '@vunset/vue';
import '../menu/menu.css';
import './context-menu.css';

const files = [
  { name: 'shot-014.raw', size: '48 MB' },
  { name: 'shot-015.raw', size: '51 MB' },
  { name: 'contact-sheet.pdf', size: '2 MB' }
];

const pressed = ref(files[0]!.name);
const last = ref('—');
</script>

<template>
  <ContextMenuRoot>
    <ContextMenuTrigger class="demo-context-area demo-context-rows">
      <div
        v-for="file in files"
        :key="file.name"
        class="demo-context-row"
        :data-selected="pressed === file.name ? '' : undefined"
        @pointerdown="pressed = file.name"
      >
        <span>{{ file.name }}</span>
        <span>{{ file.size }}</span>
      </div>
    </ContextMenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-menu-popup">
          <MenuItem class="demo-menu-item" @select="last = `Open ${pressed}`">Open</MenuItem>
          <MenuItem class="demo-menu-item" @select="last = `Rename ${pressed}`">Rename</MenuItem>
          <Separator class="demo-menu-separator" />
          <MenuItem class="demo-menu-item" @select="last = `Delete ${pressed}`">Delete</MenuItem>
        </Popup>
      </Positioner>
    </Portal>
  </ContextMenuRoot>

  <DemoOutput>@select: {{ last }}</DemoOutput>
</template>
