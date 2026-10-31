<script setup lang="ts">
import { MenuRoot, MenuTrigger, Portal, Positioner, Popup, MenuItem } from '@vunset/vue';
import './menu.css';
</script>

<template>
  <MenuRoot open-on-hover :delay="120" :close-delay="200">
    <MenuTrigger class="demo-menu-trigger">Help</MenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-menu-popup">
          <MenuItem class="demo-menu-item">Documentation</MenuItem>
          <MenuItem class="demo-menu-item">Keyboard shortcuts</MenuItem>
          <MenuItem class="demo-menu-item">Report an issue</MenuItem>
        </Popup>
      </Positioner>
    </Portal>
  </MenuRoot>
</template>
