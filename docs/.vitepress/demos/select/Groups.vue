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

const countries = [
  {
    label: 'Europe',
    options: [
      { value: 'fr', label: 'France' },
      { value: 'de', label: 'Germany' },
      { value: 'is', label: 'Iceland', disabled: true }
    ]
  },
  {
    label: 'Americas',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'br', label: 'Brazil' }
    ]
  }
];

const labelId = useId();
const country = ref<string | null>('de');
</script>

<template>
  <div class="demo-select-field">
    <span :id="labelId" class="demo-select-label">Country</span>

    <SelectRoot v-model="country" :options="countries">
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <SelectValue placeholder="Choose a country" class="demo-select-value" />
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
