<script setup lang="ts">
import { ref, useId } from 'vue';
import {
  SelectRoot,
  SelectTrigger,
  Addon,
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
const reminder = ref<string | null>('10 minutes');
</script>

<template>
  <div class="demo-select-field">
    <span :id="labelId" class="demo-select-label">Reminder</span>

    <SelectRoot v-model="reminder" :options="['5 minutes', '10 minutes', '30 minutes', '1 hour', '1 day']">
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <Addon side="start" aria-hidden="true">
          <Icon name="bell" />
        </Addon>

        <SelectValue placeholder="None" class="demo-select-value" />

        <Addon side="end" class="demo-select-hint">before</Addon>

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
