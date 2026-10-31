<script setup lang="ts">
import { Part } from '../../shared/part';
import { toRef } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useMenubar } from '../../shared/use-menubar';

defineOptions({ name: 'MenubarRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Disables every menu in the bar. */
    disabled?: boolean;
    /** Whether Left and Right wrap past the first and last menu. */
    loop?: boolean;
    /** Open the bar on hover, without a first click. Applies to every menu in it. */
    openOnHover?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { disabled: false, loop: true, openOnHover: false, as: 'div' },
);

const { rootProps } = useMenubar({
  disabled: toRef(() => props.disabled),
  loop: toRef(() => props.loop),
  openOnHover: toRef(() => props.openOnHover),
});

const merged = usePartProps(rootProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot />
  </Part>
</template>
