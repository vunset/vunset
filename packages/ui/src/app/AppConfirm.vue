<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useTemplateRef } from 'vue';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
  Portal,
  Positioner,
  Popup,
  Deferred,
  Part,
  type Align,
  type Side
} from '@vunset/vue';
import AppButton, { type AppTone } from './AppButton.vue';
import AppIcon from './AppIcon.vue';

defineOptions({ name: 'AppConfirm' });

const props = withDefaults(
  defineProps<{
    title?: string;
    /** The text under the title; line breaks in it show. The `#message` slot replaces it. */
    message?: string;
    /** The same as `message`. */
    content?: string;
    confirmText?: string;
    cancelText?: string;
    /** Opens as it mounts: for a trigger swapped in on the first press. */
    defaultOpen?: boolean;
    /** Renders only the trigger until a pointer reaches it or it is pressed: for a table with one in every row. */
    lazy?: boolean;
    /** The confirm button's tone. */
    tone?: AppTone;
    /** Which side of the trigger it opens on, flipping when there's no room. */
    side?: Side;
    align?: Align;
    /** Classes for the popup, beside its own. */
    popupClass?: HTMLAttributes['class'];
  }>(),
  { title: 'Confirm', confirmText: 'Confirm', cancelText: 'Cancel', tone: 'danger', side: 'top', align: 'start' }
);

const emit = defineEmits<{
  /** The confirm button was pressed. */
  confirm: [];
  /** It closed any other way: cancel, Escape, or a press outside. */
  cancel: [];
  /** It opened or closed, either way. */
  'update:open': [open: boolean];
}>();

defineSlots<{
  /** The trigger: one element or component, which opens it when pressed. */
  default(): unknown;
  /** Replaces `message`. */
  message?(): unknown;
}>();

const root = useTemplateRef<{ open: boolean }>('root');
let confirmed = false;

function close(): void {
  if (root.value) root.value.open = false;
}

function confirm(): void {
  confirmed = true;
  close();
  emit('confirm');
}

function onOpenChange(open: boolean): void {
  if (open) confirmed = false;
  else if (!confirmed) emit('cancel');
  emit('update:open', open);
}
</script>

<template>
  <Deferred :eager="!lazy || defaultOpen">
    <template #default="{ pressed }">
      <PopoverRoot
        ref="root"
        :default-open="defaultOpen || pressed"
        :side="side"
        :align="align"
        :side-offset="8"
        @update:open="onOpenChange"
      >
        <PopoverTrigger as="child"><slot /></PopoverTrigger>

        <Portal>
          <Positioner>
            <Popup role="alertdialog" class="app-surface app-popover app-confirm" :class="popupClass">
              <div class="app-confirm-header">
                <AppIcon name="alert-warning" class="app-confirm-icon" />

                <PopoverTitle class="app-confirm-title">{{ title }}</PopoverTitle>
              </div>

              <PopoverDescription v-if="props.message || props.content || $slots.message" class="app-confirm-message">
                <slot name="message">{{ props.message ?? props.content }}</slot>
              </PopoverDescription>

              <div class="app-confirm-actions">
                <AppButton variant="outline" class="app-confirm-cancel" @click="close">
                  {{ cancelText }}
                </AppButton>

                <AppButton variant="solid" :tone="tone" class="app-confirm-confirm" @click="confirm">
                  {{ confirmText }}
                </AppButton>
              </div>
            </Popup>
          </Positioner>
        </Portal>
      </PopoverRoot>
    </template>

    <template #placeholder>
      <Part as="child" data-part="trigger" data-closed="" aria-haspopup="dialog" aria-expanded="false">
        <slot />
      </Part>
    </template>
  </Deferred>
</template>
