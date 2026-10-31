<script setup lang="ts">
import { ref } from 'vue';
import {
  FieldRoot,
  FieldLabel,
  FieldDescription,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  Portal,
  Positioner,
  Popup,
  SelectList
} from '@vunset/vue';
import './field.css';
import '../select/select.css';

const role = ref<string | null>(null);
</script>

<template>
  <FieldRoot class="demo-field">
    <FieldLabel class="demo-field-label">Role</FieldLabel>

    <SelectRoot v-model="role" :options="['Viewer', 'Editor', 'Admin']">
      <SelectTrigger class="demo-select-trigger">
        <SelectValue placeholder="Pick a role" class="demo-select-value" />
        <SelectIndicator class="demo-select-indicator">↓</SelectIndicator>
      </SelectTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-select-popup">
            <SelectList class="demo-select-list" />
          </Popup>
        </Positioner>
      </Portal>
    </SelectRoot>

    <FieldDescription class="demo-field-description">Admins can invite others.</FieldDescription>
  </FieldRoot>
</template>
