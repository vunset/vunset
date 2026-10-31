<script setup lang="ts">
import { ref } from 'vue';
import {
  Button,
  PopoverRoot,
  PopoverTrigger,
  Portal,
  Positioner,
  Popup,
  PopoverDescription,
  useClickOutside
} from '@vunset/vue';
import '../button/button.css';
import '../popover/popover.css';
import './click-outside.css';

const open = ref(false);
const panel = ref<HTMLElement>();
const toggle = ref<InstanceType<typeof Button>>();
const outside = ref(0);

useClickOutside(
  panel,
  () => {
    open.value = false;
    outside.value += 1;
  },
  { ignore: [toggle], enabled: open }
);
</script>

<template>
  <div class="demo-click-outside-stack">
    <Button ref="toggle" class="demo-button" :aria-expanded="open" @click="open = !open">Filters</Button>

    <div v-if="open" ref="panel" class="demo-click-outside-panel">
      <p>Press anywhere outside this panel to close it.</p>
      <PopoverRoot>
        <PopoverTrigger class="demo-popover-trigger">More options</PopoverTrigger>
        <Portal>
          <Positioner>
            <Popup class="demo-popover">
              <PopoverDescription class="demo-popover-description">
                This popup is portaled out of the panel, and pressing in it keeps the panel open.
              </PopoverDescription>
            </Popup>
          </Positioner>
        </Portal>
      </PopoverRoot>
    </div>
  </div>
  <DemoOutput>panel: {{ open ? 'open' : 'closed' }} · closed from outside: {{ outside }}</DemoOutput>
</template>
