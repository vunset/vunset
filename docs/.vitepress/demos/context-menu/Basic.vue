<script setup lang="ts">
import { ref } from 'vue';
import { ContextMenuRoot, ContextMenuTrigger, Portal, Positioner, Popup, MenuItem, Separator } from '@vunset/vue';
import '../menu/menu.css';
import './context-menu.css';

const last = ref('—');
</script>

<template>
  <ContextMenuRoot>
    <ContextMenuTrigger class="demo-context-area">Right-click here</ContextMenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-menu-popup">
          <MenuItem class="demo-menu-item" @select="last = 'Back'">Back</MenuItem>
          <MenuItem class="demo-menu-item" @select="last = 'Reload'">Reload</MenuItem>
          <Separator class="demo-menu-separator" />
          <MenuItem class="demo-menu-item" @select="last = 'Inspect'">Inspect</MenuItem>
        </Popup>
      </Positioner>
    </Portal>
  </ContextMenuRoot>

  <DemoOutput>@select: {{ last }}</DemoOutput>
</template>
