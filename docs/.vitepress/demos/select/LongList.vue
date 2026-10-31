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
  SelectScrollIndicator,
  SelectList,
  Icon
} from '@vunset/vue';
import './select.css';

const cities = Array.from({ length: 10_000 }, (_, i) => ({
  value: i,
  label: `City ${String(i + 1).padStart(5, '0')}`
}));

const labelId = useId();
const city = ref<number | null>(4999);
</script>

<template>
  <div class="demo-select-field">
    <span :id="labelId" class="demo-select-label">City, of 10 000</span>

    <SelectRoot v-model="city" :options="cities" virtual :max-height="240" searchable>
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <SelectValue class="demo-select-value" />
        <SelectIndicator class="demo-select-indicator" :as="Icon" name="grabber" />
      </SelectTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-select-popup">
            <SelectSearch placeholder="Search" class="demo-select-search" />
            <SelectScrollIndicator direction="up" class="demo-select-scroll">▲</SelectScrollIndicator>
            <SelectList :aria-labelledby="labelId" class="demo-select-list" />
            <SelectScrollIndicator direction="down" class="demo-select-scroll">▼</SelectScrollIndicator>
          </Popup>
        </Positioner>
      </Portal>
    </SelectRoot>
  </div>
</template>
