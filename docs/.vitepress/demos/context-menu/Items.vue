<script setup lang="ts">
import { ref } from 'vue';
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  Portal,
  Positioner,
  Popup,
  MenuRoot,
  MenuTrigger,
  MenuItem,
  MenuCheckboxItem,
  MenuItemIndicator,
  Separator
} from '@vunset/vue';
import '../menu/menu.css';
import './context-menu.css';

const grid = ref(true);
</script>

<template>
  <ContextMenuRoot>
    <ContextMenuTrigger class="demo-context-area">Right-click the canvas</ContextMenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-menu-popup">
          <MenuCheckboxItem v-model="grid" class="demo-menu-item">
            <MenuItemIndicator keep-mounted class="demo-menu-indicator">✓</MenuItemIndicator>
            Show grid
          </MenuCheckboxItem>

          <Separator class="demo-menu-separator" />

          <MenuRoot>
            <MenuTrigger class="demo-menu-item">
              Arrange
              <span class="demo-menu-submenu-arrow" aria-hidden="true">›</span>
            </MenuTrigger>
            <Portal>
              <Positioner>
                <Popup class="demo-menu-popup">
                  <MenuItem class="demo-menu-item">Bring to front</MenuItem>
                  <MenuItem class="demo-menu-item">Send to back</MenuItem>
                </Popup>
              </Positioner>
            </Portal>
          </MenuRoot>
        </Popup>
      </Positioner>
    </Portal>
  </ContextMenuRoot>
</template>
