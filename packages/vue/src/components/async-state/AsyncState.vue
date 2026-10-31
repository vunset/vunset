<script lang="ts">
export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';
export type AsyncView = 'content' | 'pending' | 'empty' | 'error' | 'idle';

export interface AsyncStateSlotProps {
  /** The `status` it was given. */
  status: AsyncStatus;
  /** Which view is showing: `content` whenever there is data, else the one the status calls for. */
  view: AsyncView;
  /** Whether it is reloading with `soft-loading`, the content kept under the overlay. */
  refreshing: boolean;
}

export function resolveAsyncView(status: AsyncStatus, hasData: boolean, softLoading: boolean) {
  if (hasData) {
    const pending = status === 'pending';
    return {
      view: (pending && !softLoading ? 'pending' : 'content') as AsyncView,
      refreshing: pending && softLoading
    };
  }

  const view: Record<AsyncStatus, AsyncView> = {
    pending: 'pending',
    error: 'error',
    success: 'empty',
    idle: 'idle'
  };
  return { view: view[status], refreshing: false };
}

function present(data: unknown): boolean {
  if (data === null || data === undefined) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (data instanceof Map || data instanceof Set) return data.size > 0;
  if (Object.getPrototypeOf(data) === Object.prototype) return Object.keys(data as object).length > 0;
  return true;
}
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { dataAttrs } from '../../shared/data-attrs';
import Appear from '../appear/Appear.vue';

defineOptions({ name: 'AsyncState', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Where the request is. */
    status: AsyncStatus;
    /** What the request returned, to tell content from empty: `null`, an empty array, map, set or plain object is no data. */
    data?: unknown;
    /** Whether there is data, when `data` can't tell. Overrides it. */
    hasData?: boolean;
    /** Reloading keeps the content on screen under an overlay, instead of replacing it. */
    softLoading?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { hasData: undefined, as: 'section' }
);

defineSlots<{
  /** The content, whenever there is data. */
  default(props: AsyncStateSlotProps): unknown;
  /** Shown while loading with no data yet, or on any reload without `soft-loading`. */
  pending(props: AsyncStateSlotProps): unknown;
  /** Shown when the request succeeded with no data. */
  empty(props: AsyncStateSlotProps): unknown;
  /** Shown when the request failed and there is no data to keep showing. */
  error(props: AsyncStateSlotProps): unknown;
  /** Shown before anything has been asked for. */
  idle(props: AsyncStateSlotProps): unknown;
  /** Laid over the content while it reloads with `soft-loading`. */
  overlay(props: AsyncStateSlotProps): unknown;
}>();

const resolved = computed(() =>
  resolveAsyncView(props.status, props.hasData ?? present(props.data), props.softLoading)
);

const state = computed<AsyncStateSlotProps>(() => ({
  status: props.status,
  view: resolved.value.view,
  refreshing: resolved.value.refreshing
}));

const ROLES: Partial<Record<AsyncView, string>> = { pending: 'status', empty: 'status', error: 'alert' };

const attrs = useAttrs();
const merged = computed(() =>
  mergeProps(
    {
      'data-part': 'async-state',
      ...dataAttrs(state.value),
      'aria-busy': props.status === 'pending' || undefined
    },
    attrs
  )
);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-if="state.view === 'content'" v-bind="state" />

    <div
      v-else-if="$slots[state.view]"
      data-part="async-state-message"
      :data-view="state.view"
      :role="ROLES[state.view]"
    >
      <slot :name="state.view" v-bind="state" />
    </div>

    <Appear :open="state.refreshing" :appear="false" data-part="async-state-overlay" aria-hidden="true">
      <slot name="overlay" v-bind="state" />
    </Appear>
  </Part>
</template>
