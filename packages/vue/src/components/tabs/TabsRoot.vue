<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, toRef, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useTabs, provideTabsContext, type TabValue, type TabsOrientation } from './use-tabs';

defineOptions({ name: 'TabsRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The selected tab's `value`, bound with `v-model`. */
    modelValue?: TabValue;
    /** The tab selected at first, when no `v-model` owns it. */
    defaultValue?: TabValue;
    /** Which way the tabs run: Left/Right move between horizontal tabs, Up/Down between vertical ones. */
    orientation?: TabsOrientation;
    /** Select a tab as soon as an arrow key focuses it, rather than on Enter or Space. */
    activateOnFocus?: boolean;
    /** Whether arrow keys wrap past the first and last tab. */
    loop?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    orientation: 'horizontal',
    activateOnFocus: false,
    loop: true,
    as: 'div'
  }
);

const emit = defineEmits<{
  /** The newly selected tab's value, for `v-model`. */
  'update:modelValue': [value: TabValue];
  /** The same, for a listener without `v-model`. */
  change: [value: TabValue];
}>();

const api = useTabs({
  value: toRef(() => props.modelValue),
  defaultValue: toRef(() => props.defaultValue),
  orientation: toRef(() => props.orientation),
  activateOnFocus: toRef(() => props.activateOnFocus),
  loop: toRef(() => props.loop),
  onChange: (value) => {
    emit('update:modelValue', value);
    emit('change', value);
  }
});

provideTabsContext(api);
defineExpose(api);

const attrs = useAttrs();
const rootProps = computed(() => mergeProps(api.rootProps.value, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="api.state.value" />
  </Part>
</template>
