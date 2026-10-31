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

const years = Array.from({ length: 30 }, (_, i) => String(2000 + i));

const labelId = useId();
const year = ref<string | null>('2012');
</script>

<template>
  <div class="demo-select-field">
    <span :id="labelId" class="demo-select-label">Year</span>

    <SelectRoot v-model="year" :options="years" align-with-trigger>
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <SelectValue class="demo-select-value" />
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
</template>
