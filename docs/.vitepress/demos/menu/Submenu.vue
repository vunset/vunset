<script setup lang="ts">
import { MenuRoot, MenuTrigger, Portal, Positioner, Popup, MenuItem } from '@vunset/vue';
import './menu.css';
</script>

<template>
  <MenuRoot>
    <MenuTrigger class="demo-menu-trigger">File</MenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-menu-popup">
          <MenuItem class="demo-menu-item">New</MenuItem>

          <MenuRoot>
            <MenuTrigger class="demo-menu-item">
              Open recent
              <span class="demo-menu-submenu-arrow" aria-hidden="true">›</span>
            </MenuTrigger>

            <Portal>
              <Positioner>
                <Popup class="demo-menu-popup">
                  <MenuItem class="demo-menu-item">report.pdf</MenuItem>
                  <MenuItem class="demo-menu-item">notes.md</MenuItem>
                </Popup>
              </Positioner>
            </Portal>
          </MenuRoot>

          <MenuItem class="demo-menu-item">Save</MenuItem>
        </Popup>
      </Positioner>
    </Portal>
  </MenuRoot>
</template>
