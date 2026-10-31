<script setup lang="ts">
import { useId, type HTMLAttributes } from 'vue';
import { useFieldAttrs } from './use-field-attrs';
import { RadioRoot, RadioIndicator, type RadioValue } from '@vunset/vue';
import { useFormRadioGroup } from './radio-context';

defineOptions({ name: 'FormRadio', inheritAttrs: false });

const props = defineProps<{
  /** What the group's `v-model` holds while this radio is chosen. */
  value: RadioValue;
  label?: string;
  help?: string;
  /** Takes this one radio out of reach; arrow keys skip it. */
  disabled?: boolean;
  /** Classes for the label, beside its own. */
  labelClass?: HTMLAttributes['class'];
  /** Classes for the help text, beside its own. */
  helpClass?: HTMLAttributes['class'];
}>();

const inGroup = useFormRadioGroup() !== null;

if (process.env.NODE_ENV !== 'production' && !inGroup) {
  console.warn(
    `[FormRadio] The radio for ${JSON.stringify(props.value)} is not inside a FormRadioGroup, which ` +
      'holds the value, the name and the keyboard for its radios. It renders nothing on its own.'
  );
}

const id = useId();
const helpId = useId();

const { fieldAttrs: rowAttrs, controlAttrs } = useFieldAttrs();
</script>

<template>
  <div v-if="inGroup" v-bind="rowAttrs" class="form-radio">
    <RadioRoot
      v-bind="controlAttrs"
      class="form-radio-control"
      :id="id"
      :value="value"
      :disabled="disabled"
      :aria-describedby="help || $slots.help ? helpId : undefined"
    >
      <RadioIndicator class="form-radio-indicator" />
    </RadioRoot>

    <label v-if="label || $slots.label" :for="id" class="form-label" :class="labelClass">
      <slot name="label">{{ label }}</slot>
    </label>

    <p v-if="help || $slots.help" :id="helpId" class="form-help" :class="helpClass">
      <slot name="help">{{ help }}</slot>
    </p>
  </div>
</template>
