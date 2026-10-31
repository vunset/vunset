<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext, type RenderedOption } from '../../shared/use-listbox';
import ComboboxChip from './ComboboxChip.vue';
import ComboboxChipRemove from './ComboboxChipRemove.vue';

defineOptions({ name: 'ComboboxChips', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * One chip, in place of the default: a `ComboboxChip` around its label and a `ComboboxChipRemove`.
   * @slotOnly
   */
  chip(props: RenderedOption): unknown;
  /**
   * The default chip's remove button, in place of a bare `ComboboxChipRemove`.
   * @slotOnly
   */
  remove(props: RenderedOption): unknown;
  /**
   * The count of chips past `flatten`.
   * @slotOnly
   */
  more(props: { count: number }): unknown;
}>();

const { chipsProps, state, visibleOptions, hiddenCount } = useListboxContext();
const merged = usePartProps(chipsProps);
</script>

<template>
  <Part :as="props.as" v-if="state.multiple" v-bind="merged">
    <template v-for="option in visibleOptions" :key="option.value">
      <slot name="chip" v-bind="option">
        <ComboboxChip :option="option">
          <span data-part="chip-label">{{ option.label }}</span>
          <slot name="remove" v-bind="option"><ComboboxChipRemove /></slot>
        </ComboboxChip>
      </slot>
    </template>

    <slot name="more" :count="hiddenCount">
      <span v-if="hiddenCount > 0" data-part="chip-overflow">+{{ hiddenCount }}</span>
    </slot>
  </Part>
</template>
