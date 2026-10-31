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
  SelectList,
  Icon
} from '@vunset/vue';
import './select.css';

const languages = ['English', 'French', 'German', 'Italian', 'Japanese', 'Polish', 'Portuguese', 'Spanish', 'Ukrainian'];

const labelId = useId();
const spoken = ref<string[]>(['Polish', 'Ukrainian']);
</script>

<template>
  <div class="demo-select-field">
    <span :id="labelId" class="demo-select-label">Languages</span>

    <SelectRoot v-model="spoken" :options="languages" multiple order="selected-first" :max-height="200">
      <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
        <SelectValue placeholder="Pick some" class="demo-select-value" />
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
</template>
