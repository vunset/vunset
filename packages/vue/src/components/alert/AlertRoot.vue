<script lang="ts">
import { createContext } from '../../shared/context';
import type { RegisterId } from '../../shared/labeling';

export interface AlertContext {
  registerTitle: RegisterId;
  registerDescription: RegisterId;
}

export const { provideContext, useContext: useAlertContext } = createContext<AlertContext>('Alert');
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { useLabeling } from '../../shared/labeling';
import { mergeProps } from '../../shared/merge-props';

defineOptions({ name: 'AlertRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const { titleId, descriptionId, registerTitle, registerDescription } = useLabeling();

provideContext({ registerTitle, registerDescription });

const attrs = useAttrs();

const rootProps = computed(() =>
  mergeProps(
    {
      'data-part': 'alert',
      role: 'alert',
      'aria-labelledby': titleId.value,
      'aria-describedby': descriptionId.value
    },
    attrs
  )
);
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot />
  </Part>
</template>
