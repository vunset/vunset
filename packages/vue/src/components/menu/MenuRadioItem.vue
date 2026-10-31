<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import {
  provideMenuItemIndicatorContext,
  useMenuContext,
  useMenuRadioGroupContext,
  type MenuRadioValue
} from '../../shared/use-menu';

defineOptions({ name: 'MenuRadioItem', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** What the group's `v-model` holds while this item is chosen. */
    value: MenuRadioValue;
    /** Can't be chosen, and arrow keys skip it. */
    disabled?: boolean;
    /** Whether choosing this item closes the menu. */
    closeOnClick?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { disabled: false, closeOnClick: false, as: 'div' }
);

defineSlots<{
  default(props: {
    /**
     * Whether it is the chosen one.
     * @attribute `data-checked` while the chosen one, `data-unchecked` otherwise
     */
    checked: boolean;
    /** Whether it ignores interaction. */
    disabled: boolean;
  }): unknown;
}>();

const { getItemProps } = useMenuContext();
const group = useMenuRadioGroupContext();
const attrs = useAttrs();

const checked = computed(() => group.value.value === props.value);
const disabled = computed(() => props.disabled || group.disabled());

provideMenuItemIndicatorContext({ checked: () => checked.value, disabled: () => disabled.value });

const merged = computed(() =>
  mergeProps(
    getItemProps({
      role: 'menuitemradio',
      checked: checked.value,
      disabled: disabled.value,
      closeOnClick: props.closeOnClick,
      onSelect: (event) => group.select(props.value, event)
    }),
    attrs
  )
);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot :checked="checked" :disabled="disabled" />
  </Part>
</template>
