import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, type Component } from 'vue';
import {
  Input,
  ToggleGroup,
  Toggle,
  CheckboxGroup,
  CheckboxRoot,
  SwitchRoot,
  RangeRoot,
  RangeControl,
  RangeThumb,
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  TabsRoot,
  TabsList,
  TabsTab,
  CollapsibleRoot,
  CollapsibleTrigger,
  DialogRoot,
  DialogTrigger,
  DrawerRoot,
  DrawerTrigger,
  PopoverRoot,
  PopoverTrigger,
  TooltipRoot,
  TooltipTrigger,
  MenuRoot,
  MenuTrigger,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  ContextMenuRoot,
  ContextMenuTrigger,
  SelectRoot,
  SelectTrigger,
  ComboboxRoot,
  ComboboxInput,
  DatepickerRoot,
  DatepickerTrigger,
  FloatingRoot
} from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  vi.restoreAllMocks();
});

/** `root` with a `v-model` (or `v-model:<prop>`) on `model`, which starts out as `initial`. */
function mountModel<T>(
  root: Component,
  initial: T,
  props: Record<string, unknown> = {},
  children?: (state: any) => unknown,
  prop = 'modelValue'
) {
  const model = ref<T>(initial);
  const writes: unknown[] = [];
  const Host = defineComponent({
    setup() {
      return () =>
        h(
          root as any,
          {
            ...props,
            [prop]: model.value,
            [`onUpdate:${prop}`]: (value: T) => {
              writes.push(value);
              model.value = value;
            }
          },
          children
        );
    }
  });
  wrapper = mount(Host, { attachTo: document.body });
  return { model, writes };
}

const toggles = () =>
  ['a', 'b'].map((value) => h(Toggle as any, { value, class: `toggle-${value}` }, { default: () => value }));
const pressed = () => [...document.querySelectorAll('[aria-pressed="true"]')].map((el) => el.textContent);
const input = () => document.querySelector('input')!;

describe('v-model on a ref that starts out undefined', () => {
  it('is controlled, so a value set later shows, without a warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { model } = mountModel(ToggleGroup, undefined as string[] | undefined, { multiple: true }, toggles);
    expect(pressed()).toEqual([]);

    model.value = ['b'];
    await nextTick();
    expect(pressed()).toEqual(['b']);

    model.value = undefined;
    await nextTick();
    expect(pressed()).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('shows text set later in an input', async () => {
    const { model } = mountModel(Input, undefined as string | undefined);
    expect(input().value).toBe('');

    model.value = 'abc';
    await nextTick();
    expect(input().value).toBe('abc');
  });

  const part = (component: Component, props: Record<string, unknown> = {}) => () => h(component as any, props);
  const attr = (selector: string, name: string) => () => document.querySelector(selector)?.getAttribute(name) ?? null;
  const has = (selector: string, name: string) => () => document.querySelector(selector)?.hasAttribute(name) ?? false;
  // A menu's items, inside an open menu: the attrs are the item's own, so its model stays bound.
  const inMenu = (item: Component): Component => (_, { attrs, slots }) =>
    h(MenuRoot as any, { open: true }, () => h(item as any, attrs, slots));
  // Roots whose trigger shows nothing of it hand `open` to their slot.
  const slotOpen = (state: { open: boolean }) => h('output', String(state.open));
  const readSlot = () => document.querySelector('output')?.textContent ?? null;

  // [root, prop, a value to set, its children, what shows it, the reading while empty, then once set]
  const ROOTS: [string, Component, string, unknown, (state: any) => unknown, () => unknown, unknown, unknown][] = [
    ['CheckboxRoot', CheckboxRoot, 'modelValue', true, () => null, attr('[role="checkbox"]', 'aria-checked'), 'false', 'true'],
    ['SwitchRoot', SwitchRoot, 'modelValue', true, () => null, attr('[role="switch"]', 'aria-checked'), 'false', 'true'],
    ['Toggle', Toggle, 'modelValue', true, () => 'b', attr('[aria-pressed]', 'aria-pressed'), 'false', 'true'],
    [
      'RangeRoot',
      RangeRoot,
      'modelValue',
      40,
      () => h(RangeControl as any, () => h(RangeThumb as any)),
      () => document.querySelector<HTMLInputElement>('input[type="range"]')?.value,
      '0',
      '40'
    ],
    [
      'AccordionRoot',
      AccordionRoot,
      'modelValue',
      ['a'],
      () => h(AccordionItem as any, { value: 'a' }, () => h(AccordionHeader as any, () => h(AccordionTrigger as any, () => 'A'))),
      attr('[aria-expanded]', 'aria-expanded'),
      'false',
      'true'
    ],
    [
      'TabsRoot',
      TabsRoot,
      'modelValue',
      'b',
      () => h(TabsList as any, () => ['a', 'b'].map((value) => h(TabsTab as any, { value }, () => value))),
      () => document.querySelector('[role="tab"][aria-selected="true"]')?.textContent ?? null,
      'a',
      'b'
    ],
    ['CollapsibleRoot', CollapsibleRoot, 'open', true, part(CollapsibleTrigger), attr('[aria-expanded]', 'aria-expanded'), 'false', 'true'],
    ['DialogRoot', DialogRoot, 'open', true, part(DialogTrigger), attr('[aria-expanded]', 'aria-expanded'), 'false', 'true'],
    ['DrawerRoot', DrawerRoot, 'open', true, part(DrawerTrigger), attr('[aria-expanded]', 'aria-expanded'), 'false', 'true'],
    ['PopoverRoot', PopoverRoot, 'open', true, part(PopoverTrigger), attr('[aria-expanded]', 'aria-expanded'), 'false', 'true'],
    ['TooltipRoot', TooltipRoot, 'open', true, part(TooltipTrigger), has('button', 'data-open'), false, true],
    ['MenuRoot', MenuRoot, 'open', true, part(MenuTrigger), attr('[aria-expanded]', 'aria-expanded'), 'false', 'true'],
    ['ContextMenuRoot', ContextMenuRoot, 'open', true, slotOpen, readSlot, 'false', 'true'],
    ['SelectRoot', SelectRoot, 'open', true, part(SelectTrigger), attr('[aria-expanded]', 'aria-expanded'), 'false', 'true'],
    ['ComboboxRoot', ComboboxRoot, 'open', true, part(ComboboxInput), attr('[aria-expanded]', 'aria-expanded'), 'false', 'true'],
    ['DatepickerRoot', DatepickerRoot, 'open', true, part(DatepickerTrigger), attr('[aria-expanded]', 'aria-expanded'), 'false', 'true'],
    ['FloatingRoot', FloatingRoot, 'open', true, slotOpen, readSlot, 'false', 'true'],
    ['MenuCheckboxItem', inMenu(MenuCheckboxItem), 'modelValue', true, () => 'Bold', attr('[role="menuitemcheckbox"]', 'aria-checked'), 'false', 'true'],
    [
      'MenuRadioGroup',
      inMenu(MenuRadioGroup),
      'modelValue',
      'b',
      () => ['a', 'b'].map((value) => h(MenuRadioItem as any, { value }, () => value)),
      () => document.querySelector('[role="menuitemradio"][aria-checked="true"]')?.textContent ?? null,
      null,
      'b'
    ]
  ];

  it.each(ROOTS)('%s takes it as controlled, so a value set later shows', async (_, root, prop, value, children, read, empty, set) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { model } = mountModel(root, undefined as unknown, {}, children, prop);
    await nextTick();
    expect(read()).toEqual(empty);

    model.value = value;
    await nextTick();
    expect(read()).toEqual(set);
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('uncontrolled to controlled'));
  });

  it('still warns when a value turns up on a component nothing bound', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const value = ref<string | undefined>(undefined);
    const bound = ref(false);
    const Host = defineComponent({
      setup: () => () => h(Input as any, bound.value ? { modelValue: value.value } : {})
    });
    wrapper = mount(Host, { attachTo: document.body });

    value.value = 'abc';
    bound.value = true;
    await nextTick();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('uncontrolled to controlled'));
  });
});

describe('v-model.optional', () => {
  const optional = { modelModifiers: { optional: true } };

  it('writes undefined once the last toggle comes up', async () => {
    const { writes } = mountModel(ToggleGroup, undefined, { multiple: true, ...optional }, toggles);
    document.querySelector<HTMLElement>('.toggle-a')!.click();
    await nextTick();
    document.querySelector<HTMLElement>('.toggle-a')!.click();
    await nextTick();

    expect(writes).toEqual([['a'], undefined]);
  });

  it('writes undefined for a single group with nothing pressed', async () => {
    const { writes } = mountModel(ToggleGroup, 'a', optional, toggles);
    document.querySelector<HTMLElement>('.toggle-a')!.click();
    await nextTick();

    expect(writes).toEqual([undefined]);
  });

  it('writes undefined once the input is emptied', async () => {
    const { writes } = mountModel(Input, 'a', optional);
    input().value = '';
    input().dispatchEvent(new Event('input'));
    await nextTick();

    expect(writes).toEqual([undefined]);
  });

  it('writes undefined once the last checkbox is unticked', async () => {
    const { writes } = mountModel(CheckboxGroup, ['a'], optional, () => [h(CheckboxRoot as any, { value: 'a' })]);
    document.querySelector<HTMLElement>('[role="checkbox"]')!.click();
    await nextTick();

    expect(writes).toEqual([undefined]);
  });

  it('leaves a value that is not empty alone, and an empty one without the modifier', async () => {
    const { writes } = mountModel(ToggleGroup, undefined, { multiple: true }, toggles);
    document.querySelector<HTMLElement>('.toggle-a')!.click();
    await nextTick();
    document.querySelector<HTMLElement>('.toggle-a')!.click();
    await nextTick();

    expect(writes).toEqual([['a'], []]);
  });
});
