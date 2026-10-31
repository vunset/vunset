<script setup lang="ts">
import { toRef, watch } from 'vue';
import { useDrawer, type DrawerSide, type DrawerState } from './use-drawer';
import { provideDrawerContext } from './use-drawer';
import { provideDialogContext } from '../../shared/use-dialog';

defineOptions({ name: 'DrawerRoot' });

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
    /** Closes on a press outside the drawer, such as on the backdrop. */
    outsidePress?: boolean;
    /** Which edge the drawer enters from. @default 'bottom' */
    side?: DrawerSide;
    /** How it can be swiped away: `'handle'` by its handle, `true` from anywhere on it too (taps inside still land, text fields never drag), `false` not at all. */
    swipeable?: boolean | 'handle';
    /** Fraction of the drawer's size past which a release dismisses it. @default 0.4 */
    dismissThreshold?: number;
    /** Speed, in px/ms, past which a flick dismisses regardless of distance. @default 0.4 */
    velocityThreshold?: number;
  }>(),
  {
    open: undefined,
    defaultOpen: undefined,
    modal: undefined,
    escapeKey: undefined,
    outsidePress: true,
    side: undefined,
    swipeable: 'handle',
    dismissThreshold: undefined,
    velocityThreshold: undefined
  }
);

const emit = defineEmits<{
  /** It opened or closed, for `v-model:open`. */
  'update:open': [open: boolean];
  /** The same, for a listener without `v-model:open`. */
  change: [open: boolean];
  /** It closed and its exit animation has finished: the moment to unmount a drawer mounted to be shown. */
  closed: [];
}>();

defineSlots<{
  /**
   * The drawer's state.
   * @slotOnly The root renders no element of its own: the trigger, the backdrop, the popup and the handle carry these as attributes.
   */
  default(props: DrawerState): unknown;
}>();

const api = useDrawer({
  open: toRef(() => props.open),
  defaultOpen: toRef(() => props.defaultOpen),
  modal: toRef(() => props.modal),
  escapeKey: toRef(() => props.escapeKey),
  outsidePress: toRef(() => props.outsidePress),
  side: toRef(() => props.side),
  swipeable: toRef(() => props.swipeable),
  dismissThreshold: toRef(() => props.dismissThreshold),
  velocityThreshold: toRef(() => props.velocityThreshold),
  onChange: (open) => {
    emit('update:open', open);
    emit('change', open);
  }
});

provideDrawerContext(api);
// Trigger, Backdrop, Title, Description and Close are the dialog's own parts.
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
