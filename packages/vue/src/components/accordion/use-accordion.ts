import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  useId,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type WritableComputedRef
} from 'vue';
import { createContext } from '../../shared/context';
import { useControlled } from '../../shared/use-controlled';
import { dataAttrs } from '../../shared/data-attrs';
import { useRovingItems } from '../../shared/use-roving-items';
import { useCollapsible, type UseCollapsibleReturn } from '../../shared/use-collapsible';
import type { Orientation } from '../../shared/use-roving-focus';

export type AccordionValue = string | number;

export interface AccordionState {
  /** Whether every item ignores interaction. */
  disabled: boolean;
  /** Which arrow keys move between the triggers. */
  orientation: Orientation;
}

export interface UseAccordionOptions {
  /** The open items. Supplying this makes the value controlled. */
  value?: MaybeRefOrGetter<AccordionValue[] | undefined>;
  defaultValue?: MaybeRefOrGetter<AccordionValue[] | undefined>;
  /** Let more than one item be open at a time. @default false */
  multiple?: MaybeRefOrGetter<boolean | undefined>;
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  /** Which arrow keys move between triggers. @default 'vertical' */
  orientation?: MaybeRefOrGetter<Orientation | undefined>;
  /** @default true */
  loop?: MaybeRefOrGetter<boolean | undefined>;
  onChange?: (value: AccordionValue[]) => void;
}

export interface UseAccordionReturn {
  value: WritableComputedRef<AccordionValue[]>;
  state: ComputedRef<AccordionState>;
  rootProps: ComputedRef<Record<string, unknown>>;
  isOpen: (item: AccordionValue) => boolean;
  setOpen: (item: AccordionValue, open: boolean) => void;
  /** @internal */ disabled: () => boolean;
  /** @internal */ registry: ReturnType<typeof useRovingItems<AccordionValue>>;
  /** @internal */ onTriggerKeydown: (event: KeyboardEvent) => void;
}

export function useAccordion(options: UseAccordionOptions = {}): UseAccordionReturn {
  const multiple = () => toValue(options.multiple) ?? false;
  const disabled = () => toValue(options.disabled) ?? false;
  const orientation = () => toValue(options.orientation) ?? 'vertical';
  const loop = () => toValue(options.loop) ?? true;

  const value = useControlled<AccordionValue[]>({
    value: () => toValue(options.value),
    defaultValue: () => toValue(options.defaultValue) ?? [],
    onChange: options.onChange,
    prop: 'modelValue',
    empty: () => [],
    name: 'useAccordion',
    label: 'value'
  });

  const registry = useRovingItems<AccordionValue>();

  const isOpen = (item: AccordionValue) => value.value.includes(item);

  function setOpen(item: AccordionValue, open: boolean) {
    if (open === isOpen(item)) return;

    if (!open) value.value = value.value.filter((entry) => entry !== item);
    else value.value = multiple() ? [...value.value, item] : [item];
  }

  // Walks registered triggers rather than querying the DOM, so a nested accordion's triggers stay out.
  function onTriggerKeydown(event: KeyboardEvent) {
    const vertical = orientation() === 'vertical';
    const triggers = registry.ordered.value
      .filter((item) => !item.disabled && item.element)
      .map((item) => item.element!);
    const current = triggers.indexOf(event.currentTarget as HTMLElement);
    if (current === -1) return;

    let next: number;
    switch (event.key) {
      case vertical ? 'ArrowDown' : 'ArrowRight':
        next = current + 1;
        break;
      case vertical ? 'ArrowUp' : 'ArrowLeft':
        next = current - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = triggers.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    if (loop()) next = (next + triggers.length) % triggers.length;
    triggers[Math.min(Math.max(next, 0), triggers.length - 1)].focus();
  }

  const state = computed<AccordionState>(() => ({ disabled: disabled(), orientation: orientation() }));
  const rootProps = computed(() => ({ ...dataAttrs(state.value), 'data-part': 'accordion' }));

  return { value, state, rootProps, isOpen, setOpen, disabled, registry, onTriggerKeydown };
}

export const { provideContext: provideAccordionContext, useContext: useAccordionContext } =
  createContext<UseAccordionReturn>('Accordion');

export interface UseAccordionItemOptions {
  /** Identifies the item in the root's value. Generated when omitted. */
  value?: MaybeRefOrGetter<AccordionValue | undefined>;
  disabled?: MaybeRefOrGetter<boolean | undefined>;
}

/** One item: a collapsible whose open state belongs to the accordion. */
export function useAccordionItem(options: UseAccordionItemOptions = {}): UseCollapsibleReturn {
  const accordion = useAccordionContext();
  const generatedValue = useId();
  const triggerId = useId();
  const trigger = ref<HTMLElement | null>(null);

  const value = computed(() => toValue(options.value) ?? generatedValue);
  const disabled = computed(() => accordion.disabled() || (toValue(options.disabled) ?? false));

  const collapsible = useCollapsible({
    open: () => accordion.isOpen(value.value),
    onChange: (open) => accordion.setOpen(value.value, open),
    disabled
  });

  watch(
    [value, disabled, trigger],
    ([current, isDisabled, element]) => {
      accordion.registry.register({ id: triggerId, value: current, disabled: isDisabled, element });
    },
    { immediate: true }
  );
  onScopeDispose(() => accordion.registry.unregister(triggerId));

  const triggerProps = computed(() => ({
    ...collapsible.triggerProps.value,
    'data-part': 'accordion-trigger',
    id: triggerId,
    ref: (el: unknown) => {
      trigger.value = (el as HTMLElement) ?? null;
    },
    onKeydown: accordion.onTriggerKeydown
  }));

  const panelProps = computed(() => ({
    ...collapsible.panelProps.value,
    'data-part': 'accordion-panel',
    role: 'region',
    'aria-labelledby': triggerId
  }));

  const rootProps = computed(() => ({ ...collapsible.rootProps.value, 'data-part': 'accordion-item' }));

  return { ...collapsible, rootProps, triggerProps, panelProps };
}
