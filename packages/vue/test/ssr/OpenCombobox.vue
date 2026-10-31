<script setup lang="ts">
import { ref } from 'vue';
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxChips,
  ComboboxInput,
  ComboboxClear,
  ComboboxIndicator,
  ComboboxList,
  ComboboxEmpty,
  ComboboxPresets,
  ComboboxScrollIndicator,
  Portal,
  Positioner,
  Popup
} from '../../src';

const value = ref(['a', 'c']);
const presets = [{ label: 'First two', values: ['a', 'b'] }];
</script>

<template>
  <ComboboxRoot v-model="value" :open="true" multiple :options="['a', 'b', 'c']" :presets="presets">
    <ComboboxTrigger>
      <ComboboxChips />
      <ComboboxInput />
      <ComboboxClear>×</ComboboxClear>
      <ComboboxIndicator />
    </ComboboxTrigger>
    <Portal>
      <Positioner>
        <Popup>
          <ComboboxPresets />
          <ComboboxScrollIndicator direction="up" />
          <ComboboxList />
          <ComboboxScrollIndicator direction="down" />
          <ComboboxEmpty>None</ComboboxEmpty>
        </Popup>
      </Positioner>
    </Portal>
  </ComboboxRoot>
</template>
