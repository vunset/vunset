<script lang="ts">
import { computed, useAttrs, type ComputedRef, type HTMLAttributes } from 'vue';
import { createContext } from '../../shared/context';
import { mergeProps } from '../../shared/merge-props';

export interface TableContext {
  /** The sticky part's offset from its edge, or `undefined` when it does not stick. */
  stickyHeader: ComputedRef<number | undefined>;
  stickyFooter: ComputedRef<number | undefined>;
}

/** `true` sticks at the edge; a number, that many pixels from it. */
export type TableSticky = boolean | number;

const stickyOffset = (value: TableSticky | undefined) =>
  value === true ? 0 : typeof value === 'number' ? value : undefined;

export const { provideContext: provideTableContext, useOptionalContext: useOptionalTableContext } =
  createContext<TableContext>('Table');

export function pinStyle(pinned: 'start' | 'end' | undefined, offset = 0) {
  if (!pinned) return undefined;

  return {
    position: 'sticky' as const,
    [pinned === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: `${offset}px`,
    zIndex: 1
  };
}

export function widthStyle(width: number | string | undefined) {
  if (width === undefined) return undefined;
  const value = typeof width === 'number' ? `${width}px` : width;
  return { width: value, minWidth: value, maxWidth: value, boxSizing: 'border-box' as const };
}
</script>

<script setup lang="ts">
defineOptions({ name: 'TableRoot', inheritAttrs: false });

const props = defineProps<{
  /** Sticks the header to the top; a number keeps it that many pixels below, e.g. under an app bar. */
  stickyHeader?: TableSticky;
  /** Sticks the footer to the bottom; a number keeps it that many pixels above. */
  stickyFooter?: TableSticky;
  /** The full number of rows, for `aria-rowcount`, when only some of them are rendered. */
  rowCount?: number;
  /** A class for the `<table>` inside; `class` lands on the scrolling container. */
  tableClass?: HTMLAttributes['class'];
}>();

const stickyHeader = computed(() => stickyOffset(props.stickyHeader));
const stickyFooter = computed(() => stickyOffset(props.stickyFooter));

provideTableContext({ stickyHeader, stickyFooter });

const attrs = useAttrs();
const merged = computed(() =>
  mergeProps(
    {
      'data-part': 'table-container',
      ...(stickyHeader.value !== undefined ? { 'data-sticky-header': '' } : null),
      ...(stickyFooter.value !== undefined ? { 'data-sticky-footer': '' } : null),
      style: { overflow: 'auto' }
    },
    attrs
  )
);
</script>

<template>
  <div v-bind="merged">
    <table data-part="table" :aria-rowcount="props.rowCount" :class="props.tableClass">
      <slot />
    </table>
  </div>
</template>
