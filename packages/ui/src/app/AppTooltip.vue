<script setup lang="ts">
import { useSlots, type HTMLAttributes } from 'vue';
import {
  singleChild,
  TooltipRoot,
  TooltipTrigger,
  TooltipArrow,
  Portal,
  Positioner,
  Popup,
  type Align,
  type Side,
  isPropBound
} from '@vunset/vue';

// Every other attribute — `aria-label`, `name`, an AppButton's `variant` — lands on the trigger.
defineOptions({ name: 'AppTooltip', inheritAttrs: false });

// Forwarded only when bound, so one without `v-model:open` keeps its own state.
const openBound = isPropBound('open');

const props = withDefaults(
  defineProps<{
    /** The tooltip's text. Or use the `#content` slot. */
    content?: string;
    /**
     * The trigger's text. Or use the default slot: one element or component
     * there (an `AppButton`) is the trigger itself; text is a text button.
     */
    trigger?: string;
    /** What the trigger renders: a component (`AppButton`, an icon) or a tag. A text button by default. */
    as?: string | object;
    /** Classes for the trigger, on top of its own: a string, an object or an array, as `class` takes. */
    triggerClass?: HTMLAttributes['class'];
    /** Whether it is open, bound with `v-model:open`. */
    open?: boolean;
    /** A small arrow pointing at the trigger. */
    arrow?: boolean;
    /** Keeps it from opening. */
    disabled?: boolean;
    /** How long the pointer rests before it opens, in ms. A `TooltipGroup` sets it for many. */
    delay?: number;
    closeDelay?: number;
    side?: Side;
    align?: Align;
    sideOffset?: number;
    /** Classes for the popup, beside its own. */
    popupClass?: HTMLAttributes['class'];
  }>(),
  {
    open: undefined,
    disabled: undefined,
    delay: undefined,
    closeDelay: undefined,
    side: undefined,
    align: undefined,
    sideOffset: undefined
  }
);

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const slots = useSlots();
// One element or component in the slot, and nothing else asked for: it is the trigger.
const wrapsChild = () => !props.as && !props.trigger && singleChild(slots.default?.()) !== undefined;
</script>

<template>
  <TooltipRoot
    v-bind="openBound ? { open } : {}"
    :disabled="disabled"
    :delay="delay"
    :close-delay="closeDelay"
    :side="side"
    :align="align"
    :side-offset="sideOffset"
    @update:open="emit('update:open', $event)"
  >
    <!-- An `as` or a child that isn't a button may not be focusable, and a tooltip must be reachable by keyboard. -->
    <TooltipTrigger
      v-if="wrapsChild()"
      as="child"
      :tabindex="0"
      :class="triggerClass"
      v-bind="$attrs"
    >
      <slot />
    </TooltipTrigger>
    <TooltipTrigger
      v-else
      :as="as ?? 'button'"
      :type="as ? undefined : 'button'"
      :tabindex="as ? 0 : undefined"
      :class="[!as && 'app-tooltip-trigger', triggerClass]"
      v-bind="$attrs"
    >
      <slot>{{ trigger }}</slot>
    </TooltipTrigger>

    <Portal>
      <Positioner>
        <Popup class="app-tooltip" :class="popupClass">
          <TooltipArrow v-if="arrow" class="app-tooltip-arrow" />
          <slot name="content">{{ content }}</slot>
        </Popup>
      </Positioner>
    </Portal>
  </TooltipRoot>
</template>
