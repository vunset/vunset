<script setup lang="ts">
import { ref, useId } from 'vue';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  Portal,
  Positioner,
  Popup,
  SelectList,
  Icon
} from '@vunset/vue';
import './select.css';

const labelId = useId();
const fruit = ref<string | null>(null);
</script>

<template>
  <div class="demo-select-field">
    <SelectRoot v-model="fruit" :options="['Apple', 'Banana', 'Cherry', 'Mango', 'Pear']">
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <SelectValue placeholder="Pick a fruit" class="demo-select-value" />
        <SelectIndicator class="demo-select-indicator" :as="Icon" name="grabber" />
      </SelectTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-select-popup">
            <SelectList :aria-labelledby="labelId" class="demo-select-list" />
          </Popup>
        </Positioner>
      </Portal>
    </SelectRoot>
  </div>

  <DemoOutput>v-model: {{ fruit }}</DemoOutput>
</template>
