<script setup lang="ts">
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverArrow,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
  Portal,
  Positioner,
  Popup
} from '../../src';
</script>

<template>
  <PopoverRoot default-open>
    <PopoverTrigger>Open</PopoverTrigger>
    <Portal>
      <Positioner>
        <Popup>
          <PopoverArrow />
          <PopoverTitle>Title</PopoverTitle>
          <PopoverDescription>Text</PopoverDescription>
          <PopoverClose>Close</PopoverClose>
        </Popup>
      </Positioner>
    </Portal>
  </PopoverRoot>
</template>
