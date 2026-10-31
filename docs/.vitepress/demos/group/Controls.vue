<script setup lang="ts">
import { ref } from 'vue';
import {
  Group,
  Addon,
  Icon,
  Separator,
  Input,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectList,
  ToggleGroup,
  Toggle,
  MenuRoot,
  MenuTrigger,
  MenuItem,
  Portal,
  Positioner,
  Popup
} from '@vunset/vue';
import './group.css';
import '../input/input.css';
import '../select/select.css';
import '../toggle-group/toggle.css';
import '../menu/menu.css';

const query = ref('');
const status = ref('Open');
const view = ref<string | null>('list');
const last = ref('—');
</script>

<template>
  <Group variant="toolbar" label="Issues" class="demo-group">
    <Addon side="start" aria-hidden="true" class="demo-group-addon">
      <Icon name="search" />
    </Addon>

    <Input v-model="query" aria-label="Filter" placeholder="Filter issues" class="demo-input" />

    <Separator class="demo-group-separator" />

    <SelectRoot v-model="status" :options="['Open', 'Closed', 'All']">
      <SelectTrigger aria-label="Status" class="demo-group-button demo-group-trigger">
        <SelectValue />
        <SelectIndicator aria-hidden="true">▾</SelectIndicator>
      </SelectTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-select-popup">
            <SelectList aria-label="Status" class="demo-select-list" />
          </Popup>
        </Positioner>
      </Portal>
    </SelectRoot>

    <Separator class="demo-group-separator" />

    <ToggleGroup v-model="view" aria-label="View" class="demo-toggle-group">
      <Toggle value="list" class="demo-toggle">List</Toggle>
      <Toggle value="board" class="demo-toggle">Board</Toggle>
    </ToggleGroup>

    <Separator class="demo-group-separator" />

    <MenuRoot>
      <MenuTrigger class="demo-group-button demo-group-trigger">More</MenuTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-menu-popup">
            <MenuItem class="demo-menu-item" @select="last = 'Export'">Export</MenuItem>
            <MenuItem class="demo-menu-item" @select="last = 'Archive closed'">Archive closed</MenuItem>
          </Popup>
        </Positioner>
      </Portal>
    </MenuRoot>
  </Group>

  <DemoOutput>filter: {{ query || '—' }} · status: {{ status }} · view: {{ view }} · @select: {{ last }}</DemoOutput>
</template>
