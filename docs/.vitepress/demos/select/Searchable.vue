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
  SelectSearch,
  SelectList,
  SelectEmpty,
  Icon
} from '@vunset/vue';
import './select.css';

const timezones = ['UTC', 'Europe/Paris', 'Europe/Lisbon', 'America/New_York', 'America/Sao_Paulo', 'Asia/Tokyo'];

const labelId = useId();
const timezone = ref<string | null>('UTC');
</script>

<template>
  <div class="demo-select-field">
    <span :id="labelId" class="demo-select-label">Time zone</span>

    <SelectRoot v-model="timezone" :options="timezones" searchable>
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <SelectValue class="demo-select-value" />
        <SelectIndicator class="demo-select-indicator" :as="Icon" name="grabber" />
      </SelectTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-select-popup">
            <SelectSearch placeholder="Search" class="demo-select-search" />
            <SelectList :aria-labelledby="labelId" class="demo-select-list" />
            <SelectEmpty class="demo-select-empty">No matches</SelectEmpty>
          </Popup>
        </Positioner>
      </Portal>
    </SelectRoot>
  </div>
</template>
