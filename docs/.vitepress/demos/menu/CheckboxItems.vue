<script setup lang="ts">
import { ref } from 'vue';
import {
  MenuRoot,
  MenuTrigger,
  Portal,
  Positioner,
  Popup,
  MenuGroup,
  MenuGroupLabel,
  MenuCheckboxItem,
  MenuItemIndicator
} from '@vunset/vue';
import './menu.css';

const wrap = ref(true);
const minimap = ref(false);
</script>

<template>
  <MenuRoot>
    <MenuTrigger class="demo-menu-trigger">View</MenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-menu-popup">
          <MenuGroup>
            <MenuGroupLabel class="demo-menu-group-label">Editor</MenuGroupLabel>

            <MenuCheckboxItem v-model="wrap" class="demo-menu-item">
              <MenuItemIndicator keep-mounted class="demo-menu-indicator">✓</MenuItemIndicator>
              Word wrap
            </MenuCheckboxItem>

            <MenuCheckboxItem v-model="minimap" class="demo-menu-item">
              <MenuItemIndicator keep-mounted class="demo-menu-indicator">✓</MenuItemIndicator>
              Minimap
            </MenuCheckboxItem>
          </MenuGroup>
        </Popup>
      </Positioner>
    </Portal>
  </MenuRoot>
</template>
