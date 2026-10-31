<script setup lang="ts">
import { ref, useId } from 'vue';
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
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

const id = useId();
const labels = ref<string[]>(['bug', 'docs']);

const colors: Record<string, string> = {
  bug: '#e5484d',
  docs: '#0090ff',
  feature: '#30a46c',
  question: '#f76b15',
  wontfix: '#8b8d98'
};
</script>

<template>
  <div class="demo-combobox-field">
    <label :for="id" class="demo-combobox-label">Labels</label>

    <ComboboxRoot :id="id" v-model="labels" :options="Object.keys(colors)" multiple>
      <ComboboxTrigger class="demo-combobox-trigger">
        <ComboboxChips class="demo-combobox-chips">
          <template #chip="option">
            <ComboboxChip :option="option">
              <span class="demo-combobox-dot" :style="{ backgroundColor: colors[option.value] }" />
              {{ option.label }}
              <ComboboxChipRemove :as="Icon" name="times" />
            </ComboboxChip>
          </template>
        </ComboboxChips>
        <ComboboxInput placeholder="Add a label" class="demo-combobox-input" />
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

  <DemoOutput>v-model: {{ labels }}</DemoOutput>
</template>
