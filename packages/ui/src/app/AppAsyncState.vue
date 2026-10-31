<script setup lang="ts">
import { AsyncState, type AsyncStateSlotProps, type AsyncStatus } from '@vunset/vue';
import AppButton from './AppButton.vue';
import AppEmptyState from './AppEmptyState.vue';
import AppDotMatrix from './AppDotMatrix.vue';

defineOptions({ name: 'AppAsyncState' });

withDefaults(
  defineProps<{
    /** Where the request is: `idle`, `pending`, `success` or `error`. */
    status: AsyncStatus;
    /** What it returned: `null`, an empty array, map, set or object is no data. */
    data?: unknown;
    /** Whether there is data, when `data` can't tell. */
    hasData?: boolean;
    /** A reload keeps the content on screen under a loading indicator, instead of replacing it. */
    softLoading?: boolean;
    /** With `idle-text`, the view before the first fetch: what fetching would do. Neither draws nothing. */
    idleTitle?: string;
    idleText?: string;

    loadingTitle?: string;
    loadingText?: string;

    emptyTitle?: string;
    emptyText?: string;

    errorTitle?: string;
    errorText?: string;
    retryLabel?: string;
    /** Listening for it (`@retry`) adds the retry button to the error view. */
    onRetry?: () => void;
  }>(),
  {
    hasData: undefined,
    loadingTitle: 'Please wait',
    emptyTitle: 'Nothing here yet',
    errorTitle: 'Something went wrong',
    retryLabel: 'Try again'
  }
);

defineSlots<{
  /** The content, whenever there is data. */
  default?(props: AsyncStateSlotProps): unknown;
  /** The whole loading view, in place of the dot matrix. */
  pending?(props: AsyncStateSlotProps): unknown;
  /** The whole empty view. */
  empty?(props: AsyncStateSlotProps): unknown;
  /** Buttons under the empty view's text: "Create the first one". */
  'empty-actions'?(props: AsyncStateSlotProps): unknown;
  /** The whole error view. */
  error?(props: AsyncStateSlotProps): unknown;
  /** Before anything has been asked for. Nothing by default. */
  idle?(props: AsyncStateSlotProps): unknown;
}>();
</script>

<template>
  <AsyncState :status="status" :data="data" :has-data="hasData" :soft-loading="softLoading" class="app-async-state">
    <template #default="state"><slot v-bind="state" /></template>

    <template #pending="state">
      <slot name="pending" v-bind="state">
        <AppEmptyState tone="accent" :title="loadingTitle" :description="loadingText">
          <template #icon>
            <AppDotMatrix class="app-async-state-loader" />
          </template>
        </AppEmptyState>
      </slot>
    </template>

    <template #empty="state">
      <slot name="empty" v-bind="state">
        <AppEmptyState icon="search" :title="emptyTitle" :description="emptyText">
          <template v-if="$slots['empty-actions']" #actions><slot name="empty-actions" v-bind="state" /></template>
        </AppEmptyState>
      </slot>
    </template>

    <template #error="state">
      <slot name="error" v-bind="state">
        <AppEmptyState tone="danger" icon="alert-warning" :title="errorTitle" :description="errorText">
          <template v-if="onRetry" #actions>
            <AppButton variant="outline" size="sm" @click="onRetry()">{{ retryLabel }}</AppButton>
          </template>
        </AppEmptyState>
      </slot>
    </template>

    <template v-if="$slots.idle || idleTitle || idleText" #idle="state">
      <slot name="idle" v-bind="state">
        <AppEmptyState :title="idleTitle" :description="idleText" />
      </slot>
    </template>

    <template #overlay>
      <AppDotMatrix class="app-async-state-loader" />
    </template>
  </AsyncState>
</template>
