<script setup lang="ts">
import { ref } from 'vue';
import {
  MenubarRoot,
  MenuRoot,
  MenuTrigger,
  Portal,
  Positioner,
  Popup,
  MenuItem,
  MenuCheckboxItem,
  MenuItemIndicator,
  Separator
} from '@vunset/vue';
import '../menu/menu.css';
import './menubar.css';

const sidebar = ref(true);
const statusBar = ref(false);
</script>

<template>
  <MenubarRoot open-on-hover class="demo-menubar">
    <MenuRoot>
      <MenuTrigger class="demo-menubar-trigger">File</MenuTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-menu-popup">
            <MenuItem class="demo-menu-item">New file</MenuItem>

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

            <Separator class="demo-menu-separator" />
            <MenuItem class="demo-menu-item">Save</MenuItem>
          </Popup>
        </Positioner>
      </Portal>
    </MenuRoot>

    <MenuRoot>
      <MenuTrigger class="demo-menubar-trigger">Edit</MenuTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-menu-popup">
            <MenuItem class="demo-menu-item">Undo</MenuItem>
            <MenuItem disabled class="demo-menu-item">Redo</MenuItem>
            <Separator class="demo-menu-separator" />
            <MenuItem class="demo-menu-item">Cut</MenuItem>
            <MenuItem class="demo-menu-item">Copy</MenuItem>
            <MenuItem class="demo-menu-item">Paste</MenuItem>
          </Popup>
        </Positioner>
      </Portal>
    </MenuRoot>

    <MenuRoot>
      <MenuTrigger class="demo-menubar-trigger">View</MenuTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-menu-popup">
            <MenuCheckboxItem v-model="sidebar" class="demo-menu-item">
              <MenuItemIndicator keep-mounted class="demo-menu-indicator">✓</MenuItemIndicator>
              Sidebar
            </MenuCheckboxItem>
            <MenuCheckboxItem v-model="statusBar" class="demo-menu-item">
              <MenuItemIndicator keep-mounted class="demo-menu-indicator">✓</MenuItemIndicator>
              Status bar
            </MenuCheckboxItem>
          </Popup>
        </Positioner>
      </Portal>
    </MenuRoot>
  </MenubarRoot>
</template>
