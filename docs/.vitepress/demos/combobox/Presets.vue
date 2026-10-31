<script setup lang="ts">
import { ref, useId } from 'vue';
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxChips,
  ComboboxInput,
  ComboboxIndicator,
  Portal,
  Positioner,
  Popup,
  ComboboxPresets,
  ComboboxList,
  ComboboxEmpty,
  Icon
} from '@vunset/vue';
import './combobox.css';

const presets = [
  { label: 'Frontend', values: ['Vue', 'TypeScript', 'CSS'] },
  { label: 'Systems', values: ['Rust', 'Go'] }
];

const id = useId();
const skills = ref<string[]>([]);
</script>

<template>
  <div class="demo-combobox-field">
    <label :for="id" class="demo-combobox-label">Skills</label>

    <ComboboxRoot
      :id="id"
      v-model="skills"
      :options="['Vue', 'TypeScript', 'CSS', 'Rust', 'Go']"
      :presets="presets"
      multiple
    >
      <ComboboxTrigger class="demo-combobox-trigger">
        <ComboboxChips class="demo-combobox-chips" />
        <ComboboxInput placeholder="Add some skills" class="demo-combobox-input" />
        <ComboboxIndicator class="demo-combobox-indicator" :as="Icon" name="grabber" />
      </ComboboxTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-combobox-popup">
            <ComboboxPresets class="demo-combobox-presets" />
            <ComboboxList class="demo-combobox-list" />
            <ComboboxEmpty class="demo-combobox-empty">No matches</ComboboxEmpty>
          </Popup>
        </Positioner>
      </Portal>
    </ComboboxRoot>
  </div>

  <DemoOutput>v-model: {{ skills }}</DemoOutput>
</template>
