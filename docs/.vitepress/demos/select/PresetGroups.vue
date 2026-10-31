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
  SelectPresets,
  SelectList,
  SelectEmpty,
  Icon
} from '@vunset/vue';
import './select.css';

const presets = [
  { label: 'Frontend', values: ['Vue', 'TypeScript', 'CSS'] },
  {
    label: 'Backend',
    presets: [
      { label: 'Low level', values: ['Rust', 'Go'] },
      { label: 'Web', values: ['Go', 'TypeScript'] }
    ]
  },
  { label: 'Data', collapsed: true, presets: [{ label: 'Analytics', values: ['Python', 'SQL'] }] }
];

const labelId = useId();
const skills = ref<string[]>(['Vue']);
</script>

<template>
  <div class="demo-select-field">
    <span :id="labelId" class="demo-select-label">Skills</span>

    <SelectRoot
      v-model="skills"
      :options="['Vue', 'TypeScript', 'CSS', 'Rust', 'Go', 'Python', 'SQL']"
      :presets="presets"
      presets-label="Roles"
      multiple
      searchable
      :flatten="2"
    >
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <SelectValue placeholder="Add some skills" class="demo-select-value" />
        <SelectIndicator class="demo-select-indicator" :as="Icon" name="grabber" />
      </SelectTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-select-popup">
            <SelectSearch placeholder="Search" class="demo-select-search" />

            <SelectPresets class="demo-select-presets">
              <template #group-indicator="{ open }">{{ open ? '−' : '+' }}</template>
              <template #replace>only</template>
            </SelectPresets>

            <SelectList :aria-labelledby="labelId" class="demo-select-list" />
            <SelectEmpty class="demo-select-empty">No matches</SelectEmpty>
          </Popup>
        </Positioner>
      </Portal>
    </SelectRoot>
  </div>

  <DemoOutput>v-model: {{ skills }}</DemoOutput>
</template>
