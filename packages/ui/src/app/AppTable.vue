<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { TableRoot, type TableSticky } from '@vunset/vue';

defineOptions({ name: 'AppTable' });

withDefaults(
  defineProps<{
    /** Sticks the header to the top; a number keeps it that many pixels below, e.g. under an app bar. */
    stickyHeader?: TableSticky;
    /** Sticks the footer to the bottom; a number keeps it that many pixels above. */
    stickyFooter?: TableSticky;
    /** The full number of rows, for `aria-rowcount`, when only some of them are rendered. */
    rowCount?: number;
    /** A class for the `<table>`; `class` lands on the scrolling container around it. */
    tableClass?: HTMLAttributes['class'];
  }>(),
  { stickyHeader: undefined, stickyFooter: undefined }
);

defineSlots<{
  /** The Table parts: `TableCaption`, `TableHeader`, `TableBody`, `TableFooter`. */
  default?(): unknown;
}>();
</script>

<template>
  <TableRoot :sticky-header="stickyHeader" :sticky-footer="stickyFooter" :row-count="rowCount" :table-class="tableClass" class="app-table">
    <slot />
  </TableRoot>
</template>
