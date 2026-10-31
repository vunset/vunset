<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext, type RenderedOption } from '../../shared/use-listbox';
import { useComboboxChip } from './ComboboxChip.vue';

defineOptions({ name: 'ComboboxChipRemove', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

defineSlots<{
  /**
   * The chip's option.
   * @slotOnly
   */
  default(props: RenderedOption): unknown;
}>();

const { state, getChipRemoveProps } = useListboxContext();
const option = useComboboxChip();
const merged = usePartProps(() => getChipRemoveProps(option()));
</script>

<template>
  <Part :as="props.as" v-if="!state.disabled && !state.readOnly" v-bind="merged">
    <slot v-bind="option()">×</slot>
  </Part>
</template>
