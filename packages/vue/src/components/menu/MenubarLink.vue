<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useMenubarContext } from '../../shared/use-menubar';

defineOptions({ name: 'MenubarLink', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Can't be followed; arrow keys still reach it. */
    disabled?: boolean;
    /** Element or component to render: `a` with an `href`, or `RouterLink` / `NuxtLink` with a `to`. */
    as?: string | object;
  }>(),
  { disabled: false, as: 'a' }
);

const menubar = useMenubarContext();
if (!menubar && process.env.NODE_ENV !== 'production') {
  console.warn('[vunset] `MenubarLink` belongs inside a `MenubarRoot`.');
}

const attrs = useAttrs();
const merged = computed(() => mergeProps(menubar?.getLinkProps({ disabled: props.disabled }) ?? {}, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot />
  </Part>
</template>
