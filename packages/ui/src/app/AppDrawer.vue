<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed, useTemplateRef } from 'vue';
import {
  DrawerRoot,
  DrawerTrigger,
  DrawerBackdrop,
  DrawerHandle,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  Portal,
  Popup,
  type DrawerSide,
  isPropBound
} from '@vunset/vue';
import AppButton from './AppButton.vue';
import AppIcon from './AppIcon.vue';

// Every other attribute — `aria-label`, an AppButton's `variant` — lands on the trigger.
defineOptions({ name: 'AppDrawer', inheritAttrs: false });

// Forwarded only when bound, so one without `v-model:open` keeps its own state.
const openBound = isPropBound('open');

const props = withDefaults(
  defineProps<{
    /** Whether it is open, bound with `v-model:open`. */
    open?: boolean;
    defaultOpen?: boolean;
    /** Which edge it enters from. */
    side?: DrawerSide;
    /** Names the drawer. Or use the `#title` slot. */
    title?: string;
    description?: string;
    /** A close button in the corner. */
    closable?: boolean;
    /** Names the close button. */
    closeLabel?: string;
    /** The trigger's text. Or use the `#trigger` slot. */
    trigger?: string;
    /** What the trigger renders: a component (`AppButton`) or a tag. A text button by default. */
    as?: string | object;
    /** Classes for the trigger, on top of its own: a string, an object or an array, as `class` takes. */
    triggerClass?: HTMLAttributes['class'];
    /** Closes on a swipe from anywhere on the panel. */
    swipeable?: boolean;
    /** Draws a handle at the panel's inner edge, which closes it on a swipe too. */
    handle?: boolean;
    modal?: boolean;
    escapeKey?: boolean;
    /** Closes on a press outside, on the backdrop. */
    outsidePress?: boolean;
    /** Classes for the popup, beside its own. */
    popupClass?: HTMLAttributes['class'];
    /** Classes for the dimmed backdrop. */
    backdropClass?: HTMLAttributes['class'];
    /** Classes for the header around the title and description. */
    headerClass?: HTMLAttributes['class'];
    /** Classes for the title. */
    titleClass?: HTMLAttributes['class'];
    /** Classes for the description. */
    descriptionClass?: HTMLAttributes['class'];
    /** Classes for the scrolling body. */
    bodyClass?: HTMLAttributes['class'];
    /** Classes for the footer. */
    footerClass?: HTMLAttributes['class'];
  }>(),
  {
    open: undefined,
    defaultOpen: undefined,
    side: 'bottom',
    closable: false,
    closeLabel: 'Close',
    swipeable: false,
    handle: false,
    modal: undefined,
    escapeKey: undefined,
    outsidePress: true
  }
);

const emit = defineEmits<{
  'update:open': [open: boolean];
  /** Closed, after its exit animation: unmount it here when it was mounted to be shown. */
  closed: [];
}>();

// Swiping anywhere covers the handle too; a handle alone is the only thing to swipe.
const swipe = computed(() => (props.swipeable ? true : props.handle ? 'handle' : false));

const root = useTemplateRef<{ open: boolean }>('root');

function close() {
  if (root.value) root.value.open = false;
}
</script>

<template>
  <DrawerRoot
    ref="root"
    v-bind="openBound ? { open } : {}"
    :default-open="defaultOpen"
    :side="side"
    :swipeable="swipe"
    :modal="modal"
    :escape-key="escapeKey"
    :outside-press="outsidePress"
    @update:open="emit('update:open', $event)"
    @closed="emit('closed')"
  >
    <DrawerTrigger
      v-if="trigger || $slots.trigger || as"
      :as="as ?? 'button'"
      :class="[!as && 'app-drawer-trigger', triggerClass]"
      v-bind="$attrs"
    >
      <slot name="trigger">{{ trigger }}</slot>
    </DrawerTrigger>

    <Portal>
      <DrawerBackdrop class="app-backdrop" :class="backdropClass" />

      <Popup v-slot="state" class="app-surface app-drawer" :class="popupClass">
        <DrawerHandle v-if="handle" class="app-drawer-handle" />

        <div class="app-drawer-content">
          <div
            v-if="title || $slots.title || description || $slots.description || closable"
            class="app-overlay-header"
            :class="headerClass"
          >
            <DrawerTitle v-if="title || $slots.title" class="app-overlay-title" :class="titleClass">
              <slot name="title">{{ title }}</slot>
            </DrawerTitle>

            <DrawerDescription
              v-if="description || $slots.description"
              class="app-overlay-description"
              :class="descriptionClass"
            >
              <slot name="description">{{ description }}</slot>
            </DrawerDescription>

            <DrawerClose v-if="closable" class="app-overlay-close" :aria-label="closeLabel">
              <slot name="close" :close>
                <AppIcon name="close" />
              </slot>
            </DrawerClose>
          </div>

          <div class="app-drawer-body" :class="bodyClass">
            <slot v-bind="state" :close="close" />
          </div>

          <div v-if="$slots.footer" class="app-drawer-footer" :class="footerClass">
            <slot name="footer" v-bind="state" :close="close" />
          </div>
        </div>
      </Popup>
    </Portal>
  </DrawerRoot>
</template>
