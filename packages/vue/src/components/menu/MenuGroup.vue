<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, ref, useId } from 'vue';
import { provideMenuGroupContext } from '../../shared/use-menu';

defineOptions({ name: 'MenuGroup', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const labelId = useId();
const hasLabel = ref(false);

provideMenuGroupContext({
  labelId,
  registerLabel() {
    hasLabel.value = true;
    return () => {
      hasLabel.value = false;
    };
  }
});

const groupProps = computed(() => ({
  'data-part': 'group',
  role: 'group',
  'aria-labelledby': hasLabel.value ? labelId : undefined
}));
</script>

<template>
  <Part :as="props.as" v-bind="{ ...groupProps, ...$attrs }">
    <slot />
  </Part>
</template>
