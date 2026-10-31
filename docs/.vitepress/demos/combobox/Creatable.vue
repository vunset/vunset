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
  ComboboxList,
  ComboboxEmpty,
  Icon
} from '@vunset/vue';
import './combobox.css';

const id = useId();
const options = ref(['bug', 'feature', 'docs']);
const tags = ref<string[]>(['docs']);

// keep what was coined as a real option, so it stays in the list
function addTag(tag: string) {
  if (!options.value.includes(tag)) options.value.push(tag);
}
</script>

<template>
  <div class="demo-combobox-field">
    <label :for="id" class="demo-combobox-label">Tags</label>

    <ComboboxRoot
      :id="id"
      v-model="tags"
      :options="options"
      multiple
      :creatable="(query: string) => query.trim().length >= 3"
      @create="addTag"
    >
      <ComboboxTrigger class="demo-combobox-trigger">
        <ComboboxChips class="demo-combobox-chips" />
        <ComboboxInput placeholder="Type a new one" class="demo-combobox-input" />
        <ComboboxIndicator class="demo-combobox-indicator" :as="Icon" name="grabber" />
      </ComboboxTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-combobox-popup">
            <ComboboxList class="demo-combobox-list">
              <template #create="{ label }">Add “{{ label }}”</template>
            </ComboboxList>

            <ComboboxEmpty class="demo-combobox-empty">Type three letters to add a tag</ComboboxEmpty>
          </Popup>
        </Positioner>
      </Portal>
    </ComboboxRoot>
  </div>
</template>
