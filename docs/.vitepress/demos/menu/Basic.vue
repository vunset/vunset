<script setup lang="ts">
import { ref } from 'vue';
import { MenuRoot, MenuTrigger, Portal, Positioner, Popup, MenuItem, Separator } from '@vunset/vue';
import './menu.css';

const last = ref('—');
</script>

<template>
  <MenuRoot>
    <MenuTrigger class="demo-menu-trigger">Actions</MenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-menu-popup">
          <MenuItem class="demo-menu-item" @select="last = 'Rename'">Rename</MenuItem>
          <MenuItem class="demo-menu-item" @select="last = 'Duplicate'">Duplicate</MenuItem>
          <MenuItem disabled class="demo-menu-item">Move to…</MenuItem>
          <Separator class="demo-menu-separator" />
          <MenuItem class="demo-menu-item" @select="last = 'Delete'">Delete</MenuItem>
        </Popup>
      </Positioner>
    </Portal>
  </MenuRoot>

  <DemoOutput>@select: {{ last }}</DemoOutput>
</template>
