<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useRegisteredId } from '../../shared/labeling';
import { useDialogContext, type DialogState } from '../../shared/use-dialog';

defineOptions({ name: 'DialogDescription', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'p' }
);

defineSlots<{
  /**
   * The dialog's state.
   * @slotOnly The element carries only `data-part="description"` and the id the popup is described by.
   */
  default(props: DialogState): unknown;
}>();

const { state, registerDescription } = useDialogContext();

const id = useRegisteredId(registerDescription);

const merged = usePartProps(() => ({ 'data-part': 'description', id: id.value }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>
