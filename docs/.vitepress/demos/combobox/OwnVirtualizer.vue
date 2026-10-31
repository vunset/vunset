<script setup lang="ts">
import { ref, useId } from 'vue';
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxIndicator,
  Portal,
  Positioner,
  Popup,
  ComboboxList,
  ComboboxEmpty,
  Icon
} from '@vunset/vue';
import VirtualRows from './VirtualRows.vue';
import './combobox.css';

const id = useId();
const city = ref<string | null>(null);

const cities = Array.from({ length: 10_000 }, (_, i) => ({ value: `city-${i + 1}`, label: `City ${i + 1}` }));
</script>

<template>
  <div class="demo-combobox-field">
    <label :for="id" class="demo-combobox-label">City</label>

    <ComboboxRoot :id="id" v-model="city" :options="cities">
      <ComboboxTrigger class="demo-combobox-trigger">
        <ComboboxInput placeholder="10,000 to search…" class="demo-combobox-input" />
        <ComboboxIndicator class="demo-combobox-indicator" :as="Icon" name="grabber" />
      </ComboboxTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-combobox-popup">
            <ComboboxList v-slot="{ options, activeIndex }" class="demo-combobox-list demo-combobox-virtual-list">
              <VirtualRows :options="options" :active-index="activeIndex" />
            </ComboboxList>
            <ComboboxEmpty class="demo-combobox-empty">No matches</ComboboxEmpty>
          </Popup>
        </Positioner>
      </Portal>
    </ComboboxRoot>
  </div>

  <DemoOutput>v-model: {{ city }}</DemoOutput>
</template>
