<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, ref, toRef, useId } from 'vue';
import { useControlled } from '../../shared/use-controlled';
import {
  provideMenuRadioGroupContext,
  provideMenuGroupContext,
  type MenuRadioValue,
} from '../../shared/use-menu';

defineOptions({ name: 'MenuRadioGroup', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The chosen value. Supplying it makes the group controlled. */
    modelValue?: MenuRadioValue;
    /** The initial value while uncontrolled. */
    defaultValue?: MenuRadioValue;
    /** Disables every item in the group. */
    disabled?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { modelValue: undefined, defaultValue: undefined, disabled: false, as: 'div' },
);

const emit = defineEmits<{
  /** The newly chosen value, for `v-model`. */
  'update:modelValue': [value: MenuRadioValue];
  /** Every choice, with the value and the event behind it. */
  change: [value: MenuRadioValue, event: Event];
}>();

defineSlots<{
  default(props: {
    /**
     * The chosen value.
     * @attribute none
     */
    value: MenuRadioValue | undefined;
    /** Whether the group ignores interaction. */
    disabled: boolean;
  }): unknown;
}>();

const labelId = useId();
const hasLabel = ref(false);

const value = useControlled<MenuRadioValue | undefined>({
  value: toRef(() => props.modelValue),
  defaultValue: toRef(() => props.defaultValue),
  prop: 'modelValue',
  name: 'MenuRadioGroup',
  label: 'value',
});

provideMenuRadioGroupContext({
  value,
  disabled: () => props.disabled,
  select(next, event) {
    value.value = next;
    emit('update:modelValue', next);
    emit('change', next, event);
  },
});

provideMenuGroupContext({
  labelId,
  registerLabel() {
    hasLabel.value = true;
    return () => {
      hasLabel.value = false;
    };
  },
});

const groupProps = computed(() => ({
  'data-part': 'radio-group',
  role: 'group',
  'aria-labelledby': hasLabel.value ? labelId : undefined,
  'aria-disabled': props.disabled || undefined,
  'data-disabled': props.disabled ? '' : undefined,
}));
</script>

<template>
  <!--
    A `group`, not a `radiogroup`: the menu already owns the items, and an
    element cannot be owned twice. The exclusivity is carried by the items'
    `menuitemradio` role, which is what a screen reader reads it from.
  -->
  <Part :as="props.as" v-bind="{ ...groupProps, ...$attrs }">
    <slot :value="value" :disabled="props.disabled" />
  </Part>
</template>
