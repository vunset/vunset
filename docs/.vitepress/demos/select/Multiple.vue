<script setup lang="ts">
import { ref, useId } from 'vue';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectClear,
  SelectIndicator,
  Portal,
  Positioner,
  Popup,
  SelectList,
  Icon
} from '@vunset/vue';
import './select.css';

const labelId = useId();
const skills = ref<string[]>(['Vue', 'TypeScript', 'CSS']);
</script>

<template>
  <div class="demo-select-field">
    <span :id="labelId" class="demo-select-label">Skills</span>

    <SelectRoot v-model="skills" :options="['Vue', 'TypeScript', 'CSS', 'Rust', 'Go']" multiple :flatten="1">
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <SelectValue placeholder="Add some skills" class="demo-select-value" />
        <SelectClear aria-label="Clear" class="demo-select-clear" :as="Icon" name="times" />
        <SelectIndicator class="demo-select-indicator" :as="Icon" name="grabber" />
      </SelectTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-select-popup">
            <SelectList :aria-labelledby="labelId" class="demo-select-list" />
          </Popup>
        </Positioner>
      </Portal>
    </SelectRoot>
  </div>

  <DemoOutput>v-model: {{ skills }}</DemoOutput>
</template>
