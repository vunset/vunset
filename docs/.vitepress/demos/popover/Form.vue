<script setup lang="ts">
import { ref } from 'vue';
import { PopoverRoot, PopoverTrigger, Portal, Positioner, Popup, PopoverTitle, PopoverClose } from '@vunset/vue';
import './popover.css';

const open = ref(false);
const name = ref('Q4 report');
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger class="demo-popover-trigger">Rename</PopoverTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-popover">
          <PopoverTitle class="demo-popover-title">Rename file</PopoverTitle>
          <form @submit.prevent="open = false">
            <label class="demo-popover-field">
              Name
              <input v-model="name" />
            </label>
          </form>
          <PopoverClose aria-label="Close" class="demo-popover-close">×</PopoverClose>
        </Popup>
      </Positioner>
    </Portal>
  </PopoverRoot>

  <DemoOutput>v-model:open: {{ open }} · name: {{ name }}</DemoOutput>
</template>
