<script setup lang="ts">
import { ref, useId } from 'vue';
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxChips,
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
const stack = ref<string[]>(['Vue', 'Vite', 'Vitest', 'Pinia']);
</script>

<template>
  <div class="demo-combobox-field">
    <label :for="id" class="demo-combobox-label">Stack</label>

    <ComboboxRoot
      :id="id"
      v-model="stack"
      :options="['Vue', 'Vite', 'Vitest', 'Pinia', 'Nuxt', 'Tailwind']"
      multiple
      :flatten="2"
    >
      <ComboboxTrigger class="demo-combobox-trigger">
        <ComboboxChips class="demo-combobox-chips" />
        <ComboboxInput placeholder="Add a few" class="demo-combobox-input" />
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

  <DemoOutput>v-model: {{ stack }}</DemoOutput>
</template>
