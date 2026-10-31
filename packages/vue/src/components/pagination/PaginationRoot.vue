<script lang="ts">
import { computed, type ComputedRef } from 'vue';
import { createContext } from '../../shared/context';

export type PaginationEntry =
  | { type: 'page'; page: number; key: string }
  | { type: 'ellipsis'; side: 'start' | 'end'; key: string };

export interface PaginationState {
  /** The current page, from 1. */
  page: number;
  /** How many pages there are. */
  totalPages: number;
  /**
   * Items per page.
   * @attribute none
   */
  perPage: number;
  /** Whether every page and arrow ignores interaction. */
  disabled: boolean;
  /** Whether the current page is the first. */
  first: boolean;
  /** Whether the current page is the last. */
  last: boolean;
}

export interface PaginationContext {
  state: ComputedRef<PaginationState>;
  items: ComputedRef<PaginationEntry[]>;
  navProps: ComputedRef<Record<string, unknown>>;
  prevProps: ComputedRef<Record<string, unknown>>;
  nextProps: ComputedRef<Record<string, unknown>>;
  ellipsisProps: ComputedRef<Record<string, unknown>>;
  getItemProps: (page: number) => Record<string, unknown>;
  /** What a page renders as, unless the part overrides it. */
  itemTag: ComputedRef<string | object>;
  /** What Prev and Next render as, unless the part overrides it. */
  prevTag: ComputedRef<string | object>;
  nextTag: ComputedRef<string | object>;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
}

export const { provideContext: providePaginationContext, useContext: usePaginationContext } =
  createContext<PaginationContext>('Pagination');

function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}

const page = (value: number): PaginationEntry => ({
  type: 'page',
  page: value,
  key: `page-${value}`
});

const ellipsis = (side: 'start' | 'end'): PaginationEntry => ({
  type: 'ellipsis',
  side,
  key: `ellipsis-${side}`
});

export function paginationItems(
  current: number,
  totalPages: number,
  siblings: number,
  boundaries: number
): PaginationEntry[] {
  if (totalPages <= 0) return [];

  const slots = siblings * 2 + boundaries * 2 + 3;

  if (slots >= totalPages) return range(1, totalPages).map(page);

  const left = current - siblings;
  const right = current + siblings;

  const leftGap = left > boundaries + 2;
  const rightGap = right < totalPages - (boundaries + 1);

  if (!leftGap && rightGap) {
    return [
      ...range(1, siblings * 2 + boundaries + 2).map(page),
      ellipsis('end'),
      ...range(totalPages - boundaries + 1, totalPages).map(page)
    ];
  }

  if (leftGap && !rightGap) {
    return [
      ...range(1, boundaries).map(page),
      ellipsis('start'),
      ...range(totalPages - (boundaries + 1 + siblings * 2), totalPages).map(page)
    ];
  }

  return [
    ...range(1, boundaries).map(page),
    ellipsis('start'),
    ...range(left, right).map(page),
    ellipsis('end'),
    ...range(totalPages - boundaries + 1, totalPages).map(page)
  ];
}
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { defaultLink } from '../../shared/link';
import { inject, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useControlled } from '../../shared/use-controlled';
import { batchRouteQuery, routeQueryKey } from '../../shared/route-query';

defineOptions({ name: 'PaginationRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The current page, from 1, bound with `v-model`. */
    modelValue?: number;
    /** The page at first, when no `v-model` owns it. */
    defaultValue?: number;
    /** Given directly, or worked out from `total` and `perPage`. */
    totalPages?: number;
    /** Total items. Only read when `totalPages` is absent. */
    total?: number;
    /** Items per page, for working out `totalPages` from `total`. Bound with `v-model:per-page`. */
    perPage?: number;
    /** Items per page at first, when no `v-model:per-page` owns it. */
    defaultPerPage?: number;
    /** Pages shown either side of the current one. */
    siblings?: number;
    /** Pages always shown at each end. */
    boundaries?: number;
    /** Disables every page and arrow. */
    disabled?: boolean;
    /** What a page renders as when `to` is set: `RouterLink`, `NuxtLink`, or `configureLink`'s (`a` by default). */
    link?: string | object;
    /** Turns pages into links: the `href`, or a `link`'s `to`, for a page number. */
    to?: (page: number) => unknown;
    /**
     * Keeps the page and page size in the URL, as `?page=` and `?perPage=`, or under the keys given.
     * Page 1 and the default size stay out of it. A bound `v-model` leaves its own value out.
     */
    query?: boolean | { page?: string; perPage?: string };
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { defaultValue: 1, perPage: undefined, defaultPerPage: 10, siblings: 1, boundaries: 1, disabled: false, as: 'nav' }
);

const emit = defineEmits<{
  /** The new page, for `v-model`. */
  'update:modelValue': [page: number];
  /** The same, for a listener without `v-model`. */
  change: [page: number];
  /** The new page size, for `v-model:per-page`. */
  'update:perPage': [perPage: number];
}>();

defineSlots<{
  /**
   * The pagination's state, and the entries to render.
   * @slotOnly The element carries only `data-disabled`.
   */
  default(
    props: PaginationState & {
      /** Pages and ellipses in order: `{ type: 'page', page }` or `{ type: 'ellipsis', side }`. */
      items: PaginationEntry[];
      /** Changes the page size, moving to the page that holds the first item shown. */
      setPerPage: (perPage: number) => void;
    }
  ): unknown;
}>();

// The URL, through the app's router, unless the caller binds the value itself.
const routeQuery = inject(routeQueryKey, null);
const writeQuery = routeQuery && batchRouteQuery(routeQuery);
const queryKey = (name: 'page' | 'perPage') =>
  routeQuery && props.query ? (props.query === true ? name : (props.query[name] ?? name)) : null;
const pageKey = () => (props.modelValue === undefined ? queryKey('page') : null);
const perPageKey = () => (props.perPage === undefined ? queryKey('perPage') : null);

function fromQuery(key: string, fallback: number): number {
  const value = Number(routeQuery!.get(key));
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

const perPageModel = useControlled<number>({
  value: () => {
    const key = perPageKey();
    return key ? fromQuery(key, props.defaultPerPage ?? 10) : props.perPage;
  },
  defaultValue: () => props.defaultPerPage ?? 10,
  onChange: (next) => {
    emit('update:perPage', next);
    const key = perPageKey();
    if (key) writeQuery!(key, next === (props.defaultPerPage ?? 10) ? undefined : String(next));
  },
  name: 'PaginationRoot',
  label: 'perPage'
});
const perPage = () => Math.max(1, Math.floor(perPageModel.value) || 1);
const disabled = () => props.disabled ?? false;
const linked = () => props.to !== undefined;

function pagesFor(size: number): number {
  if (props.totalPages !== undefined) return Math.max(0, Math.floor(props.totalPages));

  return props.total === undefined ? 1 : Math.max(0, Math.ceil(props.total / size));
}

const totalPages = computed(() => pagesFor(perPage()));

const raw = useControlled<number>({
  value: () => {
    const key = pageKey();
    return key ? fromQuery(key, props.defaultValue ?? 1) : props.modelValue;
  },
  defaultValue: () => props.defaultValue ?? 1,
  onChange: (next) => {
    emit('update:modelValue', next);
    emit('change', next);
    const key = pageKey();
    if (key) writeQuery!(key, next <= 1 ? undefined : String(next));
  },
  name: 'PaginationRoot',
  label: 'page'
});

function clampPage(value: number): number {
  const last = Math.max(1, totalPages.value);
  return Math.min(Math.max(Math.floor(value) || 1, 1), last);
}

const current = computed(() => clampPage(raw.value));

function setPage(next: number): void {
  const clamped = clampPage(next);
  if (clamped !== current.value) raw.value = clamped;
}

// The first item on screen stays on screen: page 3 of 10 (items 21–30) becomes page 2 of 20.
function setPerPage(next: number): void {
  const size = Math.max(1, Math.floor(next) || 1);
  if (size === perPage()) return;

  // Read before the size changes: the new size re-clamps `current` on its own, and the model would miss it.
  const before = current.value;
  const firstItem = (before - 1) * perPage();
  // Worked out against the new size: a controlled `per-page` hasn't come back yet.
  const page = Math.min(Math.floor(firstItem / size) + 1, Math.max(1, pagesFor(size)));

  perPageModel.value = size;
  if (page !== before) raw.value = page;
}

const state = computed<PaginationState>(() => ({
  page: current.value,
  totalPages: totalPages.value,
  perPage: perPage(),
  disabled: disabled(),
  first: current.value <= 1,
  last: current.value >= totalPages.value
}));

const items = computed(() =>
  paginationItems(current.value, totalPages.value, props.siblings ?? 1, props.boundaries ?? 1)
);

const linkTag = computed(() => props.link ?? (linked() ? defaultLink() : 'button'));

// A link with nowhere to go is an `<a>` without `href`: an app's link component,
// like `RouterLink`, can't render without its `to`.
const tagFor = (off: boolean) => (off && typeof linkTag.value !== 'string' ? 'a' : linkTag.value);
const itemTag = computed(() => tagFor(disabled()));
const prevTag = computed(() => tagFor(disabled() || state.value.first));
const nextTag = computed(() => tagFor(disabled() || state.value.last));

function target(page: number) {
  if (!props.to) return null;

  const value = props.to(page);
  return linkTag.value === 'a' ? { href: value } : { to: value };
}

function offAttrs(off: boolean) {
  if (!off) return null;

  return linked() ? { 'data-disabled': '', 'aria-disabled': 'true' as const } : { 'data-disabled': '', disabled: true };
}

function step(part: 'prev' | 'next') {
  const to = part === 'prev' ? current.value - 1 : current.value + 1;
  const off = disabled() || (part === 'prev' ? state.value.first : state.value.last);

  return {
    'data-part': part,
    ...(linked() ? null : { type: 'button' as const }),
    ...(off ? null : target(to)),
    ...offAttrs(off),
    'aria-label': part === 'prev' ? 'Previous page' : 'Next page',
    onClick(event: MouseEvent) {
      if (off) {
        event.preventDefault();
        return;
      }
      setPage(to);
    }
  };
}

const navProps = computed(() => ({
  'data-part': 'pagination',
  ...(disabled() ? { 'data-disabled': '' } : null),
  'aria-label': 'Pagination'
}));

const prevProps = computed(() => step('prev'));
const nextProps = computed(() => step('next'));

const ellipsisProps = computed(() => ({ 'data-part': 'ellipsis', 'aria-hidden': true }));

function getItemProps(page: number): Record<string, unknown> {
  const selected = page === current.value;
  const off = disabled();

  return {
    'data-part': 'item',
    'data-page': page,
    ...(selected ? { 'data-selected': '' } : null),
    ...(linked() ? null : { type: 'button' as const }),
    ...(off ? null : target(page)),
    ...offAttrs(off),
    'aria-label': `Page ${page}`,
    'aria-current': selected ? ('page' as const) : undefined,
    onClick(event: MouseEvent) {
      if (off) {
        event.preventDefault();
        return;
      }
      setPage(page);
    }
  };
}

const api: PaginationContext = {
  state,
  items,
  navProps,
  prevProps,
  nextProps,
  ellipsisProps,
  getItemProps,
  itemTag,
  prevTag,
  nextTag,
  setPage,
  setPerPage
};

providePaginationContext(api);
defineExpose(api);

const attrs = useAttrs();
const merged = computed(() => mergeProps(navProps.value, attrs));

const slotProps = computed(() => ({ ...state.value, items: items.value, setPerPage }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="slotProps" />
  </Part>
</template>
