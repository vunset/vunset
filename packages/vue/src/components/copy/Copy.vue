<script lang="ts">
import type { ClipboardStatus } from '../../composables/use-clipboard';

export interface CopyState {
  /** `copied` or `error` for a moment after a copy, `idle` otherwise. */
  status: ClipboardStatus;
  /** Whether the last copy worked, for as long as `timeout` says. */
  copied: boolean;
}
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs, useSlots } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { findInlineIcon } from '../../shared/icons';
import { useClipboard } from '../../composables/use-clipboard';
import { onRecycle } from '../../shared/recycle';
import Icon from '../icon/Icon.vue';

defineOptions({ name: 'Copy', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The text to copy. */
    value: string;
    /** Text beside the icon. Without it, or content of your own, the button is labeled "Copy". */
    label?: string;
    /** The icon at rest, by name: from `configureIcons`' folder, or else the sprite. A built-in one otherwise. @default 'copy' */
    icon?: string;
    /** The icon once copied, by name, the same way. @default 'copied' */
    copiedIcon?: string;
    /** How long, in milliseconds, it says it copied before settling back. @default 1500 */
    timeout?: number;
    /** Whether it is disabled. */
    disabled?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { disabled: false, as: 'button' }
);

const emit = defineEmits<{
  /** After each press, with whether the text reached the clipboard. */
  copy: [success: boolean];
}>();

defineSlots<{
  /** Content beside the icons; the `label` by default. */
  default(props: CopyState): unknown;
  /** Replaces both icons. */
  icon(props: CopyState): unknown;
}>();

const { copy, status, copied, reset } = useClipboard({ timeout: () => props.timeout });
onRecycle(reset);

function resolve(name: string | undefined, fallback: string) {
  const target = name ?? fallback;

  if (findInlineIcon(target)) return { name: target, inline: true };

  return name ? { name, inline: false } : null;
}

const icons = computed(() => [
  { state: 'idle' as const, icon: resolve(props.icon, 'copy') },
  { state: 'copied' as const, icon: resolve(props.copiedIcon, 'copied') }
]);

const slots = useSlots();
const attrs = useAttrs();

const state = computed<CopyState>(() => ({ status: status.value, copied: copied.value }));

async function onClick(event: MouseEvent) {
  // A copy button often sits in a clickable row or card, which shouldn't take the press too.
  event.stopPropagation();
  if (props.disabled) return;
  emit('copy', await copy(props.value));
}

const merged = computed(() =>
  mergeProps(
    {
      'data-part': 'copy',
      'data-status': status.value,
      ...(copied.value ? { 'data-copied': '' } : null),
      ...(props.disabled ? { 'data-disabled': '' } : null),
      type: 'button',
      disabled: props.disabled || undefined,
      'aria-label': props.label || slots.default ? undefined : 'Copy',
      onClick
    },
    attrs
  )
);

const isActive = (entry: ClipboardStatus) => (entry === 'copied') === copied.value;
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <span data-part="copy-icons" aria-hidden="true">
      <slot name="icon" v-bind="state">
        <template v-for="entry in icons" :key="entry.state">
          <Icon
            v-if="entry.icon"
            :name="entry.icon.name"
            :inline="entry.icon.inline"
            data-part="copy-icon"
            :data-state="entry.state"
            :data-active="isActive(entry.state) ? '' : undefined"
          />

          <svg
            v-else
            data-part="copy-icon"
            :data-state="entry.state"
            :data-active="isActive(entry.state) ? '' : undefined"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <template v-if="entry.state === 'idle'">
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
            </template>
            <path v-else d="m5 12 5 5L20 7" />
          </svg>
        </template>
      </slot>
    </span>

    <slot v-bind="state">{{ props.label }}</slot>
  </Part>
</template>
