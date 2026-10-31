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

const plans = [
  { value: 'free', label: 'Free', price: '$0' },
  { value: 'team', label: 'Team', price: '$12 / seat' },
  { value: 'business', label: 'Business', price: '$30 / seat' }
];

const labelId = useId();
const plan = ref<string | null>('team');
</script>

<template>
  <div class="demo-select-field">
    <span :id="labelId" class="demo-select-label">Plan</span>

    <SelectRoot v-model="plan" :options="plans">
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <SelectValue class="demo-select-value" />
        <SelectIndicator class="demo-select-indicator" :as="Icon" name="grabber" />
      </SelectTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-select-popup">
            <SelectList :aria-labelledby="labelId" class="demo-select-list">
              <template #option="{ label, option }">
                <span>{{ label }}</span>
                <span class="demo-select-hint">{{ option.price }}</span>
              </template>
            </SelectList>
          </Popup>
        </Positioner>
      </Portal>
    </SelectRoot>
  </div>
</template>
