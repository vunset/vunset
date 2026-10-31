<script setup lang="ts">
import { MenuRoot, MenuTrigger, Portal, Positioner, Popup, MenuArrow, MenuItem } from '@vunset/vue';
import './menu.css';
</script>

<template>
  <MenuRoot :side-offset="10">
    <MenuTrigger class="demo-menu-trigger">Share</MenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-menu-popup">
          <MenuArrow class="demo-menu-arrow" />
          <MenuItem class="demo-menu-item">Copy link</MenuItem>
          <MenuItem class="demo-menu-item">Email</MenuItem>
        </Popup>
      </Positioner>
    </Portal>
  </MenuRoot>
</template>
