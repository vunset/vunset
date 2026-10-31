<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useRegisteredId } from '../../shared/labeling';
import { useDialogContext, type DialogState } from '../../shared/use-dialog';

defineOptions({ name: 'DialogTitle', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'h2' }
);

defineSlots<{
  /**
   * The dialog's state.
   * @slotOnly The element carries only `data-part="title"` and the id the popup is labeled by.
   */
  default(props: DialogState): unknown;
}>();

const { state, registerTitle } = useDialogContext();

const id = useRegisteredId(registerTitle);

const merged = usePartProps(() => ({ 'data-part': 'title', id: id.value }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>
