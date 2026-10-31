<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue';
import { MenuRoot, MenuTrigger, MenuArrow, Portal, Positioner, Popup, type Align, type Side, isPropBound } from '@vunset/vue';
import AppMenuItems from './AppMenuItems.vue';
import type { AppMenuAction, AppMenuEntry } from './app-menu';

// Every other attribute — `aria-label`, an AppButton's `variant` — lands on the trigger.
defineOptions({ name: 'AppMenu', inheritAttrs: false });

// Forwarded only when bound, so one without `v-model:open` keeps its own state.
const openBound = isPropBound('open');

withDefaults(
  defineProps<{
    /** The menu: items, `separator`s, `group`s, `checkbox`es and `radio` sets; an item with `items` opens a submenu. */
    items: AppMenuEntry[];
    /** The trigger's text. Or use the `#trigger` slot. */
    trigger?: string;
    /** What the trigger renders: a component (`AppButton`) or a tag. A text button by default. */
    as?: string | object;
    /** Whether it is open, bound with `v-model:open`. */
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    /** Whether choosing an item closes the menu. */
    closeOnSelect?: boolean;
    /** Opens while the pointer rests on the trigger. */
    openOnHover?: boolean;
    /** Whether arrow keys wrap past the ends. */
    loop?: boolean;
    /** A small arrow pointing at the trigger. */
    arrow?: boolean;
    side?: Side;
    align?: Align;
    sideOffset?: number;
    /** Classes for the trigger, on top of its own. */
    triggerClass?: HTMLAttributes['class'];
    /** Classes for the menu, and each submenu. */
    popupClass?: HTMLAttributes['class'];
    /** Classes for every item. */
    itemClass?: HTMLAttributes['class'];
    /** What an item with `to` renders as: `RouterLink`, `NuxtLink`, or `configureLink`'s: `a` by default, `NuxtLink` in Nuxt. */
    link?: string | Component;
  }>(),
  {
    open: undefined,
    defaultOpen: undefined,
    closeOnSelect: undefined,
    loop: undefined,
    side: 'bottom',
    align: 'start',
    sideOffset: 6
  }
);

const emit = defineEmits<{
  'update:open': [open: boolean];
  /** A plain item was chosen, after its own `onSelect`. */
  select: [item: AppMenuAction, event: Event];
}>();

defineSlots<{
  /** The trigger's content. */
  trigger?(): unknown;
  /** An item's label, in place of `label`. */
  item?(props: { item: AppMenuAction }): unknown;
}>();
</script>

<template>
  <MenuRoot
    v-bind="openBound ? { open } : {}"
    :default-open="defaultOpen"
    :disabled="disabled"
    :close-on-select="closeOnSelect"
    :open-on-hover="openOnHover"
    :loop="loop"
    :side="side"
    :align="align"
    :side-offset="sideOffset"
    @update:open="emit('update:open', $event)"
  >
    <MenuTrigger :as="as ?? 'button'" :class="[!as && 'app-menu-trigger', triggerClass]" v-bind="$attrs">
      <slot name="trigger">{{ trigger }}</slot>
    </MenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="app-surface app-menu" :class="popupClass">
          <MenuArrow v-if="arrow" class="app-menu-arrow" />
          <AppMenuItems
            :items="items"
            :item-class="itemClass"
            :popup-class="popupClass"
            :link="link"
            @select="(item, event) => emit('select', item, event)"
          >
            <template v-if="$slots.item" #item="scope"><slot name="item" v-bind="scope" /></template>
          </AppMenuItems>
        </Popup>
      </Positioner>
    </Portal>
  </MenuRoot>
</template>
