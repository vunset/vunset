<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext, type RenderedOption } from '../../shared/use-listbox';

defineOptions({ name: 'ListboxItem', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The option to render, as the list's slot hands it out. */
    option: RenderedOption;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /** The row's content. The option's label by default. */
  default?(props: RenderedOption): unknown;
}>();

const { getOptionProps } = useListboxContext();
const merged = usePartProps(() => getOptionProps(props.option));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="props.option">
      <template v-if="props.option.create">Create &ldquo;{{ props.option.label }}&rdquo;</template>
      <template v-else>{{ props.option.label }}</template>
    </slot>
  </Part>
</template>
