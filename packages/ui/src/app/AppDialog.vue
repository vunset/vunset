<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useTemplateRef } from 'vue';
import {
  DialogRoot,
  DialogTrigger,
  DialogBackdrop,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Portal,
  Popup,
  type DialogRole,
  isPropBound
} from '@vunset/vue';
import AppButton from './AppButton.vue';
import AppIcon from './AppIcon.vue';

// Every other attribute — `aria-label`, an AppButton's `variant` — lands on the trigger.
defineOptions({ name: 'AppDialog', inheritAttrs: false });

// Forwarded only when bound, so one without `v-model:open` keeps its own state.
const openBound = isPropBound('open');

withDefaults(
  defineProps<{
    /** Whether it is open, bound with `v-model:open`. */
    open?: boolean;
    defaultOpen?: boolean;
    /** Names the dialog. Or use the `#title` slot. */
    title?: string;
    description?: string;
    /** `sm`, `md` or `lg`: how wide the panel may grow. */
    size?: 'sm' | 'md' | 'lg';
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
    /** Trap focus, lock scrolling and hide the page behind. */
    modal?: boolean;
    /** Closes on Escape. */
    escapeKey?: boolean;
    /** Closes on a press outside, on the backdrop. */
    outsidePress?: boolean;
    /** `alertdialog` for a question that must be answered: always modal, ignores outside presses. */
    role?: DialogRole;
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
    /** Classes for the footer. */
    footerClass?: HTMLAttributes['class'];
  }>(),
  {
    open: undefined,
    defaultOpen: undefined,
    size: 'md',
    closable: true,
    closeLabel: 'Close',
    modal: undefined,
    escapeKey: undefined,
    outsidePress: undefined,
    role: undefined
  }
);

const emit = defineEmits<{
  'update:open': [open: boolean];
  /** Closed, after its exit animation: unmount it here when it was mounted to be shown. */
  closed: [];
}>();

const root = useTemplateRef<{ open: boolean }>('root');

function close() {
  if (root.value) root.value.open = false;
}
</script>

<template>
  <DialogRoot
    ref="root"
    v-bind="openBound ? { open } : {}"
    :default-open="defaultOpen"
    :modal="modal"
    :escape-key="escapeKey"
    :outside-press="outsidePress"
    :role="role"
    @update:open="emit('update:open', $event)"
    @closed="emit('closed')"
  >
    <DialogTrigger
      v-if="trigger || $slots.trigger || as"
      :as="as ?? 'button'"
      :class="[!as && 'app-dialog-trigger', triggerClass]"
      v-bind="$attrs"
    >
      <slot name="trigger">{{ trigger }}</slot>
    </DialogTrigger>

    <Portal>
      <DialogBackdrop class="app-backdrop" :class="backdropClass" />

      <Popup v-slot="state" class="app-surface app-dialog" :class="popupClass" :data-size="size">
        <div
          v-if="title || $slots.title || description || $slots.description || closable"
          class="app-overlay-header"
          :class="headerClass"
        >
          <DialogTitle v-if="title || $slots.title" class="app-overlay-title" :class="titleClass">
            <slot name="title">{{ title }}</slot>
          </DialogTitle>

          <DialogDescription
            v-if="description || $slots.description"
            class="app-overlay-description"
            :class="descriptionClass"
          >
            <slot name="description">{{ description }}</slot>
          </DialogDescription>

          <DialogClose v-if="closable" class="app-overlay-close" :aria-label="closeLabel">
            <slot name="close" :close>
              <AppIcon name="close" />
            </slot>
          </DialogClose>
        </div>

        <slot v-bind="state" :close="close" />

        <div v-if="$slots.footer" class="app-overlay-footer" :class="footerClass">
          <slot name="footer" v-bind="state" :close="close" />
        </div>
      </Popup>
    </Portal>
  </DialogRoot>
</template>
