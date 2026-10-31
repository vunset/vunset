<script setup lang="ts">
import { ref } from 'vue';
import {
  MenuRoot,
  MenuTrigger,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItemIndicator,
  MenuArrow,
  Separator,
  Portal,
  Positioner,
  Popup
} from '../../src';

const checked = ref(true);
const sort = ref('name');
</script>

<template>
  <MenuRoot default-open>
    <MenuTrigger>Actions</MenuTrigger>
    <Portal>
      <Positioner>
        <Popup>
          <MenuArrow />
          <MenuItem>Rename</MenuItem>
          <MenuCheckboxItem v-model:checked="checked">
            <MenuItemIndicator>✓</MenuItemIndicator>
            Pinned
          </MenuCheckboxItem>
          <Separator />
          <MenuGroup>
            <MenuGroupLabel>Sort</MenuGroupLabel>
            <MenuRadioGroup v-model="sort">
              <MenuRadioItem value="name">Name</MenuRadioItem>
              <MenuRadioItem value="date">Date</MenuRadioItem>
            </MenuRadioGroup>
          </MenuGroup>
          <MenuRoot default-open>
            <MenuTrigger>More</MenuTrigger>
            <Portal>
              <Positioner>
                <Popup>
                  <MenuItem>Archive</MenuItem>
                </Popup>
              </Positioner>
            </Portal>
          </MenuRoot>
        </Popup>
      </Positioner>
    </Portal>
  </MenuRoot>
</template>
