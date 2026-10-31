<script setup lang="ts">
import { ref, useId } from 'vue';
import {
  ComboboxRoot,
  ComboboxTrigger,
  Addon,
  ComboboxInput,
  ComboboxClear,
  ComboboxIndicator,
  Portal,
  Positioner,
  Popup,
  ComboboxList,
  ComboboxEmpty,
  Icon
} from '@vunset/vue';
import './combobox.css';

const id = useId();
const city = ref<string | null>(null);
</script>

<template>
  <div class="demo-combobox-field">
    <label :for="id" class="demo-combobox-label">City</label>

    <ComboboxRoot :id="id" v-model="city" :options="['Lisbon', 'Kraków', 'Kyiv', 'Tokyo', 'São Paulo', 'Reykjavík']">
      <ComboboxTrigger class="demo-combobox-trigger">
        <Addon side="start" aria-hidden="true">
          <Icon name="search" />
        </Addon>

        <ComboboxInput placeholder="Search cities" class="demo-combobox-input" />
        <ComboboxClear aria-label="Clear" class="demo-combobox-clear" :as="Icon" name="times" />
        <ComboboxIndicator class="demo-combobox-indicator" :as="Icon" name="grabber" />
      </ComboboxTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-combobox-popup">
            <ComboboxList class="demo-combobox-list" />
            <ComboboxEmpty class="demo-combobox-empty">No matches</ComboboxEmpty>
          </Popup>
        </Positioner>
      </Portal>
    </ComboboxRoot>
  </div>
</template>
