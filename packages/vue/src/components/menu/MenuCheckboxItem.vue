<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, toRef, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useControlled } from '../../shared/use-controlled';
import { provideMenuItemIndicatorContext, useMenuContext } from '../../shared/use-menu';

defineOptions({ name: 'MenuCheckboxItem', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Whether it is checked, bound with `v-model`. */
    modelValue?: boolean;
    /** Starts checked, when no `v-model` owns it. */
    defaultChecked?: boolean;
    /** Can't be toggled, and arrow keys skip it. */
    disabled?: boolean;
    /**
     * Whether toggling this item closes the menu.
     *
     * Off by default, unlike a plain item: a menu that shuts on the first tick
     * makes setting two of them a chore.
     */
    closeOnClick?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { modelValue: undefined, defaultChecked: false, disabled: false, closeOnClick: false, as: 'div' }
);

const emit = defineEmits<{
  /** The new state, for `v-model`. */
  'update:modelValue': [checked: boolean];
  /** Every toggle, with the new state and the event behind it. */
  change: [checked: boolean, event: Event];
}>();

defineSlots<{
  default(props: {
    /**
     * Whether it is checked.
     * @attribute `data-checked` while checked, `data-unchecked` otherwise
     */
    checked: boolean;
    /** Whether it ignores interaction. */
    disabled: boolean;
  }): unknown;
}>();


const { getItemProps } = useMenuContext();
const attrs = useAttrs();

const checked = useControlled<boolean>({
  value: toRef(() => props.modelValue),
  defaultValue: toRef(() => props.defaultChecked),
  prop: 'modelValue',
  empty: false,
  name: 'MenuCheckboxItem',
  label: 'checked'
});

provideMenuItemIndicatorContext({ checked: () => checked.value, disabled: () => props.disabled });

const merged = computed(() =>
  mergeProps(
    getItemProps({
      role: 'menuitemcheckbox',
      checked: checked.value,
      disabled: props.disabled,
      closeOnClick: props.closeOnClick,
      onSelect: (event) => {
        const next = !checked.value;
        checked.value = next;
        emit('update:modelValue', next);
        emit('change', next, event);
      }
    }),
    attrs
  )
);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot :checked="checked" :disabled="props.disabled" />
  </Part>
</template>
