<script lang="ts">
import { createContext } from '../../shared/context';
import type { RenderedOption } from '../../shared/use-listbox';

/** Hands the chip's option to the `ComboboxChipRemove` inside it. */
export const { provideContext: provideComboboxChip, useContext: useComboboxChip } =
  createContext<() => RenderedOption>('ComboboxChip');
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext } from '../../shared/use-listbox';

defineOptions({ name: 'ComboboxChip', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The chip's option, as `ComboboxChips`' `chip` slot hands it. */
    option: RenderedOption;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

defineSlots<{
  /**
   * The chip's option.
   * @slotOnly The element carries `data-value`.
   */
  default(props: RenderedOption): unknown;
}>();

const { getChipProps } = useListboxContext();
provideComboboxChip(() => props.option);
const merged = usePartProps(() => getChipProps(props.option));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="props.option" />
  </Part>
</template>
