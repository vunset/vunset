<script setup lang="ts">
import { ContextMenuRoot, ContextMenuTrigger, MenuItem, Portal, Positioner, Popup } from '../../src';
</script>

<template>
  <ContextMenuRoot default-open>
    <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
    <Portal>
      <Positioner>
        <Popup>
          <MenuItem>Copy</MenuItem>
        </Popup>
      </Positioner>
    </Portal>
  </ContextMenuRoot>
</template>
