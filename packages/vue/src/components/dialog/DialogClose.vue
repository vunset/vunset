<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useDialogContext, type DialogState } from '../../shared/use-dialog';

defineOptions({ name: 'DialogClose', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Also close every dialog or drawer this one was opened from. */
    closeAll?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { closeAll: false, as: 'button' }
);

defineSlots<{
  /**
   * The dialog's state.
   * @slotOnly
   */
  default(props: DialogState): unknown;
}>();

const { closeProps, state, closeAll } = useDialogContext();
const merged = usePartProps(() => (props.closeAll ? { type: 'button', onClick: () => closeAll() } : closeProps.value));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>
