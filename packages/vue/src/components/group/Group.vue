<script lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch, type ComputedRef } from 'vue';
import { createContext } from '../../shared/context';
import { dataAttrs } from '../../shared/data-attrs';
import { mergeProps } from '../../shared/merge-props';
import type { Orientation } from '../../shared/use-roving-focus';

export type GroupVariant = 'group' | 'toolbar';

export interface GroupState {
  /** `group` for related controls, `toolbar` for a row of tools. */
  variant: GroupVariant;
  /** Which way the controls run. */
  orientation: Orientation;
}

export interface GroupContext {
  state: ComputedRef<GroupState>;
}

export const {
  provideContext: provideGroupContext,
  useContext: useGroupContext,
  useOptionalContext: useOptionalGroupContext
} = createContext<GroupContext>('Group');

export function perpendicular(orientation: Orientation): Orientation {
  return orientation === 'horizontal' ? 'vertical' : 'horizontal';
}

const CONTROL = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex], [contenteditable="true"]';
const SET_ROLES = new Set(['radiogroup', 'tablist', 'listbox', 'menubar', 'toolbar']);
const TEXT_INPUTS = new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number']);

const disabled = (el: Element) => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';

/**
 * Whether a key belongs to the field it lands in: arrows move the caret, except
 * past either end of a single-line field, where they carry on to the next item.
 */
function keepsKey(el: Element, key: string, next: string, previous: string): boolean {
  if (el instanceof HTMLTextAreaElement || (el as HTMLElement).isContentEditable) return true;
  if (!(el instanceof HTMLInputElement) || !TEXT_INPUTS.has(el.type)) return false;

  const { selectionStart: start, selectionEnd: end, value } = el;
  if (start === null || start !== end) return true;
  if (key === next && next === 'ArrowRight') return start < value.length;
  if (key === previous && previous === 'ArrowLeft') return start > 0;
  return true;
}

/**
 * The toolbar's items, per `specs/group.md`: its controls in document order, a
 * nested set counting once, as the member it leaves in the tab order. `ours`
 * holds the elements whose `tabindex` the toolbar set itself.
 */
export function toolbarItems(root: HTMLElement, ours: ReadonlySet<Element>) {
  const plain: HTMLElement[] = [];
  const all: HTMLElement[] = [];
  const sets = new Set<Element>();

  const setOf = (el: Element) => {
    for (let node = el.parentElement; node && node !== root; node = node.parentElement) {
      const role = node.getAttribute('role') ?? '';
      if (SET_ROLES.has(role)) return node;
      if (role === 'group') {
        const roving = Array.from(node.querySelectorAll(CONTROL)).some(
          (control) => control.getAttribute('tabindex') === '-1' && !ours.has(control)
        );
        if (roving) return node;
      }
    }
    return null;
  };

  for (const el of root.querySelectorAll<HTMLElement>(CONTROL)) {
    if (disabled(el)) continue;
    const set = setOf(el);
    if (!set) {
      plain.push(el);
      all.push(el);
    } else if (!sets.has(set) && el.getAttribute('tabindex') !== '-1') {
      sets.add(set);
      all.push(el);
    }
  }
  return { plain, all };
}
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
defineOptions({ name: 'Group', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** `group` gives `role="group"`, `toolbar` gives `role="toolbar"` with its orientation. */
    variant?: GroupVariant;
    /** Which way the controls run. A `Separator` inside runs across it. */
    orientation?: Orientation;
    /** Names the group for assistive technology, as `aria-label`. */
    label?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { variant: 'group', orientation: 'horizontal', as: 'div' }
);

const state = computed<GroupState>(() => ({
  variant: props.variant,
  orientation: props.orientation
}));

provideGroupContext({ state });

const element = ref<HTMLElement | null>(null);
const toolbar = () => state.value.variant === 'toolbar';

// Each `tabindex` the toolbar changed, and what it was, to put back.
const touched = new Map<HTMLElement, string | null>();
// The plain item holding the tab stop; `null` while a nested set holds it.
let current: HTMLElement | null = null;
let inSet = false;

function setTabIndex(el: HTMLElement, value: string) {
  if (!touched.has(el)) touched.set(el, el.getAttribute('tabindex'));
  if (el.getAttribute('tabindex') !== value) el.setAttribute('tabindex', value);
}

function restore() {
  for (const [el, value] of touched) {
    if (value === null) el.removeAttribute('tabindex');
    else el.setAttribute('tabindex', value);
  }
  touched.clear();
  current = null;
  inSet = false;
}

/** One tab stop among the plain items: the current one, else the first. */
function sync() {
  const root = element.value;
  if (!root || !toolbar()) return;

  const { plain } = toolbarItems(root, new Set(touched.keys()));
  if (current && !plain.includes(current)) current = null;
  const stop = inSet ? null : (current ?? plain[0]);
  for (const el of plain) setTabIndex(el, el === stop ? '0' : '-1');
}

function onFocusin(event: FocusEvent) {
  const root = element.value;
  if (!root || !toolbar()) return;

  const { plain } = toolbarItems(root, new Set(touched.keys()));
  const target = event.target as HTMLElement;
  if (plain.includes(target)) {
    current = target;
    inSet = false;
  } else if (target.matches(CONTROL)) {
    // In a nested set, which keeps a tab stop of its own: the toolbar gives up its.
    inSet = true;
  }
  sync();
}

function onKeydown(event: KeyboardEvent) {
  const root = element.value;
  if (!root || !toolbar() || event.defaultPrevented) return;

  const vertical = state.value.orientation === 'vertical';
  const next = vertical ? 'ArrowDown' : 'ArrowRight';
  const previous = vertical ? 'ArrowUp' : 'ArrowLeft';
  if (![next, previous, 'Home', 'End'].includes(event.key)) return;
  if (keepsKey(event.target as Element, event.key, next, previous)) return;

  const { all } = toolbarItems(root, new Set(touched.keys()));
  if (!all.length) return;

  const from = all.findIndex((el) => el === event.target || el.contains(event.target as Node));
  const index =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? all.length - 1
        : (from + (event.key === next ? 1 : -1) + all.length) % all.length;

  event.preventDefault();
  all[index].focus();
}

let observer: MutationObserver | null = null;

onMounted(() => {
  sync();
  observer = new MutationObserver(() => sync());
  if (element.value) {
    observer.observe(element.value, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled']
    });
  }
});

watch(toolbar, (on) => (on ? sync() : restore()), { flush: 'post' });

onBeforeUnmount(() => {
  observer?.disconnect();
  restore();
});

const attrs = useAttrs();

const rootProps = computed(() =>
  mergeProps(
    {
      ...dataAttrs(state.value),
      // Not `group`: a menu's and a listbox's groups already are.
      'data-part': 'control-group',
      ref: (el: unknown) => (element.value = (el as HTMLElement) ?? null),
      role: state.value.variant === 'toolbar' ? 'toolbar' : 'group',
      'aria-orientation': state.value.variant === 'toolbar' ? state.value.orientation : undefined,
      'aria-label': props.label,
      onFocusin,
      onKeydown
    },
    attrs
  )
);
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="state" />
  </Part>
</template>
