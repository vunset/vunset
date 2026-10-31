<script setup lang="ts">
import { ref } from 'vue';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectClear,
  SelectIndicator,
  SelectSearch,
  SelectList,
  SelectEmpty,
  SelectScrollIndicator,
  Portal,
  Positioner,
  Popup
} from '../../src';

const value = ref('b');
</script>

<template>
  <SelectRoot v-model="value" :open="true" :options="['a', 'b', 'c']">
    <SelectTrigger>
      <SelectValue />
      <SelectClear>×</SelectClear>
      <SelectIndicator />
    </SelectTrigger>
    <Portal>
      <Positioner>
        <Popup>
          <SelectSearch />
          <SelectScrollIndicator direction="up" />
          <SelectList />
          <SelectScrollIndicator direction="down" />
          <SelectEmpty>None</SelectEmpty>
        </Popup>
      </Positioner>
    </Portal>
  </SelectRoot>
</template>
