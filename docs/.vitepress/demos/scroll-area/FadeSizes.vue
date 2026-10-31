<script setup lang="ts">
import { ref, useId } from 'vue';
import {
  ScrollArea,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectList,
  Portal,
  Positioner,
  Popup,
  Icon
} from '@vunset/vue';
import './scroll-area.css';
import '../select/select.css';

// One size for all three, to compare how far the mask reaches on each axis. 0 is no fade.
const sizes = [
  { value: 0, label: 'No fade' },
  { value: 16, label: '16px' },
  { value: 40, label: '40px' },
  { value: 96, label: '96px' }
];
const size = ref(40);
const labelId = useId();

const releases = [
  ['4.2.0', 'Scroll areas publish their distance to each edge.'],
  ['4.1.3', 'Dialogs behind a stack scale by nesting level.'],
  ['4.1.2', 'Menus stay open when the pointer crosses into a submenu.'],
  ['4.1.1', 'Radio groups no longer scroll the page when clicked.'],
  ['4.1.0', 'Checkbox, radio and switch share one toggle engine.'],
  ['4.0.4', 'Arrows wait for placement instead of flashing into position.'],
  ['4.0.3', 'Toasts keep their height while leaving.'],
  ['4.0.2', 'Toast ids deduplicate, with a nudge to say so.'],
  ['4.0.1', 'Field and Input each own their half of the job.'],
  ['4.0.0', 'Every part reads the nearest surface context.']
];

const tags = [
  'accessibility',
  'animation',
  'combobox',
  'dialog',
  'dismissal',
  'field',
  'focus-trap',
  'menu',
  'portal',
  'positioning',
  'range',
  'select',
  'toast',
  'tooltip'
];

const columns = ['Component', 'Parts', 'Portal', 'Anchored', 'Dismissable', 'Animated'];
const rows = [
  ['Dialog', '6', 'yes', 'no', 'yes', 'yes'],
  ['Drawer', '7', 'yes', 'no', 'yes', 'yes'],
  ['Popover', '6', 'yes', 'yes', 'yes', 'yes'],
  ['Menu', '10', 'yes', 'yes', 'yes', 'yes'],
  ['Select', '10', 'yes', 'yes', 'yes', 'yes'],
  ['Tooltip', '4', 'yes', 'yes', 'no', 'yes'],
  ['Range', '7', 'no', 'no', 'no', 'no'],
  ['Toast', '5', 'no', 'no', 'yes', 'yes']
];
</script>

<template>
  <div class="demo-scroll-area-fades">
    <div class="demo-scroll-area-config">
      <span :id="labelId">Fade size</span>

      <SelectRoot v-model="size" :options="sizes">
        <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
          <SelectValue class="demo-select-value" />
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

    <div class="demo-scroll-area-sizes">
      <div class="demo-scroll-area-size">
        <span>y</span>
        <div class="demo-scroll-frame">
          <ScrollArea
            axis="y"
            :fade="size > 0 && 'y'"
            :fade-size="size || undefined"
            class="demo-scroll-area demo-scroll-area-list"
          >
            <div v-for="[version, summary] in releases" :key="version" class="demo-scroll-area-item">
              <b>{{ version }}</b>
              <span>{{ summary }}</span>
            </div>
          </ScrollArea>
        </div>
      </div>

      <div class="demo-scroll-area-size">
        <span>x</span>
        <div class="demo-scroll-frame">
          <ScrollArea
            axis="x"
            :fade="size > 0 && 'x'"
            :fade-size="size || undefined"
            class="demo-scroll-area demo-scroll-area-row"
          >
            <span v-for="tag in tags" :key="tag" class="demo-scroll-area-tag">{{ tag }}</span>
          </ScrollArea>
        </div>
      </div>

      <div class="demo-scroll-area-size">
        <span>both</span>
        <div class="demo-scroll-frame">
          <ScrollArea :fade="size > 0" :fade-size="size || undefined" class="demo-scroll-area demo-scroll-area-grid">
            <table class="demo-scroll-area-table">
              <thead>
                <tr>
                  <th v-for="column in columns" :key="column">{{ column }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in rows" :key="row[0]">
                  <td v-for="(cell, index) in row" :key="index">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>
    </div>
  </div>
</template>
