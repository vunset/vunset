<script setup lang="ts">
import { toRef, watch } from 'vue';
import { useDialog, provideDialogContext, type DialogRole, type DialogState } from '../../shared/use-dialog';

defineOptions({ name: 'DialogRoot' });

const props = withDefaults(
  defineProps<{
    /** Whether it is open, bound with `v-model:open`. */
    open?: boolean;
    /** Opens at first, when no `v-model:open` owns it. @default false */
    defaultOpen?: boolean;
    /** Trap focus, lock scrolling and hide the page behind from assistive tech. @default true */
    modal?: boolean;
    /** Closes on Escape. @default true */
    escapeKey?: boolean;
    /** Closes on a press outside the popup, such as on the backdrop. @default false */
    outsidePress?: boolean;
    /** `'alertdialog'` is for a question that must be answered; it is always modal and ignores outside presses. @default 'dialog' */
    role?: DialogRole;
  }>(),
  {
    open: undefined,
    defaultOpen: undefined,
    modal: undefined,
    escapeKey: undefined,
    outsidePress: undefined,
    role: undefined
  }
);

const emit = defineEmits<{
  /** It opened or closed, for `v-model:open`. */
  'update:open': [open: boolean];
  /** The same, for a listener without `v-model:open`. */
  change: [open: boolean];
  /** It closed and its exit animation has finished: the moment to unmount a dialog mounted to be shown. */
  closed: [];
}>();

defineSlots<{
  /**
   * The dialog's state.
   * @slotOnly The root renders no element of its own: the trigger, the backdrop and the popup carry these as attributes.
   */
  default(props: DialogState): unknown;
}>();

const api = useDialog({
  open: toRef(() => props.open),
  defaultOpen: toRef(() => props.defaultOpen),
  modal: toRef(() => props.modal),
  escapeKey: toRef(() => props.escapeKey),
  outsidePress: toRef(() => props.outsidePress),
  role: toRef(() => props.role),
  onChange: (open) => {
    emit('update:open', open);
    emit('change', open);
  }
});

provideDialogContext(api);
// Presence, not `open`: it ends once the exit animation has.
watch(api.present, (present) => {
  if (!present) emit('closed');
});
defineExpose(api);
</script>

<template>
  <slot v-bind="api.state.value" />
</template>
