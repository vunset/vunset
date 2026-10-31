<script setup lang="ts">
import { ref } from 'vue';
import {
  PopoverRoot,
  PopoverTrigger,
  Portal,
  Positioner,
  Popup,
  PopoverArrow,
  PopoverTitle,
  PopoverDescription
} from '@vunset/vue';
import './popover.css';

const open = ref(false);
const following = ref(false);
</script>

<template>
  <PopoverRoot v-model:open="open" open-on-hover>
    <PopoverTrigger class="demo-popover-trigger">@ada</PopoverTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-popover">
          <PopoverArrow class="demo-popover-arrow" />
          <PopoverTitle class="demo-popover-title">Ada Lovelace</PopoverTitle>
          <PopoverDescription class="demo-popover-description">Writes the first programs.</PopoverDescription>
          <button type="button" class="demo-popover-trigger demo-popover-action" @click="following = !following">
            {{ following ? 'Following' : 'Follow' }}
          </button>
        </Popup>
      </Positioner>
    </Portal>
  </PopoverRoot>

  <DemoOutput>open: {{ open }}</DemoOutput>
</template>
