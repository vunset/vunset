<script setup lang="ts">
import { useId } from 'vue';
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

const roles = ['Viewer', 'Editor', 'Admin'];

const readOnlyId = useId();
const disabledId = useId();
</script>

<template>
  <div class="demo-select-col">
    <div class="demo-select-field">
      <span :id="readOnlyId" class="demo-select-label">Read-only</span>

      <SelectRoot default-value="Editor" :options="roles" read-only>
        <SelectTrigger :aria-labelledby="readOnlyId" class="demo-select-trigger">
          <SelectValue class="demo-select-value" />
          <SelectIndicator class="demo-select-indicator" :as="Icon" name="grabber" />
        </SelectTrigger>

        <Portal>
          <Positioner>
            <Popup class="demo-select-popup">
              <SelectList :aria-labelledby="readOnlyId" class="demo-select-list" />
            </Popup>
          </Positioner>
        </Portal>
      </SelectRoot>
    </div>

    <div class="demo-select-field">
      <span :id="disabledId" class="demo-select-label">Disabled</span>

      <SelectRoot default-value="Editor" :options="roles" disabled>
        <SelectTrigger :aria-labelledby="disabledId" class="demo-select-trigger">
          <SelectValue class="demo-select-value" />
          <SelectIndicator class="demo-select-indicator" :as="Icon" name="grabber" />
        </SelectTrigger>

        <Portal>
          <Positioner>
            <Popup class="demo-select-popup">
              <SelectList :aria-labelledby="disabledId" class="demo-select-list" />
            </Popup>
          </Positioner>
        </Portal>
      </SelectRoot>
    </div>
  </div>
</template>
