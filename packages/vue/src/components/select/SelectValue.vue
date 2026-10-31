<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext, type ListboxState, type RenderedOption } from '../../shared/use-listbox';

defineOptions({ name: 'SelectValue', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Shown while nothing is selected. */
    placeholder?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

defineSlots<{
  default(
    props: ListboxState & {
      /**
       * Every selected option.
       * @attribute none
       */
      selected: RenderedOption[];
      /**
       * The selected options the trigger names, up to the root's `flatten`.
       * @attribute none
       */
      visible: RenderedOption[];
      /**
       * How many selected options `visible` leaves out.
       * @attribute none
       */
      hiddenCount: number;
      /**
       * Whether `visible` leaves any out.
       * @attribute none
       */
      collapsed: boolean;
      /**
       * The selection as one line of text: "Vue, TypeScript", or "Vue and 2 more".
       * @attribute none
       */
      summary: string;
      /**
       * The `placeholder` prop.
       * @attribute none
       */
      placeholder: string | undefined;
    }
  ): unknown;
}>();

const { valueProps, state, selectedOptions, visibleOptions, hiddenCount, collapsed, summary } = useListboxContext();
const merged = usePartProps(valueProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot
      :selected="selectedOptions"
      :visible="visibleOptions"
      :hidden-count="hiddenCount"
      :collapsed="collapsed"
      :summary="summary"
      :placeholder="props.placeholder"
      v-bind="state"
    >
      <span v-if="!state.filled" data-part="placeholder">{{ props.placeholder }}</span>
      <span v-else data-part="summary">{{ summary }}</span>
    </slot>
  </Part>
</template>
