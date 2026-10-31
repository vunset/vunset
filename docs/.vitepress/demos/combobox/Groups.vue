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
import './combobox.css';

const frameworks = [
  {
    label: 'Signals',
    options: [
      { value: 'vue', label: 'Vue' },
      { value: 'solid', label: 'Solid' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'angular', label: 'Angular', disabled: true }
    ]
  },
  {
    label: 'Virtual DOM',
    options: [
      { value: 'react', label: 'React' },
      { value: 'preact', label: 'Preact' }
    ]
  }
];

const id = useId();
const framework = ref<string | null>('vue');
</script>

<template>
  <div class="demo-combobox-field">
    <label :for="id" class="demo-combobox-label">Framework</label>

    <ComboboxRoot :id="id" v-model="framework" :options="frameworks">
      <ComboboxTrigger class="demo-combobox-trigger">
        <ComboboxInput placeholder="Type to narrow…" class="demo-combobox-input" />
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

  <DemoOutput>v-model: {{ framework }}</DemoOutput>
</template>
