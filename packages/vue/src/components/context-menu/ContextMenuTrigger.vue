<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, onBeforeUnmount, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useMenuContext, type MenuState } from '../../shared/use-menu';

defineOptions({ name: 'ContextMenuTrigger', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** How long a touch has to be held before the menu opens, in milliseconds. */
    longPressDelay?: number;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { longPressDelay: 500, as: 'div' }
);

defineSlots<{
  /**
   * The menu's state.
   * @slotOnly
   */
  default(props: MenuState): unknown;
}>();

const menu = useMenuContext();

// Focus goes into the menu: the area that was pressed is rarely focusable, so
// left where it was, focus would leave the keyboard no way into the open menu.
function openAt(x: number, y: number) {
  // Closing puts focus back here, as a native context menu does.
  const active = document.activeElement;
  menu.setReturnFocus(active instanceof HTMLElement && active !== document.body ? active : null);
  menu.setAnchor({ getBoundingClientRect: () => new DOMRect(x, y, 0, 0) });
  void menu.openAndFocusFirst();
}

function onContextmenu(event: MouseEvent) {
  if (menu.state.value.disabled) return;

  event.preventDefault();
  openAt(event.clientX, event.clientY);
}

let pressTimer: ReturnType<typeof setTimeout> | undefined;
let pressOrigin: { x: number; y: number } | null = null;

const MOVE_TOLERANCE = 10;

function cancelPress() {
  clearTimeout(pressTimer);
  pressTimer = undefined;
  pressOrigin = null;
}

function onPointerdown(event: PointerEvent) {
  if (event.pointerType !== 'touch' || menu.state.value.disabled) return;

  cancelPress();
  pressOrigin = { x: event.clientX, y: event.clientY };
  pressTimer = setTimeout(() => openAt(event.clientX, event.clientY), props.longPressDelay);
}

function onPointermove(event: PointerEvent) {
  if (!pressOrigin) return;

  const moved =
    Math.abs(event.clientX - pressOrigin.x) > MOVE_TOLERANCE ||
    Math.abs(event.clientY - pressOrigin.y) > MOVE_TOLERANCE;

  if (moved) cancelPress();
}

onBeforeUnmount(cancelPress);

const attrs = useAttrs();

const merged = computed(() =>
  mergeProps(
    {
      'data-part': 'context-menu-trigger',
      onContextmenu,
      onPointerdown,
      onPointermove,
      onPointerup: cancelPress,
      onPointercancel: cancelPress
    },
    attrs
  )
);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="menu.state.value" />
  </Part>
</template>
