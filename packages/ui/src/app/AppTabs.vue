<script lang="ts">
import type { HTMLAttributes } from 'vue';
import type { TabValue } from '@vunset/vue';

export interface AppTab {
  value: TabValue;
  label?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

type ClassValue = HTMLAttributes['class'];
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { TabsRoot, TabsList, TabsTab, TabsPanel, TabsIndicator, type TabsOrientation, isPropBound } from '@vunset/vue';

defineOptions({ name: 'AppTabs' });

// Forwarded only when bound, so one without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

const props = withDefaults(
  defineProps<{
    /** The selected tab's `value`, bound with `v-model`. */
    modelValue?: TabValue;
    /** The tab selected at first, when no `v-model` owns it. Defaults to the first enabled tab. */
    defaultValue?: TabValue;
    /** The tabs: `{ value, label, disabled }`, or plain values. Each panel is the slot named after a value: `#account`. */
    tabs: (TabValue | AppTab)[];
    /** `line` underlines the selected tab; `pills` lifts it out of a sunken track. */
    variant?: 'line' | 'pills';
    /** Tabs side by side, or stacked beside their panels. Sets the arrow keys too. */
    orientation?: TabsOrientation;
    /** Selects a tab as soon as an arrow key reaches it. */
    activateOnFocus?: boolean;
    /** Whether arrow keys wrap past the ends. */
    loop?: boolean;
    /** Keeps every panel in the page, hidden, so their state survives a switch. */
    keepMounted?: boolean;
    /** Classes for the row of tabs. */
    tabsClass?: ClassValue;
    /** Classes for each tab. */
    tabClass?: ClassValue;
    /** Classes for each panel. */
    panelClass?: ClassValue;
    /** Classes for the panels container. */
    panelsClass?: ClassValue;
    /** Classes for the indicator under the selected tab. */
    indicatorClass?: ClassValue;
  }>(),
  { modelValue: undefined, defaultValue: undefined, variant: 'line', orientation: 'horizontal', loop: true }
);

const emit = defineEmits<{
  'update:modelValue': [value: TabValue];
}>();

// `selected` matters to a panel only with `keep-mounted`: otherwise just the selected one is there.
type TabSlot = (props: { tab: AppTab; selected: boolean }) => unknown;

defineSlots<{
  /** A tab's content, in place of its label. */
  tab?: TabSlot;
  /** Any panel without a slot of its own. */
  panel?: TabSlot;
  /** Panels by value: `#account`, `#password`. */
  [value: string]: TabSlot | undefined;
}>();

const list = computed<AppTab[]>(() =>
  props.tabs.map((tab) => (typeof tab === 'object' ? tab : { value: tab, label: String(tab) }))
);
</script>

<template>
  <TabsRoot
    class="app-tabs"
    :data-variant="variant"
    v-bind="modelBound ? { modelValue } : {}"
    :default-value="defaultValue"
    :orientation="orientation"
    :activate-on-focus="activateOnFocus"
    :loop="loop"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <TabsList class="app-tabs-list" :class="tabsClass" :data-variant="variant">
      <TabsTab
        v-for="tab in list"
        :key="tab.value"
        v-slot="{ selected }"
        :value="tab.value"
        :disabled="tab.disabled"
        class="app-tabs-tab"
        :class="tabClass"
      >
        <slot name="tab" :tab="tab" :selected="selected">{{ tab.label }}</slot>
      </TabsTab>

      <TabsIndicator class="app-tabs-indicator" :class="indicatorClass" />
    </TabsList>

    <div class="app-tabs-panels" :class="panelsClass">
      <template v-for="tab in list" :key="tab.value">
        <TabsPanel
          v-if="$slots[String(tab.value)] || $slots.panel"
          v-slot="{ selected }"
          :value="tab.value"
          :keep-mounted="keepMounted"
          class="app-tabs-panel"
          :class="panelClass"
        >
          <slot :name="String(tab.value)" :tab="tab" :selected="selected">
            <slot name="panel" :tab="tab" :selected="selected" />
          </slot>
        </TabsPanel>
      </template>
    </div>
  </TabsRoot>
</template>
