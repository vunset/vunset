<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { ContextMenuRoot, ContextMenuTrigger, Portal, Positioner, Popup, type Align, type Side, isPropBound } from '@vunset/vue';

// Every other attribute — `class` too — lands on the area that opens the menu.
defineOptions({ name: 'AppContextMenu', inheritAttrs: false });

// Forwarded only when bound, so one without `v-model:open` keeps its own state.
const openBound = isPropBound('open');

withDefaults(
  defineProps<{
    /** What the area renders as. */
    as?: string | object;
    /** Whether it is open, bound with `v-model:open`. */
    open?: boolean;
    /** Leaves the browser's own context menu in place. */
    disabled?: boolean;
    /** Whether choosing an item closes the menu. */
    closeOnSelect?: boolean;
    /** Whether arrow keys wrap past the ends. */
    loop?: boolean;
    /** How long a touch is held before the menu opens, in milliseconds. */
    longPressDelay?: number;
    /** Which side of the pointer the menu opens on. */
    side?: Side;
    /** How the menu lines up with the pointer; `start` puts its corner on it. */
    align?: Align;
    sideOffset?: number;
    /** Classes for the menu. */
    popupClass?: HTMLAttributes['class'];
  }>(),
  { as: 'div', open: undefined, closeOnSelect: undefined, loop: undefined }
);

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

defineSlots<{
  /** The area a right-click, or a long press, opens the menu on. */
  trigger?(): unknown;
  /** What the menu shows: `AppMenuItems`, or menu parts of your own. */
  default?(): unknown;
}>();
</script>

<template>
  <ContextMenuRoot
    v-bind="openBound ? { open } : {}"
    :disabled="disabled"
    :close-on-select="closeOnSelect"
    :loop="loop"
    :side="side"
    :align="align"
    :side-offset="sideOffset"
    @update:open="emit('update:open', $event)"
  >
    <ContextMenuTrigger :as="as" :long-press-delay="longPressDelay" class="app-context-menu-area" v-bind="$attrs">
      <slot name="trigger" />
    </ContextMenuTrigger>

    <Portal>
      <Positioner>
        <Popup class="app-surface app-menu" :class="popupClass">
          <slot />
        </Popup>
      </Positioner>
    </Portal>
  </ContextMenuRoot>
</template>
