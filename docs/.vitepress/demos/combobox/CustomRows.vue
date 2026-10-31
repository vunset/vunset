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
  ComboboxItem,
  ComboboxEmpty,
  Icon
} from '@vunset/vue';
import './combobox.css';

const id = useId();
const language = ref<string | null>(null);

const languages = [
  { value: 'ts', label: 'TypeScript', year: 2012 },
  { value: 'rust', label: 'Rust', year: 2015 },
  { value: 'go', label: 'Go', year: 2009 },
  { value: 'kotlin', label: 'Kotlin', year: 2011 },
  { value: 'swift', label: 'Swift', year: 2014 },
  { value: 'zig', label: 'Zig', year: 2016 }
];
</script>

<template>
  <div class="demo-combobox-field">
    <label :for="id" class="demo-combobox-label">Language</label>

    <ComboboxRoot :id="id" v-model="language" :options="languages">
      <ComboboxTrigger class="demo-combobox-trigger">
        <ComboboxInput placeholder="Type to narrow…" class="demo-combobox-input" />
        <ComboboxIndicator class="demo-combobox-indicator" :as="Icon" name="grabber" />
      </ComboboxTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-combobox-popup">
            <ComboboxList v-slot="{ options }" class="demo-combobox-list">
              <ComboboxItem v-for="item in options" :key="item.value" :option="item" class="demo-combobox-row">
                <span>{{ item.label }}</span>
                <span class="demo-combobox-row-meta">since {{ item.option.year }}</span>
              </ComboboxItem>
            </ComboboxList>
            <ComboboxEmpty class="demo-combobox-empty">No matches</ComboboxEmpty>
          </Popup>
        </Positioner>
      </Portal>
    </ComboboxRoot>
  </div>

  <DemoOutput>v-model: {{ language }}</DemoOutput>
</template>
