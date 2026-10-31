<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useTemplateRef } from 'vue';
import {
  FloatingRoot,
  FloatingHeader,
  FloatingTitle,
  FloatingClose,
  FloatingResizer,
  Portal,
  Popup,
  type FloatingResize,
  isPropBound
} from '@vunset/vue';
import AppButton from './AppButton.vue';
import AppIcon from './AppIcon.vue';

// Every other attribute lands on the panel.
defineOptions({ name: 'AppFloating', inheritAttrs: false });

// Forwarded only when bound, so one without `v-model:open` keeps its own state.
const openBound = isPropBound('open');

withDefaults(
  defineProps<{
    /** Whether it is open, bound with `v-model:open`. */
    open?: boolean;
    defaultOpen?: boolean;
    /** Names the panel, in its header. Or use the `#title` slot. */
    title?: string;
    /** A close button in the header. */
    closable?: boolean;
    /** Names the close button. */
    closeLabel?: string;
    /** Which edges may be pulled: `'x'`, `'y'`, `'both'` or `'none'`. */
    resize?: FloatingResize;
    /** Keeps the panel inside the viewport. */
    bounding?: boolean;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    /** Its width at first, in pixels. Its content decides when not given. */
    width?: number;
    /** Its height at first, in pixels. Its content decides when not given. */
    height?: number;
    /** Opens this many pixels from the viewport's left edge, and keeps it as the window resizes. */
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    /** Classes for the header, the drag handle. */
    headerClass?: HTMLAttributes['class'];
    /** Classes for the body, which scrolls. */
    bodyClass?: HTMLAttributes['class'];
  }>(),
  {
    open: undefined,
    defaultOpen: undefined,
    closable: true,
    closeLabel: 'Close',
    resize: 'both',
    bounding: undefined,
    minWidth: 240,
    minHeight: 120
  }
);

const emit = defineEmits<{
  'update:open': [open: boolean];
  /** It was dragged to here, its top-left corner in the viewport. */
  drag: [left: number, top: number];
  /** It was resized; `null` for an edge left to its content. */
  resize: [width: number | null, height: number | null];
}>();

defineSlots<{
  /** The body. */
  default?(props: { close: () => void }): unknown;
  /** The title, in place of `title`. */
  title?(): unknown;
  /** Buttons in the header, before the close button. */
  actions?(): unknown;
  /** A row of actions under the body. */
  footer?(props: { close: () => void }): unknown;
}>();

const root = useTemplateRef<{ open: boolean }>('root');

function close() {
  if (root.value) root.value.open = false;
}
</script>

<template>
  <FloatingRoot
    ref="root"
    v-slot="{ handles }"
    v-bind="openBound ? { open } : {}"
    :default-open="defaultOpen"
    :resize="resize"
    :bounding="bounding"
    :min-width="minWidth"
    :min-height="minHeight"
    :max-width="maxWidth"
    :max-height="maxHeight"
    :width="width"
    :height="height"
    :left="left"
    :right="right"
    :top="top"
    :bottom="bottom"
    @update:open="emit('update:open', $event)"
    @drag="(x, y) => emit('drag', x, y)"
    @resize="(w, h) => emit('resize', w, h)"
  >
    <Portal>
      <Popup class="app-surface app-floating" v-bind="$attrs">
        <FloatingHeader class="app-floating-header" :class="headerClass">
          <FloatingTitle v-if="title || $slots.title" class="app-floating-title">
            <slot name="title">{{ title }}</slot>
          </FloatingTitle>

          <div v-if="$slots.actions || closable" class="app-floating-actions">
            <slot name="actions" />

            <FloatingClose v-if="closable" :as="AppButton" variant="ghost" size="sm" square :aria-label="closeLabel">
              <AppIcon name="close" />
            </FloatingClose>
          </div>
        </FloatingHeader>

        <div class="app-floating-body" :class="bodyClass">
          <slot :close="close" />
        </div>

        <div v-if="$slots.footer" class="app-overlay-footer app-floating-footer">
          <slot name="footer" :close="close" />
        </div>

        <FloatingResizer v-for="handle in handles" :key="handle" :value="handle" class="app-floating-resizer" />
      </Popup>
    </Portal>
  </FloatingRoot>
</template>
