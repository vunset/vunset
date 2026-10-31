import {
  computed,
  onScopeDispose,
  ref,
  shallowRef,
  toValue,
  useId,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type WritableComputedRef
} from 'vue';
import { createContext } from '../../shared/context';
import { useControlled } from '../../shared/use-controlled';
import { dataAttrs } from '../../shared/data-attrs';
import { popupStateAttrs } from '../../shared/popup-state-attrs';
import { useRovingFocus, type Orientation } from '../../shared/use-roving-focus';
import { useRovingItems, type RovingItem } from '../../shared/use-roving-items';
import { useTransitionStatus, type TransitionStatus } from '../../shared/use-transition-status';
import { useExitAnimation } from '../../shared/use-exit-animation';

export type TabValue = string | number;
export type TabsOrientation = Orientation;
export type TabActivationDirection = 'none' | 'left' | 'right' | 'up' | 'down';

export const ACTIVE_TAB_LEFT_VAR = '--active-tab-left';
export const ACTIVE_TAB_RIGHT_VAR = '--active-tab-right';
export const ACTIVE_TAB_TOP_VAR = '--active-tab-top';
export const ACTIVE_TAB_BOTTOM_VAR = '--active-tab-bottom';
export const ACTIVE_TAB_WIDTH_VAR = '--active-tab-width';
export const ACTIVE_TAB_HEIGHT_VAR = '--active-tab-height';

const TAB_SELECTOR = '[role="tab"]';

export interface TabsState {
  /** Which way the tabs run, and so which arrow keys move between them. */
  orientation: TabsOrientation;
  /**
   * Which way the selection last moved, from the old tab to the new one: `none` before any change.
   * @attribute `data-activation-direction="…"`
   */
  activationDirection: TabActivationDirection;
}

export interface TabState extends TabsState {
  /** Whether it is the selected tab. */
  selected: boolean;
  /** Whether it can't be selected. */
  disabled: boolean;
}

export interface TabPanelState extends TabsState {
  /** Whether its tab is the selected one. */
  selected: boolean;
  /**
   * Where the panel is in its enter or exit animation.
   * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
   */
  transitionStatus: TransitionStatus;
}

export interface TabsIndicatorState extends TabsState {
  /**
   * Whether the selected tab has been measured; the indicator is `hidden` until then.
   * @attribute none
   */
  positioned: boolean;
}

export type TabRegistration = RovingItem<TabValue>;

export interface UseTabsOptions {
  value?: MaybeRefOrGetter<TabValue | undefined>;
  defaultValue?: MaybeRefOrGetter<TabValue | undefined>;
  /** @default 'horizontal' */
  orientation?: MaybeRefOrGetter<TabsOrientation | undefined>;
  /**
   * Select a tab as soon as an arrow key moves focus onto it, rather than waiting for Enter or Space.
   * @default false
   */
  activateOnFocus?: MaybeRefOrGetter<boolean | undefined>;
  loop?: MaybeRefOrGetter<boolean | undefined>;
  onChange?: (value: TabValue) => void;
}

export interface UseTabsReturn {
  value: WritableComputedRef<TabValue | undefined>;
  state: ComputedRef<TabsState>;
  rootProps: ComputedRef<Record<string, unknown>>;
  listProps: ComputedRef<Record<string, unknown>>;
  select: (value: TabValue) => void;
  /** @internal */ tabs: Ref<TabRegistration[]>;
  /** @internal */ listElement: Ref<HTMLElement | null>;
  /** @internal */ orientation: () => TabsOrientation;
  /** @internal */ activateOnFocus: () => boolean;
  /** @internal */ tabbableValue: ComputedRef<TabValue | undefined>;
  /** @internal */ highlight: (value: TabValue) => void;
  /** @internal */ registerTab: (registration: TabRegistration) => void;
  /** @internal */ unregisterTab: (id: string) => void;
  /** @internal */ registerPanel: (value: TabValue, id: string) => void;
  /** @internal */ unregisterPanel: (id: string) => void;
  /** @internal */ panelIdFor: (value: TabValue) => string | undefined;
  /** @internal */ tabIdFor: (value: TabValue) => string | undefined;
  /** @internal */ selectedTab: ComputedRef<TabRegistration | undefined>;
}

export function useTabs(options: UseTabsOptions = {}): UseTabsReturn {
  const orientation = () => toValue(options.orientation) ?? 'horizontal';
  const activateOnFocus = () => toValue(options.activateOnFocus) ?? false;
  const loop = () => toValue(options.loop) ?? true;

  const value = useControlled<TabValue | undefined>({
    value: () => toValue(options.value),
    defaultValue: () => toValue(options.defaultValue),
    onChange: (next) => {
      if (next !== undefined) options.onChange?.(next);
    },
    prop: 'modelValue',
    name: 'useTabs',
    label: 'value'
  });

  const listElement = ref<HTMLElement | null>(null);

  const registry = useRovingItems<TabValue>({ preferred: () => value.value });
  const orderedTabs = registry.ordered;

  const panels = shallowRef<{ value: TabValue; id: string }[]>([]);

  const selectedTab = computed(() => (value.value === undefined ? undefined : registry.find(value.value)));

  const activationDirection = ref<TabActivationDirection>('none');

  function directionBetween(from: TabValue | undefined, to: TabValue | undefined): TabActivationDirection {
    if (from === undefined || to === undefined || from === to) return 'none';

    const list = orderedTabs.value;
    const fromIndex = list.findIndex((tab) => tab.value === from);
    const toIndex = list.findIndex((tab) => tab.value === to);
    if (fromIndex === -1 || toIndex === -1) return 'none';

    const forward = toIndex > fromIndex;
    if (orientation() === 'vertical') return forward ? 'down' : 'up';

    return forward ? 'right' : 'left';
  }

  watch(
    () => value.value,
    (next, previous) => {
      activationDirection.value = directionBetween(previous, next);
      registry.highlight(next);
    }
  );

  // Once: an empty `v-model` only takes the value on the next update, so every tab would see it empty.
  let started = false;

  function registerTab(registration: TabRegistration): void {
    registry.register(registration);

    // The first tab is the starting one, written to an empty `v-model` too.
    if (!started && value.value === undefined && !registration.disabled) {
      started = true;
      value.value = registration.value;
    }
  }

  function registerPanel(panelValue: TabValue, id: string): void {
    const index = panels.value.findIndex((panel) => panel.id === id);
    const next = [...panels.value];
    if (index === -1) {
      next.push({ value: panelValue, id });
    } else {
      next[index] = { value: panelValue, id };
    }
    panels.value = next;
  }

  function unregisterPanel(id: string): void {
    panels.value = panels.value.filter((panel) => panel.id !== id);
  }

  const panelIdFor = (panelValue: TabValue) => panels.value.find((panel) => panel.value === panelValue)?.id;
  const tabIdFor = (tabValue: TabValue) => registry.find(tabValue)?.id;

  function select(next: TabValue): void {
    if (next === value.value) return;

    value.value = next;
  }

  const state = computed<TabsState>(() => ({
    orientation: orientation(),
    activationDirection: activationDirection.value
  }));

  const hooks = computed(() => dataAttrs(state.value, ACTIVATION_DIRECTION_ATTRS));

  const roving = useRovingFocus({
    container: listElement,
    itemSelector: TAB_SELECTOR,
    orientation,
    loop
  });

  const rootProps = computed(() => ({ ...hooks.value, 'data-part': 'tabs' }));

  const listProps = computed(() => ({
    ...hooks.value,
    'data-part': 'tabs-list',
    role: 'tablist',
    'aria-orientation': orientation() === 'vertical' ? 'vertical' : undefined,
    ref: setListElement,
    onKeydown(event: KeyboardEvent) {
      roving.onKeydown(event);
    }
  }));

  function setListElement(element: unknown): void {
    listElement.value = (element as HTMLElement) ?? null;
  }

  return {
    value,
    state,
    rootProps,
    listProps,
    select,
    tabs: registry.items,
    listElement,
    orientation,
    activateOnFocus,
    tabbableValue: registry.tabbableValue,
    highlight: registry.highlight,
    registerTab,
    unregisterTab: registry.unregister,
    registerPanel,
    unregisterPanel,
    panelIdFor,
    tabIdFor,
    selectedTab
  };
}

export interface UseTabOptions {
  value: MaybeRefOrGetter<TabValue>;
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  id?: MaybeRefOrGetter<string | undefined>;
}

export interface UseTabReturn {
  state: ComputedRef<TabState>;
  tabProps: ComputedRef<Record<string, unknown>>;
  selected: ComputedRef<boolean>;
}

export function useTab(options: UseTabOptions): UseTabReturn {
  const tabs = useTabsContext();
  const generatedId = useId();

  const id = computed(() => toValue(options.id) ?? generatedId);
  const tabValue = computed(() => toValue(options.value));
  const disabled = computed(() => toValue(options.disabled) ?? false);
  const element = ref<HTMLElement | null>(null);

  watch(
    [id, tabValue, disabled, element],
    ([currentId, currentValue, isDisabled, currentElement]) => {
      tabs.registerTab({
        id: currentId,
        value: currentValue,
        disabled: isDisabled,
        element: currentElement
      });
    },
    { immediate: true }
  );

  onScopeDispose(() => tabs.unregisterTab(id.value));

  const selected = computed(() => tabs.value.value === tabValue.value);

  const state = computed<TabState>(() => ({
    ...tabs.state.value,
    selected: selected.value,
    disabled: disabled.value
  }));

  const hooks = computed(() => dataAttrs(state.value, ACTIVATION_DIRECTION_ATTRS));

  const tabProps = computed(() => ({
    ...hooks.value,
    'data-part': 'tabs-tab',
    ref: setElement,
    id: id.value,
    role: 'tab',
    type: 'button',
    disabled: disabled.value || undefined,
    'aria-selected': selected.value,
    'aria-controls': tabs.panelIdFor(tabValue.value),
    tabindex: tabs.tabbableValue.value === tabValue.value ? 0 : -1,
    onClick() {
      if (disabled.value) return;
      tabs.select(tabValue.value);
    },
    onFocus() {
      if (tabs.activateOnFocus()) tabs.select(tabValue.value);
      else tabs.highlight(tabValue.value);
    }
  }));

  function setElement(next: unknown): void {
    element.value = (next as HTMLElement) ?? null;
  }

  return { state, tabProps, selected };
}

export interface UseTabPanelOptions {
  value: MaybeRefOrGetter<TabValue>;
  keepMounted?: MaybeRefOrGetter<boolean | undefined>;
}

export interface UseTabPanelReturn {
  state: ComputedRef<TabPanelState>;
  panelProps: ComputedRef<Record<string, unknown>>;
  present: Ref<boolean>;
}

export function useTabPanel(options: UseTabPanelOptions): UseTabPanelReturn {
  const tabs = useTabsContext();
  const id = useId();
  const element = ref<HTMLElement | null>(null);

  const panelValue = computed(() => toValue(options.value));
  const selected = computed(() => tabs.value.value === panelValue.value);

  watch(panelValue, (next) => tabs.registerPanel(next, id), { immediate: true });
  onScopeDispose(() => tabs.unregisterPanel(id));

  const { mounted, transitionStatus, setMounted } = useTransitionStatus(() => selected.value);
  useExitAnimation({ open: () => selected.value, mounted, setMounted, element });

  const state = computed<TabPanelState>(() => ({
    ...tabs.state.value,
    selected: selected.value,
    transitionStatus: transitionStatus.value
  }));

  const hooks = computed(() =>
    dataAttrs(state.value, {
      ...ACTIVATION_DIRECTION_ATTRS,
      transitionStatus: popupStateAttrs.transitionStatus
    })
  );

  const panelProps = computed(() => ({
    ...hooks.value,
    'data-part': 'tabs-panel',
    ref: setElement,
    id,
    role: 'tabpanel',
    hidden: mounted.value ? undefined : true,
    tabindex: 0,
    'aria-labelledby': tabs.tabIdFor(panelValue.value)
  }));

  function setElement(next: unknown): void {
    element.value = (next as HTMLElement) ?? null;
  }

  return { state, panelProps, present: mounted };
}

export interface UseTabsIndicatorReturn {
  state: ComputedRef<TabsIndicatorState>;
  indicatorProps: ComputedRef<Record<string, unknown>>;
  measure: () => void;
}

export function useTabsIndicator(): UseTabsIndicatorReturn {
  const tabs = useTabsContext();

  const geometry = ref<{
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  } | null>(null);

  function measure(): void {
    const list = tabs.listElement.value;
    const tab = tabs.selectedTab.value?.element ?? null;

    if (!list || !tab) {
      geometry.value = null;
      return;
    }

    const listRect = list.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();

    const left = tabRect.left - listRect.left + list.scrollLeft - list.clientLeft;
    const top = tabRect.top - listRect.top + list.scrollTop - list.clientTop;

    geometry.value = {
      left,
      top,
      width: tabRect.width,
      height: tabRect.height,
      right: list.scrollWidth - left - tabRect.width,
      bottom: list.scrollHeight - top - tabRect.height
    };
  }

  let observer: ResizeObserver | null = null;

  function observe(): void {
    observer?.disconnect();
    if (!observer) return;
    const list = tabs.listElement.value;
    if (list) observer.observe(list);

    for (const tab of tabs.tabs.value) {
      if (tab.element) observer.observe(tab.element);
    }
  }

  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure);
  }

  watch(
    () => [tabs.listElement.value, tabs.tabs.value] as const,
    () => {
      observe();
      measure();
    },
    { flush: 'post', immediate: true }
  );

  watch(() => tabs.value.value, measure, { flush: 'post' });

  onScopeDispose(() => observer?.disconnect());

  const state = computed<TabsIndicatorState>(() => ({
    ...tabs.state.value,
    positioned: geometry.value !== null
  }));

  const hooks = computed(() => dataAttrs(state.value, { ...ACTIVATION_DIRECTION_ATTRS, positioned: () => null }));

  const indicatorProps = computed(() => {
    const current = geometry.value;
    return {
      ...hooks.value,
      'data-part': 'tabs-indicator',
      role: 'presentation',
      hidden: current === null || undefined,
      style: current
        ? {
            [ACTIVE_TAB_LEFT_VAR]: `${current.left}px`,
            [ACTIVE_TAB_RIGHT_VAR]: `${current.right}px`,
            [ACTIVE_TAB_TOP_VAR]: `${current.top}px`,
            [ACTIVE_TAB_BOTTOM_VAR]: `${current.bottom}px`,
            [ACTIVE_TAB_WIDTH_VAR]: `${current.width}px`,
            [ACTIVE_TAB_HEIGHT_VAR]: `${current.height}px`
          }
        : undefined
    };
  });

  return { state, indicatorProps, measure };
}

const ACTIVATION_DIRECTION_ATTRS = {
  activationDirection: (direction: TabActivationDirection) => ({ 'data-activation-direction': direction })
};

export const { provideContext: provideTabsContext, useContext: useTabsContext } = createContext<UseTabsReturn>('Tabs');
