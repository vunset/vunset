import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  useId,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type WritableComputedRef
} from 'vue';
import { createContext } from '../../shared/context';
import { isPropBound, useControlled } from '../../shared/use-controlled';
import { dataAttrs } from '../../shared/data-attrs';
import { useRovingFocus, type Orientation } from '../../shared/use-roving-focus';
import { useOptionalGroupContext } from '../group/Group.vue';
import { useRovingItems, type RovingItem } from '../../shared/use-roving-items';
import { useFieldValue, useOptionalFieldContext } from '../../shared/use-field';

/** What identifies a toggle inside a group. */
export type ToggleValue = string | number;

/** Any button carrying a pressed state is an item of the group. */
const TOGGLE_SELECTOR = '[aria-pressed]';

export interface ToggleState {
  /**
   * Whether the toggle is on.
   * @attribute `data-pressed` while on, `data-unpressed` while off
   */
  pressed: boolean;
  /** Whether the toggle ignores user interaction. */
  disabled: boolean;
  /** Whether its group's value is invalid. */
  invalid: boolean;
}

export interface UseToggleOptions {
  /** The pressed state. Supplying this makes it controlled. */
  pressed?: MaybeRefOrGetter<boolean | undefined>;
  /** The initial pressed state while uncontrolled. @default false */
  defaultPressed?: MaybeRefOrGetter<boolean | undefined>;
  /** Whether the toggle ignores user interaction. Also read from a group. */
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  /**
   * Identifies the toggle within a `useToggleGroup`, which then owns the
   * pressed state. Required there, and ignored outside one.
   */
  value?: MaybeRefOrGetter<ToggleValue | undefined>;
  /** Called whenever the pressed state changes. */
  onChange?: (pressed: boolean, event?: Event) => void;
}

export interface UseToggleReturn {
  /** The pressed state. Writable — assign to it to toggle programmatically. */
  pressed: WritableComputedRef<boolean>;
  state: ComputedRef<ToggleState>;
  /** Bind to the button. Carries the `data-*` hooks. */
  rootProps: ComputedRef<Record<string, unknown>>;
  /** Flips the toggle, respecting `disabled`. */
  toggle: (event?: Event) => void;
}

export function useToggle(options: UseToggleOptions = {}): UseToggleReturn {
  const group = useOptionalToggleGroupContext();
  const id = useId();
  const element = ref<HTMLElement | null>(null);

  const value = computed(() => toValue(options.value));
  const disabled = computed(() => (toValue(options.disabled) ?? false) || (group?.state.value.disabled ?? false));

  const own = useControlled<boolean>({
    value: () => toValue(options.pressed),
    defaultValue: () => toValue(options.defaultPressed) ?? false,
    prop: 'modelValue',
    empty: false,
    name: 'useToggle',
    label: 'pressed'
  });

  if (process.env.NODE_ENV !== 'production' && group) {
    watch(
      value,
      (current) => {
        if (current === undefined) {
          console.warn(
            '[useToggle] A toggle inside a toggle group needs a `value`. Without one the ' +
              'group cannot tell it apart from its siblings, and it will never look pressed.'
          );
        }
      },
      { immediate: true }
    );
  }

  const pressed = computed<boolean>({
    get: () => (group ? value.value !== undefined && group.isPressed(value.value) : own.value),
    set(next) {
      if (group) {
        if (value.value !== undefined) {
          group.setPressed(value.value, next);
        }
        return;
      }
      own.value = next;
    }
  });

  if (group) {
    watch(
      [value, disabled, element],
      ([currentValue, isDisabled, currentElement]) => {
        if (currentValue === undefined) return;

        group.register({
          id,
          value: currentValue,
          disabled: isDisabled,
          element: currentElement
        });
      },
      { immediate: true }
    );

    onScopeDispose(() => group.unregister(id));
  }

  function toggle(event?: Event): void {
    if (disabled.value) return;

    const next = !pressed.value;
    pressed.value = next;
    options.onChange?.(next, event);
  }

  const state = computed<ToggleState>(() => ({
    pressed: pressed.value,
    disabled: disabled.value,
    invalid: group?.state.value.invalid ?? false
  }));

  const hooks = computed(() =>
    dataAttrs(state.value, {
      pressed: (on) => (on ? { 'data-pressed': '' } : { 'data-unpressed': '' })
    })
  );

  const rootProps = computed(() => ({
    ...hooks.value,
    'data-part': 'toggle',
    ref: setElement,
    type: 'button',
    disabled: disabled.value || undefined,
    'aria-pressed': pressed.value,
    tabindex: group ? (group.tabbableValue.value === value.value ? 0 : -1) : undefined,
    onClick(event: MouseEvent) {
      toggle(event);
    },
    onFocus() {
      if (group && value.value !== undefined) {
        group.highlight(value.value);
      }
    }
  }));

  function setElement(next: unknown): void {
    element.value = (next as HTMLElement) ?? null;
  }

  return { pressed, state, rootProps, toggle };
}

export interface ToggleGroupState {
  /** Whether every toggle in the group ignores user interaction. */
  disabled: boolean;
  /** Whether a toggle must be pressed: one always is with the group's own `required`; a field's is only announced. */
  required: boolean;
  /** Whether the value is invalid. */
  invalid: boolean;
  /** Whether more than one toggle can be pressed at a time. */
  multiple: boolean;
  /** Which arrow keys move between the toggles. */
  orientation: Orientation;
}

/** One value while single, an array while `multiple`. */
export type ToggleGroupValue = ToggleValue | ToggleValue[] | null;

export interface UseToggleGroupOptions {
  /** The pressed toggles. Supplying this makes the value controlled. */
  value?: MaybeRefOrGetter<ToggleGroupValue | undefined>;
  /** The initially pressed toggles while uncontrolled. */
  defaultValue?: MaybeRefOrGetter<ToggleGroupValue | undefined>;
  /**
   * Whether more than one toggle can be pressed. The value follows: one value
   * (or `null`) while single, an array while multiple.
   *
   * @default false
   */
  multiple?: MaybeRefOrGetter<boolean | undefined>;
  /**
   * Whether the group always holds a value: the last pressed toggle refuses to
   * come up, and an uncontrolled group with nothing pressed presses its first
   * enabled toggle rather than starting in a state it forbids.
   *
   * This is a segmented control — one of these is the answer — rather than a
   * set of independent switches. Note that it only constrains what the group
   * does; a controlled value is still whatever its owner sets, empty included.
   *
   * @default false
   */
  required?: MaybeRefOrGetter<boolean | undefined>;
  /** Whether every toggle in the group ignores user interaction. Also read from a surrounding field. */
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  /** Whether the value is invalid. Also read from a surrounding field. */
  invalid?: MaybeRefOrGetter<boolean | undefined>;
  /** The form field name each pressed toggle's value is submitted under. Also read from a surrounding field. */
  name?: MaybeRefOrGetter<string | undefined>;
  /** The id of a `<form>` to submit with. */
  form?: MaybeRefOrGetter<string | undefined>;
  /** @default 'horizontal' */
  orientation?: MaybeRefOrGetter<Orientation | undefined>;
  /** Wrap around at the ends of the group. @default true, or `false` inside a toolbar */
  loop?: MaybeRefOrGetter<boolean | undefined>;
  /** Called whenever the pressed toggles change. */
  onChange?: (value: ToggleGroupValue) => void;
}

export interface UseToggleGroupReturn {
  /** The pressed toggles, shaped by `multiple`. Writable. */
  value: WritableComputedRef<ToggleGroupValue>;
  /** The pressed values, always as an array, whatever `multiple` says. */
  pressedValues: ComputedRef<ToggleValue[]>;
  state: ComputedRef<ToggleGroupState>;
  /** Bind to the element wrapping the toggles. Owns the arrow keys. */
  rootProps: ComputedRef<Record<string, unknown>>;
  /** One hidden input per pressed toggle, while there's a name. */
  hiddenInputs: ComputedRef<Array<{ name: string; value: string; form: string | undefined }>>;
  isPressed: (value: ToggleValue) => boolean;
  /** Presses or unpresses one toggle, applying the single/multiple rule. */
  setPressed: (value: ToggleValue, pressed: boolean) => void;

  // Shared with `useToggle`, which is how a toggle finds its own state.
  /** @internal */ register: (item: {
    id: string;
    value: ToggleValue;
    disabled: boolean;
    element: HTMLElement | null;
  }) => void;
  /** @internal */ unregister: (id: string) => void;
  /** @internal */ highlight: (value: ToggleValue) => void;
  /** @internal */ tabbableValue: Ref<ToggleValue | undefined>;
}

export function useToggleGroup(options: UseToggleGroupOptions = {}): UseToggleGroupReturn {
  const field = useOptionalFieldContext();
  const multiple = () => toValue(options.multiple) ?? false;
  // The group's own `required` keeps one on; a field's is only announced.
  const required = () => toValue(options.required) ?? false;
  const announcedRequired = () => required() || (field?.required() ?? false);
  const disabled = () => (toValue(options.disabled) ?? false) || (field?.state.value.disabled ?? false);
  const invalid = () => (toValue(options.invalid) ?? false) || (field?.state.value.invalid ?? false);

  const controlled = isPropBound('modelValue');
  const orientation = () => toValue(options.orientation) ?? 'horizontal';
  // In a toolbar the arrows past either end are the toolbar's, so it doesn't wrap.
  const group = useOptionalGroupContext();
  const inToolbar = () => group?.state.value.variant === 'toolbar';
  const loop = () => toValue(options.loop) ?? !inToolbar();

  const element = ref<HTMLElement | null>(null);

  const value = useControlled<ToggleGroupValue>({
    value: () => toValue(options.value),
    defaultValue: () => toValue(options.defaultValue) ?? (multiple() ? [] : null),
    prop: 'modelValue',
    empty: () => (multiple() ? [] : null),
    onChange: options.onChange,
    name: 'useToggleGroup',
    label: 'value'
  });

  const pressedValues = computed<ToggleValue[]>(() => {
    const current = value.value;
    if (current == null) return [];
    return Array.isArray(current) ? current : [current];
  });

  // The tab stop starts on the pressed toggle, the first in order when several are.
  const registry: ReturnType<typeof useRovingItems<ToggleValue>> = useRovingItems<ToggleValue>({
    preferred: () => registry.ordered.value.find((item) => pressedValues.value.includes(item.value))?.value
  });

  let warnedAboutEmpty = false;

  function register(item: RovingItem<ToggleValue>): void {
    registry.register(item);

    if (!required() || item.disabled || pressedValues.value.length > 0) return;

    if (!controlled) {
      value.value = multiple() ? [item.value] : item.value;
      return;
    }

    if (process.env.NODE_ENV !== 'production' && !warnedAboutEmpty) {
      warnedAboutEmpty = true;
      console.warn(
        '[useToggleGroup] `required` cannot press a toggle for you here: the value is ' +
          'controlled and empty, and only its owner can change it. Give the bound ref a ' +
          'starting value, or drop the binding and use `defaultValue`, which is ignored ' +
          'while controlled.'
      );
    }
  }

  function isPressed(candidate: ToggleValue): boolean {
    return pressedValues.value.includes(candidate);
  }

  function setPressed(candidate: ToggleValue, pressed: boolean): void {
    if (disabled()) return;

    const current = pressedValues.value;
    let next: ToggleValue[];

    if (multiple()) {
      next = pressed ? [...current, candidate] : current.filter((entry) => entry !== candidate);
    } else {
      next = pressed ? [candidate] : [];
    }

    if (required() && next.length === 0) return;

    value.value = multiple() ? next : (next[0] ?? null);
  }

  const state = computed<ToggleGroupState>(() => ({
    disabled: disabled(),
    required: announcedRequired(),
    invalid: invalid(),
    multiple: multiple(),
    orientation: orientation()
  }));

  useFieldValue(field, () => value.value);
  watch(() => pressedValues.value.length > 0, (filled) => field?.setFilled(filled), { immediate: true });

  const hiddenInputs = computed(() => {
    const name = toValue(options.name) ?? field?.name();
    if (!name) return [];

    const form = toValue(options.form);
    return pressedValues.value.map((entry) => ({ name, value: String(entry), form }));
  });

  const hooks = computed(() => dataAttrs(state.value));

  const roving = useRovingFocus({
    container: element,
    itemSelector: TOGGLE_SELECTOR,
    orientation,
    loop
  });

  const rootProps = computed(() => ({
    ...hooks.value,
    'data-part': 'toggle-group',
    ref: setElement,
    role: 'group',
    'aria-labelledby': field?.labelledBy.value,
    'aria-describedby': field?.describedBy.value,
    'aria-required': announcedRequired() || undefined,
    'aria-invalid': invalid() || undefined,
    onKeydown(event: KeyboardEvent) {
      if (inToolbar() && !loop() && pastEnd(event.key)) return;
      roving.onKeydown(event);
    },
    onFocusin: () => field?.setFocused(true),
    // Touched once focus leaves the group, not when it moves between toggles.
    onFocusout(event: FocusEvent) {
      const next = event.relatedTarget;
      if (next instanceof Node && element.value?.contains(next)) return;

      field?.setFocused(false);
      field?.setTouched(true);
    }
  }));

  function pastEnd(key: string): boolean {
    const vertical = orientation() === 'vertical';
    const index = roving.currentIndex();
    if (key === (vertical ? 'ArrowDown' : 'ArrowRight')) return index === roving.items().length - 1;
    if (key === (vertical ? 'ArrowUp' : 'ArrowLeft')) return index === 0;
    return false;
  }

  function setElement(next: unknown): void {
    element.value = (next as HTMLElement) ?? null;
  }

  return {
    value,
    pressedValues,
    state,
    rootProps,
    hiddenInputs,
    isPressed,
    setPressed,
    register,
    unregister: registry.unregister,
    highlight: registry.highlight,
    tabbableValue: registry.tabbableValue
  };
}

export const {
  provideContext: provideToggleGroupContext,
  useContext: useToggleGroupContext,
  useOptionalContext: useOptionalToggleGroupContext
} = createContext<UseToggleGroupReturn>('ToggleGroup');
