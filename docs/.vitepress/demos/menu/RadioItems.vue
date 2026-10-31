<script setup lang="ts">
import { ref } from 'vue';
import {
  MenuRoot,
  MenuTrigger,
  Portal,
  Positioner,
  Popup,
  MenuRadioGroup,
  MenuGroupLabel,
  MenuRadioItem,
  MenuItemIndicator
} from '@vunset/vue';
import './menu.css';

const sort = ref('name');
</script>

<template>
  <MenuRoot>
    <MenuTrigger class="demo-menu-trigger">Sort: {{ sort }}</MenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-menu-popup">
          <MenuRadioGroup v-model="sort">
            <MenuGroupLabel class="demo-menu-group-label">Sort by</MenuGroupLabel>

            <MenuRadioItem
              v-for="option in ['name', 'modified', 'size']"
              :key="option"
              :value="option"
              class="demo-menu-item"
            >
              <MenuItemIndicator keep-mounted class="demo-menu-indicator">•</MenuItemIndicator>
              {{ option }}
            </MenuRadioItem>
          </MenuRadioGroup>
        </Popup>
      </Positioner>
    </Portal>
  </MenuRoot>
</template>
