<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, toRef, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useCollapsible } from '../../shared/use-collapsible';
import { provideCollapsibleContext, type CollapsibleState, type UseCollapsibleReturn } from '../../shared/use-collapsible';

defineOptions({ name: 'CollapsibleRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Whether the panel is open, bound with `v-model:open`. */
    open?: boolean;
    /** Opens at first, when no `v-model:open` owns it. */
    defaultOpen?: boolean;
    /** Keeps the trigger from opening or closing it. */
    disabled?: boolean;
    /** The panel's id, which the trigger's `aria-controls` points at. Generated when not given. */
    id?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { open: undefined, defaultOpen: false, disabled: false, as: 'div' }
);

const emit = defineEmits<{
  /** The panel opened or closed, for `v-model:open`. */
  'update:open': [open: boolean];
  /** The same, for a listener without `v-model:open`. */
  change: [open: boolean];
}>();

defineSlots<{
  default(props: CollapsibleState): unknown;
  /**
   * Renders no element of its own: lay the collapsible out yourself and bind its API.
   * @internal
   */
  custom(props: UseCollapsibleReturn): unknown;
}>();

const api = useCollapsible({
  open: toRef(() => props.open),
  defaultOpen: toRef(() => props.defaultOpen),
  disabled: toRef(() => props.disabled),
  id: toRef(() => props.id),
  onChange: (open) => {
    emit('update:open', open);
    emit('change', open);
  }
});

provideCollapsibleContext(api);

const attrs = useAttrs();
const rootProps = computed(() => mergeProps(api.rootProps.value, attrs));
</script>

<template>
  <slot v-if="$slots.custom" name="custom" v-bind="api" />

  <Part :as="props.as" v-else v-bind="rootProps">
    <slot v-bind="api.state.value" />
  </Part>
</template>
