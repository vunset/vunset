<script lang="ts">
import type { TransitionStatus } from '../../shared/use-transition-status';

export interface AppearState {
  /**
   * Whether the content is meant to be showing.
   * @attribute `data-open` while open, `data-closed` otherwise
   */
  open: boolean;
  /**
   * Where it is in its enter or exit animation.
   * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
   */
  transitionStatus: TransitionStatus;
}
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, ref, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { dataAttrs } from '../../shared/data-attrs';
import { popupStateAttrs } from '../../shared/popup-state-attrs';
import { useTransitionStatus } from '../../shared/use-transition-status';
import { useExitAnimation } from '../../shared/use-exit-animation';

defineOptions({ name: 'Appear', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Whether the content is showing. */
    open?: boolean;
    /** Whether content that is already showing on the first render animates in. */
    appear?: boolean;
    /** Keep the element in the DOM while hidden, marked `hidden`, instead of unmounting it. */
    keepMounted?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { open: true, appear: true, keepMounted: false, as: 'div' }
);

defineSlots<{
  default(props: AppearState): unknown;
}>();

const element = ref<HTMLElement | null>(null);

const { mounted, transitionStatus, setMounted } = useTransitionStatus(() => props.open, {
  animateInitialOpen: props.appear
});

useExitAnimation({ open: () => props.open, mounted, setMounted, element });

const state = computed<AppearState>(() => ({
  open: props.open,
  transitionStatus: transitionStatus.value
}));

const attrs = useAttrs();

const rootProps = computed(() =>
  mergeProps(
    {
      'data-part': 'appear',
      ...dataAttrs(state.value, popupStateAttrs),
      hidden: mounted.value ? undefined : true,
      ref: (el: unknown) => {
        element.value = (el as HTMLElement) ?? null;
      }
    },
    attrs
  )
);
</script>

<template>
  <Part :as="props.as" v-if="mounted || props.keepMounted" v-bind="rootProps">
    <slot v-bind="state" />
  </Part>
</template>
