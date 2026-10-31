<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useMenuContext } from '../../shared/use-menu';

defineOptions({ name: 'MenuItem', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Can't be chosen, and arrow keys skip it. */
    disabled?: boolean;
    /** Whether choosing this item closes the menu. */
    closeOnClick?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { disabled: false, closeOnClick: true, as: 'div' }
);

const emit = defineEmits<{
  /** Chosen, by click, Enter or Space. */
  select: [event: Event];
}>();

const { getItemProps } = useMenuContext();
const attrs = useAttrs();

const merged = computed(() =>
  mergeProps(
    getItemProps({
      disabled: props.disabled,
      closeOnClick: props.closeOnClick,
      onSelect: (event) => emit('select', event)
    }),
    attrs
  )
);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot />
  </Part>
</template>
