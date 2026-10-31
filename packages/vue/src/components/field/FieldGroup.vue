<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useFieldContext } from '../../shared/use-field';

defineOptions({ name: 'FieldGroup', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const { groupProps, groupState } = useFieldContext();
const merged = usePartProps(groupProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="groupState" />
  </Part>
</template>
