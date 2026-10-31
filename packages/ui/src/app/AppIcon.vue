<script lang="ts">
import { registerDefaultIcons } from '@vunset/vue';
import { UI_ICONS } from '../icons';

// Once, for the module: ui's icons go under the app's.
registerDefaultIcons(UI_ICONS);
</script>

<script setup lang="ts">
import { Comment, Fragment, Text, computed, useSlots, type VNode } from 'vue';
import { Icon, hasIcon } from '@vunset/vue';

defineOptions({ name: 'AppIcon' });

const props = defineProps<{
  /** The sprite's symbol of that name; ui's own names are drawn inline, from the app's file where it has one. */
  name: string;
  /** Put the app's file in the document instead of referencing the sprite. */
  inline?: boolean;
}>();

defineSlots<{
  /** Drawn when neither the app nor ui has `name`, in place of a sprite lookup. */
  default?(): unknown;
}>();

const slots = useSlots();

// A wrapper may pass a slot that renders nothing (a trigger with no text): that's no fallback.
const drawn = (nodes: VNode[]): boolean =>
  nodes.some((node) =>
    node.type === Comment
      ? false
      : node.type === Text
        ? String(node.children).trim() !== ''
        : node.type === Fragment
          ? drawn(node.children as VNode[])
          : true
  );

const fallback = computed(() => !hasIcon(props.name) && drawn((slots.default?.() ?? []) as VNode[]));
// ui's own names aren't in the app's sprite, and an app's file of that name must still replace them.
const builtIn = computed(() => props.inline || props.name in UI_ICONS);
</script>

<template>
  <Icon v-if="!fallback" :name="name" :inline="builtIn" class="app-icon" />
  <slot v-else />
</template>
