<script setup lang="ts">
import {
  DrawerRoot,
  DrawerTrigger,
  Portal,
  DrawerBackdrop,
  Popup,
  DrawerHandle,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  type DrawerSide
} from '@vunset/vue';
import '../button/button.css';
import './drawer.css';

const sides: DrawerSide[] = ['top', 'right', 'bottom', 'left'];
const towards: Record<DrawerSide, string> = { top: 'up', right: 'right', bottom: 'down', left: 'left' };
</script>

<template>
  <div class="demo-button-row">
    <DrawerRoot v-for="side in sides" :key="side" :side="side">
      <DrawerTrigger class="demo-button">{{ side }}</DrawerTrigger>

      <Portal>
        <DrawerBackdrop class="demo-drawer-backdrop" />
        <Popup class="demo-drawer">
          <DrawerHandle class="demo-drawer-handle" />
          <DrawerTitle class="demo-drawer-title">Filters</DrawerTitle>
          <DrawerDescription class="demo-drawer-description"
            >Drag the handle {{ towards[side] }} to dismiss.</DrawerDescription
          >
          <DrawerClose class="demo-button">Apply</DrawerClose>
        </Popup>
      </Portal>
    </DrawerRoot>
  </div>
</template>
