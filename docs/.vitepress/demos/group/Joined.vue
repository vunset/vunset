<script setup lang="ts">
import { ref } from 'vue';
import {
  Group,
  Addon,
  Icon,
  Input,
  Separator,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectList,
  MenuRoot,
  MenuTrigger,
  MenuItem,
  ToggleGroup,
  Toggle,
  Button,
  Portal,
  Positioner,
  Popup,
  type GroupVariant
} from '@vunset/vue';
import './group.css';
import '../input/input.css';
import '../select/select.css';
import '../menu/menu.css';
import '../toggle-group/toggle.css';
import '../button/button.css';

// Every kind of part side by side, joined and padded, to check the lines between them.
const looks: { variant: GroupVariant; joined: boolean }[] = [
  { variant: 'group', joined: true },
  { variant: 'toolbar', joined: false }
];

const scopes = [
  { value: 'files', label: 'Files' },
  { value: 'issues', label: 'Issues' },
  { value: 'people', label: 'People' }
];

const query = ref('');
const scope = ref('files');
const marks = ref<string[]>(['bold']);
const wrap = ref(true);
const last = ref('—');
</script>

<template>
  <div class="demo-group-looks">
    <div v-for="look in looks" :key="look.variant" class="demo-group-look">
      <Group :variant="look.variant" :class="{ 'demo-group-joined': look.joined }" class="demo-group" label="Search">
        <Addon side="start" aria-hidden="true" class="demo-group-addon">
          <Icon name="search" />
        </Addon>

        <Input v-model="query" aria-label="Search" placeholder="Search" class="demo-input" />

        <Separator class="demo-group-separator" />

        <SelectRoot v-model="scope" :options="scopes">
          <SelectTrigger aria-label="Scope" class="demo-group-button demo-group-trigger">
            <SelectValue />
            <SelectIndicator aria-hidden="true">▾</SelectIndicator>
          </SelectTrigger>

          <Portal>
            <Positioner>
              <Popup class="demo-select-popup">
                <SelectList aria-label="Scope" class="demo-select-list" />
              </Popup>
            </Positioner>
          </Portal>
        </SelectRoot>

        <Separator class="demo-group-separator" />

        <MenuRoot :side-offset="6">
          <MenuTrigger class="demo-group-button demo-group-trigger">More</MenuTrigger>

          <Portal>
            <Positioner>
              <Popup class="demo-menu-popup">
                <MenuItem class="demo-menu-item" @select="last = 'Save search'">Save search</MenuItem>
                <MenuItem class="demo-menu-item" @select="last = 'Clear history'">Clear history</MenuItem>
              </Popup>
            </Positioner>
          </Portal>
        </MenuRoot>
      </Group>

      <Group :variant="look.variant" :class="{ 'demo-group-joined': look.joined }" class="demo-group" label="Formatting">
        <ToggleGroup v-model="marks" multiple aria-label="Marks" class="demo-toggle-group">
          <Toggle value="bold" aria-label="Bold" class="demo-toggle"><b>B</b></Toggle>
          <Toggle value="italic" aria-label="Italic" class="demo-toggle"><i>I</i></Toggle>
          <Toggle value="underline" aria-label="Underline" class="demo-toggle"><u>U</u></Toggle>
        </ToggleGroup>

        <Separator class="demo-group-separator" />

        <Toggle v-model="wrap" class="demo-toggle">Wrap</Toggle>

        <Separator class="demo-group-separator" />

        <button type="button" class="demo-group-button" @click="last = 'Reset'">Reset</button>
      </Group>

      <Group
        :variant="look.variant"
        :class="{ 'demo-group-joined': look.joined }"
        orientation="vertical"
        class="demo-group"
        label="Canvas"
      >
        <Button data-variant="ghost" class="demo-button" @click="last = 'Zoom in'">Zoom in</Button>
        <Button data-variant="ghost" class="demo-button" @click="last = 'Zoom out'">Zoom out</Button>
        <Separator class="demo-group-separator" />
        <Button data-variant="ghost" class="demo-button" @click="last = 'Fit'">Fit</Button>
      </Group>
    </div>
  </div>

  <DemoOutput>
    query: {{ query || '—' }} · scope: {{ scope }} · marks: [{{ marks.join(', ') }}] · wrap: {{ wrap }} · last:
    {{ last }}
  </DemoOutput>
</template>
