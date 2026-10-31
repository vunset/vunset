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
  SelectPresets,
  SelectList,
  Icon
} from '@vunset/vue';
import './select.css';

const presets = [
  { label: 'Frontend', values: ['Vue', 'TypeScript', 'CSS'] },
  { label: 'Systems', values: ['Rust', 'Go'] }
];

const labelId = useId();
const skills = ref<string[]>([]);
</script>

<template>
  <div class="demo-select-field">
    <span :id="labelId" class="demo-select-label">Skills</span>

    <SelectRoot v-model="skills" :options="['Vue', 'TypeScript', 'CSS', 'Rust', 'Go']" :presets="presets" multiple>
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <SelectValue placeholder="Add some skills" class="demo-select-value" />
        <SelectIndicator class="demo-select-indicator" :as="Icon" name="grabber" />
      </SelectTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-select-popup">
            <SelectPresets class="demo-select-presets" />
            <SelectList :aria-labelledby="labelId" class="demo-select-list" />
          </Popup>
        </Positioner>
      </Portal>
    </SelectRoot>
  </div>
</template>
