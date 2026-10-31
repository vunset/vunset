import {
  computed,
  nextTick,
  onScopeDispose,
  reactive,
  ref,
  toValue,
  useId,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type WritableComputedRef
} from 'vue';
import { createContext } from './context';
import { provideSurface } from './surface';
import { useControlled } from './use-controlled';
import { dataAttrs } from './data-attrs';
import { anchoredStateAttrs } from './popup-state-attrs';
import { useTransitionStatus, type TransitionStatus } from './use-transition-status';
import { useExitAnimation } from './use-exit-animation';
import { usePositioning, type Align, type Side, type UsePositioningOptions } from './use-positioning';
import { useDismiss } from './use-dismiss';
import { useScrollLock } from './use-scroll-lock';
import { scrollIntoViewWithin } from './focus';
import { useTypeahead } from './use-typeahead';
import { useVirtualList } from '../composables/use-virtual-list';
import { useFieldValue, useOptionalFieldContext } from './use-field';
import { measureItemAlignment } from './align-item-with-trigger';

export type ListboxOptionValue = string | number;

export interface ListboxOption {
  /** Read from `valueKey` instead, when that is set. */
  value?: ListboxOptionValue;
  label?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

export type ListboxOptionInput = ListboxOptionValue | ListboxOption;

export interface ListboxGroup {
  label: string;
  disabled?: boolean;
  options: ListboxOptionInput[];
}

export type ListboxItem = ListboxOptionInput | ListboxGroup;

/** A named set of values, added or removed together. Multiple selection only. */
export interface ListboxPreset {
  label: string;
  values: ListboxOptionValue[];
  disabled?: boolean;
}

export interface ListboxPresetGroup {
  label: string;
  presets: ListboxPreset[];
  /** Starts folded away; its heading opens it. */
  collapsed?: boolean;
}

export type ListboxPresetItem = ListboxPreset | ListboxPresetGroup;

export interface RenderedPreset {
  preset: ListboxPreset;
  label: string;
  /** Whether every one of its values is selected. */
  active: boolean;
  disabled: boolean;
}

export interface RenderedPresetSection {
  label?: string;
  labelId?: string;
  /** Whether its presets show. Only a labeled section folds, and none while a search is on. */
  open: boolean;
  presets: RenderedPreset[];
}

export function isListboxGroup(item: ListboxItem): item is ListboxGroup {
  return typeof item === 'object' && Array.isArray((item as ListboxGroup).options);
}

// The presets outside a group, as one group of that name where the first of them sits.
function gatherLoose(items: ListboxPresetItem[], label: string | undefined): ListboxPresetItem[] {
  const isGroup = (item: ListboxPresetItem): item is ListboxPresetGroup => 'presets' in item;
  const first = items.findIndex((item) => !isGroup(item));
  if (!label || first === -1) return items;

  const groups = items.filter(isGroup);
  const loose = items.filter((item): item is ListboxPreset => !isGroup(item));
  return [...groups.slice(0, first), { label, presets: loose }, ...groups.slice(first)];
}

interface ResolvedGroup {
  label: string;
  disabled?: boolean;
  options: ListboxOption[];
}

type ResolvedItem = ListboxOption | ResolvedGroup;

const isResolvedGroup = (item: ResolvedItem): item is ResolvedGroup => Array.isArray((item as ResolvedGroup).options);

/** Drops repeats by string, keeping the first: `1` and `'1'` are one value. */
const uniqueValues = (values: ListboxOptionValue[]) => {
  const seen = new Set<string>();
  return values.filter((entry) => !seen.has(String(entry)) && Boolean(seen.add(String(entry))));
};

export interface RenderedOption {
  /** The option object as passed in, extra keys included. */
  option: ListboxOption;
  /** Its value. */
  value: ListboxOptionValue;
  /** Its text. */
  label: string;
  /** Whether it can't be chosen. */
  disabled: boolean;
  /** Whether it is part of the selection. */
  selected: boolean;
  /** Position in the flattened, filtered list. Ids and navigation both use it. */
  index: number;
  /** The row's element id, which `aria-activedescendant` points at. */
  id: string;
  /** Whether choosing this row coins a new value rather than picking one. */
  create?: boolean;
}

export interface RenderedSection {
  label?: string;
  labelId?: string;
  options: RenderedOption[];
  /** Whether this run holds the create row rather than real options. */
  create?: boolean;
}

export interface ListboxState {
  /** `select` or `combobox`, fixed by the root. */
  mode: ListboxMode;
  /**
   * Whether the popup is open.
   * @attribute `data-open` while open, `data-closed` otherwise
   */
  open: boolean;
  /** Whether it ignores interaction. */
  disabled: boolean;
  /** Whether the selection can be read but not changed. */
  readOnly: boolean;
  /** Whether a selection is needed before the form submits. */
  required: boolean;
  /** Whether the selection is invalid. */
  invalid: boolean;
  /** Whether more than one option can be chosen. */
  multiple: boolean;
  /** Whether the popup has a search box. */
  searchable: boolean;
  /** Whether the list is currently offering to coin the typed text. */
  creating: boolean;
  /** Whether anything is selected. */
  filled: boolean;
  /** Whether the search turned up nothing. */
  empty: boolean;
  /**
   * Whether the popup is sitting over the trigger rather than beside it.
   * @attribute `data-aligned-to-item` while true
   */
  alignedToItem: boolean;
  /**
   * The side of the trigger the popup ended up on.
   * @attribute `data-side="…"`
   */
  side: Side;
  /**
   * How the popup lines up along that side.
   * @attribute `data-align="…"`
   */
  align: Align;
  /**
   * Where the popup is in its enter or exit animation.
   * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
   */
  transitionStatus: TransitionStatus;
}

export type ListboxMode = 'select' | 'combobox';

export type ListboxOrder = 'selected-first';

export interface UseListboxOptions extends UsePositioningOptions {
  /**
   * `select` keeps the value in the trigger and any search box inside the
   * popup. `combobox` makes the trigger a text input, which is what lets a
   * typed value be committed. Implies `searchable`.
   */
  mode?: MaybeRefOrGetter<ListboxMode>;
  /** The selection. An array when `multiple`. Supplying it makes the value controlled. */
  value?: MaybeRefOrGetter<ListboxOptionValue | ListboxOptionValue[] | null | undefined>;
  /** The initial selection while uncontrolled. */
  defaultValue?: MaybeRefOrGetter<ListboxOptionValue | ListboxOptionValue[] | null | undefined>;
  /** The options, flat or grouped. */
  options?: MaybeRefOrGetter<ListboxItem[]>;
  /** Whether more than one option can be chosen. */
  multiple?: MaybeRefOrGetter<boolean>;
  /** Whether the popup carries a search box. */
  searchable?: MaybeRefOrGetter<boolean>;
  /** Whether the whole selection can be dropped at once. Defaults to on when anything is selected. */
  clearable?: MaybeRefOrGetter<boolean>;
  /** How many of the chosen options the trigger names before the rest collapse */
  flatten?: MaybeRefOrGetter<number | undefined>;
  /** Whether text that matches no option can become a value */
  creatable?: MaybeRefOrGetter<boolean | ((query: string) => boolean)>;
  /** Whether choosing an option closes the popup. Defaults to on for a single select. */
  closeOnSelect?: MaybeRefOrGetter<boolean | undefined>;
  /** Whether arrow keys wrap at the ends. */
  loop?: MaybeRefOrGetter<boolean>;
  /** Place the popup so the chosen option sits on top of the trigger */
  alignWithTrigger?: MaybeRefOrGetter<boolean>;
  /** Render only the options near the scroll position. Needs `maxHeight`, so the list scrolls itself. Flat lists only; turns `alignWithTrigger` off. */
  virtual?: MaybeRefOrGetter<boolean>;
  /** Caps the list, which then scrolls. A number is pixels. */
  maxHeight?: MaybeRefOrGetter<number | string | undefined>;
  /** `selected-first` lifts what is selected to the top of its group, each time the popup opens. */
  order?: MaybeRefOrGetter<ListboxOrder | undefined>;
  /** Named sets of values, for a multiple select. Filtered by the search like the options. */
  presets?: MaybeRefOrGetter<ListboxPresetItem[] | undefined>;
  /** Names the presets outside a group, gathered into one section that folds like a group, where the first sits. */
  presetsLabel?: MaybeRefOrGetter<string | undefined>;
  /** Which key on an option holds its value. */
  valueKey?: MaybeRefOrGetter<string | undefined>;
  /** Which key on an option holds its text. */
  labelKey?: MaybeRefOrGetter<string | undefined>;
  /** Replaces the built-in substring search. */
  filter?: (option: ListboxOption, query: string) => boolean;
  /** Whether the control ignores interaction. Inherited from a surrounding field. */
  disabled?: MaybeRefOrGetter<boolean>;
  /** Whether the selection can be read but not changed. Inherited from a surrounding field. */
  readOnly?: MaybeRefOrGetter<boolean>;
  /** Whether a selection is required: announced and marked, not enforced. Inherited from a surrounding field. */
  required?: MaybeRefOrGetter<boolean>;
  /** Whether the control is marked invalid. Inherited from a surrounding field. */
  invalid?: MaybeRefOrGetter<boolean>;
  /** Name submitted with the form. */
  name?: MaybeRefOrGetter<string | undefined>;
  /** The trigger's id. Taken from a surrounding field when there is one. */
  id?: MaybeRefOrGetter<string | undefined>;
  /** Whether the popup is open. Supplying it makes openness controlled. */
  open?: MaybeRefOrGetter<boolean | undefined>;
  /** Called whenever the selection changes. */
  onChange?: (value: ListboxOptionValue | ListboxOptionValue[] | null) => void;
  /** Called with the coined text just before it is selected */
  onCreate?: (value: string) => void;
  /** Called whenever the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

export type ListboxScrollDirection = 'up' | 'down';

export interface UseListboxReturn {
  value: WritableComputedRef<ListboxOptionValue | ListboxOptionValue[] | null>;
  open: WritableComputedRef<boolean>;
  /** The search text. Writable, so a caller can seed or clear it. */
  query: Ref<string>;
  state: ComputedRef<ListboxState>;
  /** Whether the popup is in the DOM. Outlives `open` for the exit animation. */
  present: Ref<boolean>;
  /** The options to render, filtered and grouped. */
  sections: ComputedRef<RenderedSection[]>;
  /** The same options in one list, in order: what `activeIndex` counts. */
  flatOptions: ComputedRef<RenderedOption[]>;
  /** The highlighted option's place in `flatOptions`, or `-1`. */
  activeIndex: Ref<number>;
  /** The options to render and the space around them while virtual; `null` otherwise. */
  virtualRows: ComputedRef<{ options: RenderedOption[]; before: number; after: number } | null>;
  /** Every option currently chosen, in selection order, resolved against `options`. */
  selectedOptions: ComputedRef<RenderedOption[]>;
  /** The chosen options the trigger names in full. */
  visibleOptions: ComputedRef<RenderedOption[]>;
  /** How many chosen options `visibleOptions` left out. */
  hiddenCount: ComputedRef<number>;
  /** The whole selection as one line: "Vue and 3 more". */
  summary: ComputedRef<string>;
  /** Whether anything was left out of `visibleOptions`. */
  collapsed: ComputedRef<boolean>;
  /** Whether the clear-all control has anything to do. */
  showClear: ComputedRef<boolean>;
  /** Whether the list has content beyond what is showing, that way. */
  canScroll: (direction: ListboxScrollDirection) => boolean;
  rootProps: ComputedRef<Record<string, unknown>>;
  triggerProps: ComputedRef<Record<string, unknown>>;
  clearProps: ComputedRef<Record<string, unknown>>;
  positionerProps: ComputedRef<Record<string, unknown>>;
  popupProps: ComputedRef<Record<string, unknown>>;
  searchProps: ComputedRef<Record<string, unknown>>;
  /** Bind to the combobox's text input. The trigger and the search box in one. */
  inputProps: ComputedRef<Record<string, unknown>>;
  /** Bind to the box holding the chips. */
  chipsProps: ComputedRef<Record<string, unknown>>;
  /** The presets that match the search, grouped. Empty unless `multiple`. */
  presetSections: ComputedRef<RenderedPresetSection[]>;
  presetsProps: ComputedRef<Record<string, unknown>>;
  /** Bind to the row holding a preset's buttons. */
  getPresetItemProps: (preset: RenderedPreset) => Record<string, unknown>;
  /** Bind to a preset's button: toggles its values. */
  getPresetProps: (preset: RenderedPreset) => Record<string, unknown>;
  /** Bind to a button that replaces the selection with the preset's values. */
  getPresetReplaceProps: (preset: RenderedPreset) => Record<string, unknown>;
  getPresetGroupProps: (section: RenderedPresetSection) => Record<string, unknown>;
  getPresetGroupLabelProps: (section: RenderedPresetSection) => Record<string, unknown>;
  /** Bind to a labeled section's heading: folds its presets away and back. */
  getPresetGroupTriggerProps: (section: RenderedPresetSection) => Record<string, unknown>;
  /** Bind to what holds a section's presets: a labeled one's stays rendered, `inert` while folded, so it can animate. */
  getPresetGroupPanelProps: (section: RenderedPresetSection) => Record<string, unknown>;
  /** Bind to the hover-to-scroll affordance at that end of the list. */
  getScrollProps: (direction: ListboxScrollDirection) => Record<string, unknown>;
  /** Bind to the part of the trigger showing the value. Used to line the popup up with it. */
  valueProps: ComputedRef<Record<string, unknown>>;
  /** Bind to the open/closed indicator. */
  indicatorProps: ComputedRef<Record<string, unknown>>;
  /** Bind to the "nothing matched" message. */
  emptyProps: ComputedRef<Record<string, unknown>>;
  stateAttrs: ComputedRef<Record<string, string>>;
  listboxProps: ComputedRef<Record<string, unknown>>;
  getOptionProps: (option: RenderedOption) => Record<string, unknown>;
  getGroupProps: (section: RenderedSection) => Record<string, unknown>;
  getGroupLabelProps: (section: RenderedSection) => Record<string, unknown>;
  getChipProps: (option: RenderedOption) => Record<string, unknown>;
  getChipRemoveProps: (option: RenderedOption) => Record<string, unknown>;
  /** One entry per value to submit. Render each as a hidden input. */
  hiddenInputs: ComputedRef<Array<{ name: string; value: ListboxOptionValue }>>;
  /** Removes one value from the selection. */
  deselect: (value: ListboxOptionValue) => void;
  /** Drops the whole selection. */
  clear: () => void;
  /** Chooses an option, or unchooses it when `multiple`. */
  toggle: (value: ListboxOptionValue) => void;
  close: () => void;
}

export function useListbox(options: UseListboxOptions = {}): UseListboxReturn {
  const field = useOptionalFieldContext();

  const generatedId = useId();
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  const triggerEl = ref<HTMLElement | null>(null);
  const searchEl = ref<HTMLInputElement | null>(null);
  const listboxEl = ref<HTMLElement | null>(null);
  const surfaceEl = ref<HTMLElement | null>(null);
  const positionerEl = ref<HTMLElement | null>(null);
  const valueEl = ref<HTMLElement | null>(null);

  const query = ref('');
  const typed = ref(false);

  const multiple = () => toValue(options.multiple) ?? false;
  const mode = () => toValue(options.mode) ?? 'select';
  const combobox = () => mode() === 'combobox';
  const searchable = () => combobox() || (toValue(options.searchable) ?? false);
  const readOnly = () => (toValue(options.readOnly) ?? false) || (field?.state.value.readOnly ?? false);
  const required = () => (toValue(options.required) ?? false) || (field?.state.value.required ?? false);
  const loop = () => toValue(options.loop) ?? true;
  const valueKey = () => toValue(options.valueKey) ?? 'value';
  const labelKey = () => toValue(options.labelKey) ?? 'label';

  const disabled = () => (toValue(options.disabled) ?? false) || (field?.state.value.disabled ?? false);

  const maxHeight = () => {
    const value = toValue(options.maxHeight);
    return typeof value === 'number' ? `${value}px` : value;
  };
  const invalid = () => (toValue(options.invalid) ?? false) || (field?.state.value.invalid ?? false);

  const closeOnSelect = () => toValue(options.closeOnSelect) ?? !multiple();

  const value = useControlled<ListboxOptionValue | ListboxOptionValue[] | null>({
    value: () => toValue(options.value),
    defaultValue: () => toValue(options.defaultValue) ?? (multiple() ? [] : null),
    prop: 'modelValue',
    empty: () => (multiple() ? [] : null),
    onChange: options.onChange,
    name: 'useListbox',
    label: 'value'
  });

  useFieldValue(field, () => value.value);

  const open = useControlled<boolean>({
    value: () => toValue(options.open),
    defaultValue: () => false,
    onChange: options.onOpenChange,
    prop: 'open',
    empty: false,
    name: 'useListbox',
    label: 'open'
  });

  function close() {
    open.value = false;
  }

  const { mounted, transitionStatus, setMounted } = useTransitionStatus(() => open.value);

  const alignFellBack = ref(false);
  const alignPlaced = ref(false);
  const alignStyle = ref<Record<string, string> | null>(null);

  const alignRequested = () =>
    (toValue(options.alignWithTrigger) ?? false) && !searchable() && !toValue(options.virtual);
  const alignActive = computed(() => alignRequested() && !alignFellBack.value);

  const positioning = usePositioning({
    ...options,
    side: () => toValue(options.side) ?? 'bottom',
    align: () => toValue(options.align) ?? 'start',
    sideOffset: () => toValue(options.sideOffset) ?? 4,
    // Too tall for either side, a list shrinks and scrolls rather than moving beside the trigger.
    fallbackAxis: () => toValue(options.fallbackAxis) ?? false,
    enabled: () => mounted.value && !alignActive.value
  });

  const placed = computed(() => (alignActive.value ? alignPlaced.value : positioning.isPositioned.value));

  useScrollLock(() => mounted.value && alignActive.value);

  useExitAnimation({
    open: () => open.value,
    mounted,
    setMounted,
    element: surfaceEl
  });

  useDismiss({
    enabled: () => open.value,
    elements: () => [positioning.popupRef.value, triggerEl.value],
    onDismiss: close
  });

  // ---------------------------------------------------------------- options

  const valueOf = (option: ListboxOption) => option[valueKey()] as ListboxOptionValue;
  const labelOf = (option: ListboxOption) => {
    const label = option[labelKey()];
    return label == null ? String(valueOf(option)) : String(label);
  };

  /** A bare value becomes an option keyed by `valueKey`, so `valueKey` still rules. */
  const toOption = (item: ListboxOptionInput): ListboxOption =>
    typeof item === 'object' ? item : ({ [valueKey()]: item } as ListboxOption);

  const resolvedOptions = computed<ResolvedItem[]>(() =>
    (toValue(options.options) ?? []).map((item) => {
      if (!isListboxGroup(item)) return toOption(item);

      return item.options.every((option) => typeof option === 'object')
        ? (item as ResolvedGroup)
        : { ...item, options: item.options.map(toOption) };
    })
  );

  const selectedValues = computed<ListboxOptionValue[]>(() => {
    const current = value.value;

    if (Array.isArray(current)) return current;

    return current == null || current === '' ? [] : [current];
  });

  // Values match as strings, so `1` from a URL query still picks the option coded `1`.
  const selectedKeys = computed(() => new Set(selectedValues.value.map(String)));

  // Snapshotted on open, so toggling an option while open does not move rows under the pointer.
  const pinned = ref(new Set<string>());

  watch(
    () => open.value,
    (isOpen) => {
      if (isOpen) pinned.value = toValue(options.order) === 'selected-first' ? new Set(selectedKeys.value) : new Set();
    },
    { immediate: true, flush: 'sync' }
  );

  const activeQuery = computed(() => (typed.value ? query.value : ''));
  const normalizedQuery = computed(() => activeQuery.value.trim().toLowerCase());

  function matches(option: ListboxOption): boolean {
    if (options.filter) {
      return options.filter(option, activeQuery.value);
    }
    if (!normalizedQuery.value) {
      return true;
    }
    return labelOf(option).toLowerCase().includes(normalizedQuery.value);
  }

  const sections = computed<RenderedSection[]>(() => {
    const result: RenderedSection[] = [];
    let index = 0;
    let loose: RenderedSection | null = null;

    const render = (option: ListboxOption, groupDisabled: boolean): RenderedOption => {
      const optionValue = valueOf(option);
      const rendered: RenderedOption = {
        option,
        value: optionValue,
        label: labelOf(option),
        disabled: Boolean(option.disabled) || groupDisabled,
        selected: selectedKeys.value.has(String(optionValue)),
        index,
        id: `${baseId}-o${index}`
      };
      index += 1;
      return rendered;
    };

    // Collected before rendering, so a reorder is what the indices follow.
    const runs: { label?: string; disabled: boolean; items: ListboxOption[] }[] = [];
    let run: (typeof runs)[number] | null = null;

    for (const item of resolvedOptions.value) {
      if (isResolvedGroup(item)) {
        const kept = item.options.filter(matches);
        if (kept.length > 0) runs.push({ label: item.label, disabled: Boolean(item.disabled), items: kept });
        run = null;
        continue;
      }

      if (!matches(item)) continue;

      if (!run) {
        run = { disabled: false, items: [] };
        runs.push(run);
      }
      run.items.push(item);
    }

    for (const { label, disabled: groupDisabled, items } of runs) {
      const ordered = pinned.value.size
        ? [
            ...items.filter((item) => pinned.value.has(String(valueOf(item)))),
            ...items.filter((item) => !pinned.value.has(String(valueOf(item))))
          ]
        : items;
      const rendered = ordered.map((option) => render(option, groupDisabled));

      if (label === undefined) {
        loose = { options: rendered };
        result.push(loose);
      } else {
        result.push({ label, labelId: `${baseId}-g${result.length}`, options: rendered });
      }
    }

    if (createCandidate.value !== null) {
      const coined = { [valueKey()]: createCandidate.value } as ListboxOption;
      result.push({
        create: true,
        options: [
          {
            option: coined,
            value: createCandidate.value,
            label: createCandidate.value,
            disabled: false,
            selected: false,
            create: true,
            index,
            id: `${baseId}-o${index}`
          }
        ]
      });
      index += 1;
    }

    return result;
  });

  const flatOptions = computed(() => sections.value.flatMap((section) => section.options));

  const optionIndex = computed(() => {
    const all = new Map<string, ListboxOption>();

    for (const item of resolvedOptions.value) {
      const list = isResolvedGroup(item) ? item.options : [item];

      for (const option of list) all.set(String(valueOf(option)), option);
    }

    return all;
  });

  const selectedOptions = computed<RenderedOption[]>(() => {
    return selectedValues.value.map((selected, position) => {
      const option = optionIndex.value.get(String(selected)) ?? ({ [valueKey()]: selected } as ListboxOption);
      return {
        option,
        value: selected,
        label: labelOf(option),
        disabled: Boolean(option.disabled),
        selected: true,
        index: position,
        id: `${baseId}-s${position}`
      };
    });
  });

  const createCandidate = computed<string | null>(() => {
    const rule = toValue(options.creatable) ?? false;
    if (rule === false) return null;

    const raw = activeQuery.value.trim();
    if (!raw) return null;

    if (typeof rule === 'function' && !rule(raw)) return null;

    const lowered = raw.toLowerCase();

    for (const option of optionIndex.value.values()) {
      if (String(valueOf(option)).toLowerCase() === lowered || labelOf(option).toLowerCase() === lowered) return null;
    }

    if (selectedValues.value.some((entry) => String(entry).toLowerCase() === lowered)) return null;

    return raw;
  });

  const flatten = computed(() => toValue(options.flatten));

  const visibleOptions = computed(() => {
    const limit = flatten.value;

    if (limit === undefined || limit < 0) return selectedOptions.value;

    return selectedOptions.value.slice(0, limit);
  });

  const hiddenCount = computed(() => selectedOptions.value.length - visibleOptions.value.length);
  const collapsed = computed(() => hiddenCount.value > 0);

  const summary = computed(() => {
    const named = visibleOptions.value.map((option) => option.label).join(', ');

    if (hiddenCount.value === 0) return named;
    if (!named) return `${hiddenCount.value} selected`;

    return `${named} and ${hiddenCount.value} more`;
  });

  const clearable = () => toValue(options.clearable) ?? true;
  const showClear = computed(() => clearable() && !disabled() && !readOnly() && selectedValues.value.length > 0);

  const grouped = computed(() => sections.value.some((section) => section.label));
  const isVirtual = computed(() => (toValue(options.virtual) ?? false) && !grouped.value);
  const rowHeight = ref(32);

  const windowing = useVirtualList({
    items: flatOptions,
    itemHeight: rowHeight,
    enabled: () => isVirtual.value && listboxEl.value !== null,
    scroller: listboxEl,
    overscan: 10
  });

  const virtualRows = computed(() =>
    isVirtual.value
      ? { options: windowing.visible.value, before: windowing.before.value, after: windowing.after.value }
      : null
  );

  watch(
    listboxEl,
    (list) => {
      const option = isVirtual.value ? list?.querySelector<HTMLElement>('[role="option"]') : null;
      if (!option) return;

      const style = getComputedStyle(option);
      const px = (value: string) => parseFloat(value) || 0;
      const box =
        style.boxSizing === 'border-box'
          ? 0
          : px(style.paddingTop) + px(style.paddingBottom) + px(style.borderTopWidth) + px(style.borderBottomWidth);
      const height = px(style.height) + box;

      if (height > 0) rowHeight.value = height;
      else if (option.offsetHeight) rowHeight.value = option.offsetHeight;
    },
    { flush: 'post' }
  );

  // ------------------------------------------------------------- navigation

  // The highlight is an index into every option, rendered or not: an app's own
  // virtualizer, or ours, leaves most of them out of the page.
  const activeId = ref<string | undefined>(undefined);
  const activeIndex = ref(-1);
  const enabledIndices = computed(() =>
    flatOptions.value.filter((option) => !option.disabled).map((option) => option.index)
  );

  /**
   * `center` is for opening on the selection; the keyboard scrolls only as far as it must.
   * Our windowing's rows share one height, so it scrolls by the row's place; otherwise to the
   * option as it is rendered. One an app's virtualizer left out is the app's to reach, from
   * `activeIndex`.
   */
  function activateAt(index: number, scroll: boolean | 'center' = true) {
    activeIndex.value = index;
    activeId.value = flatOptions.value[index]?.id;

    const list = listboxEl.value;
    if (!scroll || index < 0 || !list) return;

    if (!isVirtual.value) {
      const element = activeId.value ? list.querySelector<HTMLElement>(`[id="${activeId.value}"]`) : null;
      if (element) scrollIntoViewWithin(element, list);
      return;
    }

    const inset = parseFloat(getComputedStyle(list).paddingTop) || 0;
    const top = inset + index * rowHeight.value;

    if (scroll === 'center') list.scrollTop = top + rowHeight.value / 2 - list.clientHeight / 2;
    else if (top < list.scrollTop + inset) list.scrollTop = top - inset;
    else if (top + rowHeight.value > list.scrollTop + list.clientHeight - inset)
      list.scrollTop = top + rowHeight.value - list.clientHeight + inset;
  }

  function navigate(event: KeyboardEvent): boolean {
    const list = enabledIndices.value;
    const position = list.indexOf(activeIndex.value);
    const last = list.length - 1;

    let next: number;
    if (event.key === 'ArrowDown') next = position + 1;
    else if (event.key === 'ArrowUp') next = position < 0 ? last : position - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return false;

    event.preventDefault();
    if (list.length === 0) return true;

    if (next > last) next = loop() ? 0 : last;
    if (next < 0) next = loop() ? last : 0;

    activateAt(list[next]);
    return true;
  }

  const typeahead = useTypeahead<RenderedOption>({
    items: () => flatOptions.value.filter((option) => !option.disabled),
    getText: (option) => option.label,
    getActive: () => flatOptions.value[activeIndex.value] ?? null,
    onMatch: (option) => activateAt(option.index)
  });

  function activateInitial(edge: 'first' | 'last') {
    const selected = flatOptions.value.find((option) => option.selected && !option.disabled);

    if (selected) {
      activateAt(selected.index, 'center');
      return;
    }

    const list = enabledIndices.value;
    activateAt(list[edge === 'last' ? list.length - 1 : 0] ?? -1);
  }

  function selectActive() {
    commit(flatOptions.value[activeIndex.value]);
  }

  function commit(option: RenderedOption | undefined) {
    if (!option || option.disabled) return;

    if (option.create) {
      options.onCreate?.(String(option.value));
    }

    toggle(option.value);

    if (combobox()) resetInput();
  }

  function resetInput() {
    typed.value = false;
    query.value = combobox() && !multiple() ? (selectedOptions.value[0]?.label ?? '') : '';
  }

  function toggle(next: ListboxOptionValue) {
    if (disabled() || readOnly()) {
      return;
    }

    if (multiple()) {
      const current = selectedValues.value;
      value.value = selectedKeys.value.has(String(next))
        ? current.filter((entry) => String(entry) !== String(next))
        : [...current, next];
    } else {
      value.value = next;
    }

    if (closeOnSelect()) {
      close();
    }
  }

  function deselect(target: ListboxOptionValue) {
    if (disabled() || readOnly()) return;

    value.value = multiple() ? selectedValues.value.filter((entry) => String(entry) !== String(target)) : null;
  }

  function clear() {
    if (disabled() || readOnly()) return;

    value.value = multiple() ? [] : null;
    resetInput();
  }

  // ---------------------------------------------------------------- presets

  // Folded or opened by its heading, by label; unset follows the group's `collapsed`.
  const presetsOpen = reactive(new Map<string, boolean>());

  const presetSections = computed<RenderedPresetSection[]>(() => {
    if (!multiple()) return [];

    const search = normalizedQuery.value;
    const hit = (text: string) => !search || text.toLowerCase().includes(search);
    const render = (preset: ListboxPreset): RenderedPreset => ({
      preset,
      label: preset.label,
      active: preset.values.length > 0 && preset.values.every((entry) => selectedKeys.value.has(String(entry))),
      disabled: Boolean(preset.disabled)
    });

    const result: RenderedPresetSection[] = [];
    let loose: RenderedPresetSection | null = null;

    for (const item of gatherLoose(toValue(options.presets) ?? [], toValue(options.presetsLabel))) {
      if ('presets' in item) {
        const kept = item.presets.filter((preset) => hit(preset.label) || hit(item.label));
        if (kept.length) {
          result.push({
            label: item.label,
            labelId: `${baseId}-p${result.length}`,
            open: Boolean(search) || (presetsOpen.get(item.label) ?? !item.collapsed),
            presets: kept.map(render)
          });
        }
        loose = null;
      } else if (hit(item.label)) {
        if (!loose) result.push((loose = { open: true, presets: [] }));
        loose.presets.push(render(item));
      }
    }

    return result;
  });

  function applyPreset({ preset, active, disabled: off }: RenderedPreset, replace: boolean) {
    if (disabled() || readOnly() || off) return;

    const current = selectedValues.value;
    const presetKeys = new Set(preset.values.map(String));
    value.value = replace
      ? uniqueValues(preset.values)
      : active
        ? current.filter((entry) => !presetKeys.has(String(entry)))
        : uniqueValues([...current, ...preset.values]);
  }

  // Keeps focus where it is: in the search box, or on the trigger.
  const keepFocus = (event: MouseEvent) => event.preventDefault();

  const presetsProps = computed(() => ({ ...hooks.value, 'data-part': 'presets' }));

  const getPresetItemProps = (preset: RenderedPreset) => ({
    'data-part': 'preset-item',
    'data-active': preset.active ? '' : undefined,
    'data-disabled': preset.disabled ? '' : undefined
  });

  function getPresetProps(preset: RenderedPreset) {
    return {
      'data-part': 'preset',
      type: 'button',
      'aria-pressed': preset.active,
      'data-active': preset.active ? '' : undefined,
      'data-disabled': preset.disabled ? '' : undefined,
      disabled: preset.disabled || undefined,
      onMousedown: keepFocus,
      onClick: () => applyPreset(preset, false)
    };
  }

  function getPresetReplaceProps(preset: RenderedPreset) {
    return {
      'data-part': 'preset-replace',
      type: 'button',
      'aria-label': `Replace with ${preset.label}`,
      disabled: preset.disabled || undefined,
      onMousedown: keepFocus,
      onClick: () => applyPreset(preset, true)
    };
  }

  const getPresetGroupProps = (section: RenderedPresetSection) =>
    section.label
      ? { 'data-part': 'preset-group', role: 'group', 'aria-labelledby': section.labelId, ...openAttrs(section.open) }
      : { 'data-part': 'preset-group' };

  const getPresetGroupLabelProps = (section: RenderedPresetSection) => ({
    'data-part': 'preset-group-label',
    id: section.labelId
  });

  const openAttrs = (open: boolean) => ({ 'data-open': open ? '' : undefined, 'data-closed': open ? undefined : '' });

  // A search opens every section with a hit, so the heading rests until it is cleared.
  const getPresetGroupTriggerProps = (section: RenderedPresetSection) => ({
    'data-part': 'preset-group-trigger',
    type: 'button',
    'aria-expanded': section.open,
    'aria-controls': `${section.labelId}-panel`,
    ...openAttrs(section.open),
    disabled: Boolean(normalizedQuery.value) || undefined,
    onMousedown: keepFocus,
    onClick: () => section.label && presetsOpen.set(section.label, !section.open)
  });

  const getPresetGroupPanelProps = (section: RenderedPresetSection) =>
    section.label
      ? { 'data-part': 'preset-group-panel', id: `${section.labelId}-panel`, inert: !section.open || undefined }
      : { 'data-part': 'preset-group-panel' };

  function focusTarget(): HTMLElement | null {
    return combobox() ? (searchEl.value ?? triggerEl.value) : triggerEl.value;
  }

  function openMenu(edge: 'first' | 'last' = 'first') {
    if (disabled() || readOnly()) return;

    open.value = true;
    pendingEdge = edge;
  }

  let pendingEdge: 'first' | 'last' = 'first';

  function onOpenKeydown(event: KeyboardEvent) {
    if (navigate(event)) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      selectActive();
      return;
    }

    if (event.key === 'Tab') {
      close();
      return;
    }

    if (searchable()) {
      if (event.key === 'Backspace' && query.value === '' && multiple()) {
        const last = selectedValues.value.at(-1);

        if (last !== undefined) deselect(last);
      }

      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      selectActive();
      return;
    }

    typeahead.onKeydown(event);
  }

  function onInputKeydown(event: KeyboardEvent) {
    if (disabled() || readOnly()) return;

    if (!open.value) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openMenu(event.key === 'ArrowUp' ? 'last' : 'first');
        return;
      }

      if (event.key === 'Backspace' && query.value === '' && multiple()) {
        const last = selectedValues.value.at(-1);

        if (last !== undefined) deselect(last);
      }

      return;
    }

    onOpenKeydown(event);
  }

  function onTriggerKeydown(event: KeyboardEvent) {
    if (disabled() || readOnly()) return;

    if (!open.value) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openMenu(event.key === 'ArrowUp' ? 'last' : 'first');
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMenu('first');
      }

      return;
    }

    onOpenKeydown(event);
  }

  // ----------------------------------------------------------------- effects

  function placeOverTrigger() {
    const trigger = triggerEl.value;
    const positioner = positionerEl.value;
    const popup = surfaceEl.value;
    const list = listboxEl.value;

    if (!trigger || !positioner || !popup || !list) return;

    const item =
      list.querySelector<HTMLElement>('[role="option"][data-selected]') ??
      list.querySelector<HTMLElement>('[role="option"]');

    const placement = item
      ? measureItemAlignment({ trigger, positioner, popup, list, item, value: valueEl.value, maxHeight: maxHeight() })
      : null;

    if (!placement) {
      list.style.removeProperty('max-height');
      popup.style.removeProperty('--listbox-transform-origin');
      alignPlaced.value = false;
      alignFellBack.value = true;
      return;
    }

    alignStyle.value = {
      left: `${placement.left}px`,
      top: `${placement.top}px`
    };

    list.style.maxHeight = `${placement.listMaxHeight}px`;
    list.scrollTop = placement.scrollTop;
    popup.style.setProperty('--listbox-transform-origin', `50% ${placement.originRatio}%`);
    alignPlaced.value = true;
  }

  watch(
    mounted,
    (isMounted) => {
      if (!isMounted) {
        alignFellBack.value = false;
      }
    },
    { flush: 'post' }
  );

  watch(
    () => mounted.value && alignActive.value,
    async (on) => {
      if (!on) {
        alignPlaced.value = false;
        alignStyle.value = null;
        listboxEl.value?.style.removeProperty('max-height');
        surfaceEl.value?.style.removeProperty('--listbox-transform-origin');
        return;
      }
      await nextTick();
      placeOverTrigger();
    },
    { flush: 'post' }
  );

  watch(
    () => mounted.value && placed.value,
    async (ready) => {
      if (!ready) return;

      await nextTick();

      if (searchable()) searchEl.value?.focus({ preventScroll: true });

      activateInitial(pendingEdge);
      pendingEdge = 'first';
    },
    { flush: 'post' }
  );

  watch(
    () => open.value,
    (isOpen) => {
      if (isOpen) return;

      const active = document.activeElement;
      const hadFocus = !active || active === document.body || Boolean(positioning.popupRef.value?.contains(active));

      resetInput();
      activeId.value = undefined;
      activeIndex.value = -1;

      if (hadFocus) focusTarget()?.focus({ preventScroll: true });
    },
    { flush: 'post' }
  );

  watch(
    () => mounted.value && alignActive.value,
    (on) => {
      if (typeof window === 'undefined') return;

      if (on) window.addEventListener('resize', placeOverTrigger);
      else window.removeEventListener('resize', placeOverTrigger);
    },
    { flush: 'post' }
  );

  onScopeDispose(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', placeOverTrigger);
    }
  });

  watch(
    () => normalizedQuery.value,
    async () => {
      if (!open.value) return;

      await nextTick();
      activateAt(enabledIndices.value[0] ?? -1);
    },
    { flush: 'post' }
  );

  watch(
    () => selectedValues.value.length > 0,
    (filled) => field?.setFilled(filled),
    { immediate: true }
  );

  watch(
    () => (combobox() && !multiple() ? (selectedOptions.value[0]?.label ?? '') : null),
    (label) => {
      if (label === null || open.value) return;

      typed.value = false;
      query.value = label;
    },
    { immediate: true }
  );

  // ---------------------------------------------------------- scroll edges

  const canScrollUp = ref(false);
  const canScrollDown = ref(false);
  const SCROLL_EDGE_TOLERANCE = 1;

  function measureScrollEdges() {
    const list = listboxEl.value;

    if (!list) {
      canScrollUp.value = false;
      canScrollDown.value = false;
      return;
    }

    const max = list.scrollHeight - list.clientHeight;
    canScrollUp.value = list.scrollTop > SCROLL_EDGE_TOLERANCE;
    canScrollDown.value = list.scrollTop < max - SCROLL_EDGE_TOLERANCE;
  }

  const SCROLL_ARROW_SPEED = 420;

  let scrollFrame = 0;

  function stopArrowScroll() {
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    }
  }

  function startArrowScroll(direction: 'up' | 'down') {
    stopArrowScroll();

    let last: number | null = null;

    const step = (now: number) => {
      const list = listboxEl.value;
      if (!list) {
        scrollFrame = 0;
        return;
      }

      const elapsed = last === null ? 0 : Math.min(Math.max(now - last, 0), 64);
      last = now;

      if (elapsed > 0) {
        const before = list.scrollTop;
        list.scrollTop = before + (elapsed / 1000) * SCROLL_ARROW_SPEED * (direction === 'up' ? -1 : 1);
        measureScrollEdges();

        if (list.scrollTop === before) {
          scrollFrame = 0;
          return;
        }
      }

      scrollFrame = requestAnimationFrame(step);
    };

    scrollFrame = requestAnimationFrame(step);
  }

  watch(
    () => [mounted.value, placed.value, sections.value] as const,
    async ([isMounted]) => {
      if (!isMounted) stopArrowScroll();
      await nextTick();
      measureScrollEdges();
    },
    { flush: 'post' }
  );

  onScopeDispose(stopArrowScroll);

  // ------------------------------------------------------------------ props

  const state = computed<ListboxState>(() => ({
    mode: mode(),
    open: open.value,
    disabled: disabled(),
    readOnly: readOnly(),
    required: required(),
    invalid: invalid(),
    multiple: multiple(),
    searchable: searchable(),
    creating: createCandidate.value !== null,
    filled: selectedValues.value.length > 0,
    empty: flatOptions.value.length === 0,
    alignedToItem: alignActive.value && alignPlaced.value,
    side: positioning.renderedSide.value,
    align: positioning.renderedAlign.value,
    transitionStatus: transitionStatus.value
  }));

  const hooks = computed(() =>
    dataAttrs(state.value, {
      ...anchoredStateAttrs,
      alignedToItem: (on: boolean) => (on ? { 'data-aligned-to-item': '' } : null)
    })
  );

  const described = computed(() => {
    if (!field) return {};

    return {
      'aria-labelledby': field.labelledBy.value,
      'aria-describedby': field.describedBy.value
    };
  });

  const triggerId = computed(() => toValue(options.id) ?? field?.controlId.value ?? generatedId);

  const rootProps = computed(() => ({ ...hooks.value, 'data-part': 'root' }));

  function setTrigger(el: unknown) {
    triggerEl.value = (el as HTMLElement) ?? null;
    positioning.anchorRef.value = (el as HTMLElement) ?? null;
  }

  const comboboxTriggerProps = computed(() => ({
    ...hooks.value,
    'data-part': 'trigger',
    ref: setTrigger,
    onPointerdown(event: PointerEvent) {
      if (disabled() || readOnly()) return;

      if ((event.target as HTMLElement | null)?.closest('input, button, [role="button"]')) return;

      event.preventDefault();
      searchEl.value?.focus({ preventScroll: true });
      if (!open.value) openMenu('first');
    }
  }));

  const selectTriggerProps = computed(() => ({
    ...hooks.value,
    ...described.value,
    'data-part': 'trigger',
    id: triggerId.value,
    tabindex: disabled() ? undefined : 0,
    'aria-haspopup': 'listbox',
    'aria-expanded': open.value,
    'aria-controls': mounted.value ? listboxId : undefined,
    'aria-disabled': disabled() || undefined,
    'aria-required': required() || undefined,
    'aria-invalid': invalid() || undefined,
    ...(searchable()
      ? { role: 'button' }
      : {
          role: 'combobox',
          // Not on the searchable trigger: `button` has no read-only state to report.
          'aria-readonly': readOnly() || undefined,
          'aria-activedescendant': open.value ? activeId.value : undefined
        }),
    ref: setTrigger,
    onClick() {
      if (disabled() || readOnly()) return;

      open.value = !open.value;
    },
    onKeydown: onTriggerKeydown,
    onFocus() {
      field?.setFocused(true);
    },
    onBlur() {
      field?.setFocused(false);
      field?.setTouched(true);
    }
  }));

  const triggerProps = computed(() => (combobox() ? comboboxTriggerProps.value : selectTriggerProps.value));

  const clearProps = computed(() => ({
    ...hooks.value,
    'data-part': 'clear',
    type: 'button',
    tabindex: -1,
    'aria-label': 'Clear selection',
    onClick(event: MouseEvent) {
      event.stopPropagation();
      clear();
      focusTarget()?.focus({ preventScroll: true });
    }
  }));

  const triggerWidth = ref(0);

  function measureTrigger() {
    if (triggerEl.value) {
      triggerWidth.value = triggerEl.value.offsetWidth;
    }
  }

  watch(
    mounted,
    (isMounted) => {
      if (!isMounted) {
        observer?.disconnect();
        observer = null;
        return;
      }
      measureTrigger();
      if (typeof ResizeObserver !== 'undefined' && triggerEl.value) {
        observer = new ResizeObserver(measureTrigger);
        observer.observe(triggerEl.value);
      }
    },
    { flush: 'post' }
  );

  let observer: ResizeObserver | null = null;

  function setPositioner(el: unknown) {
    const node = (el as HTMLElement) ?? null;
    positionerEl.value = node;
    positioning.popupRef.value = node;
  }

  const positionerProps = computed(() => {
    if (alignActive.value) {
      return {
        style: {
          position: 'fixed' as const,
          zIndex: 50,
          '--listbox-trigger-width': `${triggerWidth.value}px`,
          ...(alignStyle.value ?? {}),
          visibility: alignPlaced.value ? undefined : ('hidden' as const)
        },
        'data-part': 'positioner',
        'data-side': 'none',
        'data-align': 'item',
        ref: setPositioner
      };
    }

    const base = positioning.positionerProps.value;
    return {
      ...base,
      'data-part': 'positioner',
      style: {
        ...(base.style as Record<string, unknown>),
        '--listbox-trigger-width': `${triggerWidth.value}px`
      },
      ref: setPositioner
    };
  });

  const valueProps = computed(() => ({
    ...hooks.value,
    'data-part': 'value',
    ref: (el: unknown) => {
      valueEl.value = (el as HTMLElement) ?? null;
    }
  }));

  const indicatorProps = computed(() => ({
    ...hooks.value,
    'data-part': 'indicator',
    'aria-hidden': 'true'
  }));

  const emptyProps = computed(() => ({ ...hooks.value, 'data-part': 'empty' }));

  const popupProps = computed(() => ({
    ...hooks.value,
    'data-part': 'popup',
    ref: (el: unknown) => {
      surfaceEl.value = (el as HTMLElement) ?? null;
    }
  }));

  function onQueryInput(event: Event) {
    query.value = (event.target as HTMLInputElement).value;
    typed.value = true;
  }

  const textInputProps = computed(() => ({
    ...hooks.value,
    type: 'text',
    role: 'combobox',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: false,
    'aria-controls': listboxId,
    'aria-autocomplete': 'list',
    'aria-activedescendant': activeId.value,
    value: query.value,
    ref: (el: unknown) => {
      searchEl.value = (el as HTMLInputElement) ?? null;
    },
    onInput: onQueryInput
  }));

  const searchProps = computed(() => ({
    ...textInputProps.value,
    'data-part': 'search',
    'aria-expanded': true,
    onKeydown: onOpenKeydown
  }));

  const inputProps = computed(() => ({
    ...textInputProps.value,
    ...described.value,
    'data-part': 'input',
    id: triggerId.value,
    disabled: disabled() || undefined,
    readonly: readOnly() || undefined,
    'aria-expanded': open.value,
    'aria-controls': mounted.value ? listboxId : undefined,
    'aria-activedescendant': open.value ? activeId.value : undefined,
    'aria-required': required() || undefined,
    'aria-invalid': invalid() || undefined,
    onInput(event: Event) {
      onQueryInput(event);
      if (!open.value) openMenu('first');
    },
    onKeydown: onInputKeydown,
    onClick() {
      if (!open.value) openMenu('first');
    },
    onFocus() {
      field?.setFocused(true);
    },
    onBlur() {
      field?.setFocused(false);
      field?.setTouched(true);
    }
  }));

  const chipsProps = computed(() => ({ ...hooks.value, 'data-part': 'chips' }));

  function getScrollProps(direction: ListboxScrollDirection) {
    return {
      ...hooks.value,
      'data-part': 'scroll',
      'data-direction': direction,
      'aria-hidden': 'true',
      onPointerenter(event: PointerEvent) {
        if (event.pointerType === 'touch') return;
        startArrowScroll(direction);
      },
      onPointerleave: stopArrowScroll,
      onMousedown(event: MouseEvent) {
        event.preventDefault();
      }
    };
  }

  function getChipProps(option: RenderedOption) {
    return { 'data-part': 'chip', 'data-value': String(option.value) };
  }

  function getChipRemoveProps(option: RenderedOption) {
    return {
      'data-part': 'chip-remove',
      type: 'button',
      tabindex: -1,
      'aria-label': `Remove ${option.label}`,
      onClick(event: MouseEvent) {
        event.stopPropagation();
        deselect(option.value);
        focusTarget()?.focus({ preventScroll: true });
      },
      onMousedown(event: MouseEvent) {
        event.preventDefault();
      }
    };
  }

  const listboxProps = computed(() => ({
    ...hooks.value,
    'data-part': 'listbox',
    id: listboxId,
    role: 'listbox',
    'aria-multiselectable': multiple() || undefined,
    ...(searchable() ? {} : { 'aria-labelledby': triggerId.value }),
    style: maxHeight() ? { maxHeight: maxHeight(), overflowY: 'auto' } : undefined,
    onScroll: measureScrollEdges,
    ref: (el: unknown) => {
      listboxEl.value = (el as HTMLElement) ?? null;
    }
  }));

  function getOptionProps(option: RenderedOption) {
    return {
      'data-part': 'option',
      id: option.id,
      role: 'option',
      'data-index': option.index,
      'aria-selected': option.selected,
      'aria-disabled': option.disabled || undefined,
      'data-selected': option.selected ? '' : undefined,
      'data-disabled': option.disabled ? '' : undefined,
      'data-active': activeId.value === option.id ? '' : undefined,
      'data-create': option.create ? '' : undefined,
      // Not every option may be in the DOM (a virtualizer's, or ours), so each says where it
      // stands. Not in a grouped list, where each group counts its own.
      'aria-setsize': grouped.value ? undefined : flatOptions.value.length,
      'aria-posinset': grouped.value ? undefined : option.index + 1,
      onClick() {
        commit(option);
      },
      onPointermove(event: PointerEvent) {
        if (event.movementX === 0 && event.movementY === 0) return;

        if (option.disabled) return;
        activateAt(option.index, false);
      },
      onMousedown(event: MouseEvent) {
        event.preventDefault();
      }
    };
  }

  function getGroupProps(section: RenderedSection) {
    return section.label
      ? { 'data-part': 'group', role: 'group', 'aria-labelledby': section.labelId }
      : { 'data-part': 'group', role: 'none', 'data-create': section.create ? '' : undefined };
  }

  function getGroupLabelProps(section: RenderedSection) {
    return { 'data-part': 'group-label', id: section.labelId, role: 'presentation' };
  }

  const hiddenInputs = computed(() => {
    const name = toValue(options.name) ?? field?.name();
    if (!name) return [];

    return selectedValues.value.map((entry) => ({ name, value: entry }));
  });

  provideSurface({
    present: mounted,
    state,
    popupProps,
    positionerProps
  });

  return {
    value,
    open,
    query,
    state,
    present: mounted,
    sections,
    flatOptions,
    activeIndex,
    virtualRows,
    selectedOptions,
    visibleOptions,
    hiddenCount,
    summary,
    collapsed,
    showClear,
    canScroll: (direction) => (direction === 'up' ? canScrollUp.value : canScrollDown.value),
    rootProps,
    triggerProps,
    clearProps,
    positionerProps,
    popupProps,
    searchProps,
    inputProps,
    chipsProps,
    presetSections,
    presetsProps,
    getPresetItemProps,
    getPresetProps,
    getPresetReplaceProps,
    getPresetGroupProps,
    getPresetGroupLabelProps,
    getPresetGroupTriggerProps,
    getPresetGroupPanelProps,
    getScrollProps,
    valueProps,
    indicatorProps,
    emptyProps,
    stateAttrs: hooks,
    listboxProps,
    getOptionProps,
    getGroupProps,
    getGroupLabelProps,
    getChipProps,
    getChipRemoveProps,
    hiddenInputs,
    deselect,
    clear,
    toggle,
    close
  };
}

export const { provideContext: provideListboxContext, useContext: useListboxContext } =
  createContext<UseListboxReturn>('Listbox');
