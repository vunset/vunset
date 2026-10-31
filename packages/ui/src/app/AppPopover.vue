<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useTemplateRef } from 'vue';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
  PopoverArrow,
  Portal,
  Positioner,
  Popup,
  Deferred,
  Part,
  type Align,
  type Side,
  isPropBound
} from '@vunset/vue';
// Every other attribute — `aria-label`, an AppButton's `variant` — lands on the trigger.
defineOptions({ name: 'AppPopover', inheritAttrs: false });

// Forwarded only when bound, so one without `v-model:open` keeps its own state.
const openBound = isPropBound('open');

const props = withDefaults(
  defineProps<{
    /** Whether it is open, bound with `v-model:open`. */
    open?: boolean;
    defaultOpen?: boolean;
    /** Names the popover. Or use the `#title` slot. */
    title?: string;
    description?: string;
    /** The trigger's text. Or use the `#trigger` slot. */
    trigger?: string;
    /** What the trigger renders: a component (`AppButton`) or a tag. A text button by default. */
    as?: string | object;
    /** Classes for the trigger, on top of its own: a string, an object or an array, as `class` takes. */
    triggerClass?: HTMLAttributes['class'];
    /** A small arrow pointing at the trigger. */
    arrow?: boolean;
    side?: Side;
    align?: Align;
    sideOffset?: number;
    /** `true` traps focus, locks scroll and makes the page inert; `'trap-focus'` only traps focus. */
    modal?: boolean | 'trap-focus';
    escapeKey?: boolean;
    outsidePress?: boolean;
    /** Also opens while a mouse rests on the trigger, and stays open while it is on the popover. A tap still opens it. */
    openOnHover?: boolean;
    /** With `open-on-hover`: how long the mouse rests on the trigger before it opens, in milliseconds. */
    delay?: number;
    /** With `open-on-hover`: how long after the mouse leaves before it closes, in milliseconds. */
    closeDelay?: number;
    /** Renders the popup in place, inside the parent, instead of teleporting it to the page's end. */
    inline?: boolean;
    /** Renders only the trigger until a pointer reaches it or it is pressed: for a table with one in every row. */
    lazy?: boolean;
    /** Classes for the popup, beside its own. */
    popupClass?: HTMLAttributes['class'];
    /** Classes for the header around the title and description. */
    headerClass?: HTMLAttributes['class'];
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    side: 'bottom',
    align: 'center',
    sideOffset: 8,
    modal: false,
    escapeKey: true,
    outsidePress: true
  }
);

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const root = useTemplateRef<{ open: boolean }>('root');

function close() {
  if (root.value) root.value.open = false;
}
</script>

<template>
  <Deferred :eager="!lazy || !(trigger || $slots.trigger || as) || defaultOpen || props.open === true">
    <template #default="{ pressed }">
      <PopoverRoot
        ref="root"
        v-bind="openBound ? { open } : {}"
        :default-open="defaultOpen || pressed"
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        :modal="modal"
        :escape-key="escapeKey"
        :outside-press="outsidePress"
        :open-on-hover="openOnHover"
        :delay="delay"
        :close-delay="closeDelay"
        @update:open="emit('update:open', $event)"
      >
        <PopoverTrigger
          v-if="trigger || $slots.trigger || as"
          :as="as ?? 'button'"
          :class="[!as && 'app-popover-trigger', triggerClass]"
          v-bind="$attrs"
        >
          <slot name="trigger">{{ trigger }}</slot>
        </PopoverTrigger>

        <Portal :disabled="inline">
          <Positioner>
            <Popup v-slot="state" class="app-surface app-popover" :class="popupClass">
              <PopoverArrow v-if="arrow" class="app-popover-arrow" />

              <div
                v-if="title || $slots.title || description || $slots.description"
                class="app-overlay-header"
                :class="headerClass"
              >
                <PopoverTitle v-if="title || $slots.title" class="app-overlay-title">
                  <slot name="title">{{ title }}</slot>
                </PopoverTitle>

                <PopoverDescription v-if="description || $slots.description" class="app-overlay-description">
                  <slot name="description">{{ description }}</slot>
                </PopoverDescription>
              </div>

              <slot v-bind="state" :close="close" />
            </Popup>
          </Positioner>
        </Portal>
      </PopoverRoot>
    </template>

    <template #placeholder>
      <Part
        :as="as ?? 'button'"
        type="button"
        data-part="trigger"
        data-closed=""
        aria-haspopup="dialog"
        aria-expanded="false"
        :class="[!as && 'app-popover-trigger', triggerClass]"
        v-bind="$attrs"
      >
        <slot name="trigger">{{ trigger }}</slot>
      </Part>
    </template>
  </Deferred>
</template>
