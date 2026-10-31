<script lang="ts">
import type { Toast } from '@vunset/vue';
import type { AppButtonSize, AppButtonVariant, AppTone } from './AppButton.vue';

/** What AppToaster reads from a toast's `data`: an action button beside its text. */
export interface AppToastData {
  action?: {
    label: string;
    /** Runs on a press; the toast closes after it. */
    onClick: (toast: Toast<AppToastData>) => void;
    /** AppButton's props and any attrs, over its `sm` `outline` default. */
    props?: {
      variant?: AppButtonVariant;
      tone?: AppTone;
      size?: AppButtonSize;
      [attr: string]: unknown;
    };
  };
}
</script>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';
import {
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastProgress,
  type ToastPosition,
  type ToastStore,
  type ToastSwipeDirection
} from '@vunset/vue';
import AppButton from './AppButton.vue';
import AppIcon from './AppIcon.vue';
import AppSpinner from './AppSpinner.vue';

defineOptions({ name: 'AppToaster' });

const props = withDefaults(
  defineProps<{
    /** Which corner or edge the stack sits in. */
    position?: ToastPosition;
    /** How many toasts show at once; the rest wait their turn. */
    limit?: number;
    /** Milliseconds before a toast that names no `timeout` dismisses itself. */
    timeout?: number;
    /** Names the region for a screen reader. */
    label?: string;
    /** A store other than the shared one `useToast()` writes to. */
    store?: ToastStore;
    /** The ways a swipe dismisses a toast; `[]` turns swiping off. Defaults to away from the nearest edge, and right. */
    swipeDirection?: ToastSwipeDirection | ToastSwipeDirection[];
    /** A close button on each toast. */
    closable?: boolean;
    /** Names the close button. */
    closeLabel?: string;
    /** A bar along each toast's bottom edge, running down the time it has left. */
    progress?: boolean;
    /** Classes for each toast. */
    toastClass?: HTMLAttributes['class'];
  }>(),
  { position: 'bottom-end', limit: 3, timeout: 5000, label: 'Notifications', closable: true, closeLabel: 'Close' }
);

defineSlots<{
  /** A toast's content, in place of its title and text. */
  default?(props: { toast: Toast<AppToastData>; close: () => void }): unknown;
  /** The icon, in place of the one for its `type`. */
  icon?(props: { toast: Toast<AppToastData> }): unknown;
  /** Buttons beside the text, in place of `data.action`'s. The close button stays. */
  actions?(props: { toast: Toast<AppToastData>; close: () => void }): unknown;
}>();

const swipe = computed<ToastSwipeDirection | ToastSwipeDirection[]>(
  () => props.swipeDirection ?? (props.position.startsWith('top') ? ['up', 'right'] : ['down', 'right'])
);

const TYPE_ICONS: Record<string, string> = {
  success: 'alert-success',
  error: 'alert-danger',
  warning: 'alert-warning',
  info: 'alert-info',
  loading: 'spinner'
};

const iconed = (type: string | undefined) => type !== undefined && type in TYPE_ICONS;
</script>

<template>
  <ToastViewport
    class="app-toaster"
    :position="position"
    :limit="limit"
    :timeout="timeout"
    :label="label"
    :store="store"
  >
    <ToastRoot v-slot="{ toast, close }" class="app-surface app-toast" :class="toastClass" :swipe-direction="swipe">
      <span v-if="$slots.icon || iconed(toast.type)" class="app-toast-icon" aria-hidden="true">
        <slot name="icon" :toast="toast">
          <AppSpinner v-if="toast.type === 'loading'" />
          <AppIcon v-else :name="TYPE_ICONS[toast.type!]!" />
        </slot>
      </span>

      <div class="app-toast-body">
        <slot :toast="toast" :close="close">
          <ToastTitle class="app-toast-title" />
          <ToastDescription class="app-toast-description" />
        </slot>

        <div v-if="toast.data?.action || $slots.actions" class="app-toast-actions">
          <slot name="actions" :toast="toast" :close="close">
            <ToastAction
              :as="AppButton"
              size="sm"
              variant="outline"
              v-bind="toast.data.action.props"
              @click="toast.data.action.onClick(toast)"
            >
              {{ toast.data.action.label }}
            </ToastAction>
          </slot>
        </div>
      </div>

      <ToastClose
        v-if="closable"
        :as="AppButton"
        variant="ghost"
        size="sm"
        square
        class="app-toast-close"
        :aria-label="closeLabel"
      >
        <AppIcon name="close" />
      </ToastClose>

      <ToastProgress v-if="progress" class="app-toast-progress" />
    </ToastRoot>
  </ToastViewport>
</template>
