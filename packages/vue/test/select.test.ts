import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectClear,
  SelectIndicator,
  Positioner,
  Popup,
  SelectSearch,
  SelectList,
  SelectItem,
  SelectEmpty,
  Addon,
  SelectScrollIndicator,
  SelectPresets,
  Portal,
  FieldRoot,
  FieldLabel,
  FieldDescription
} from '../src';
import { setLayout, resetLayout } from './layout';

const OPTIONS = [
  {
    label: 'Europe',
    options: [
      { value: 'pl', label: 'France' },
      { value: 'de', label: 'Germany', disabled: true },
      { value: 'es', label: 'Spain' }
    ]
  },
  { value: 'us', label: 'United States' }
];

interface Chrome {
  placeholder?: string;
  emptyText?: string;
  popupClass?: string;
  portal?: boolean;
  arrows?: boolean;
  optionSlot?: (option: any) => any;
  /** The list's default slot: rows the caller renders. */
  listSlot?: (props: any) => any;
  presets?: boolean;
}

/**
 * The parts, assembled the way a caller would. The Host re-emits so
 * `wrapper.emitted()` still reports what the root emitted.
 */
function mountSelect(props: Record<string, any> = {}, chrome: Chrome = {}) {
  const Host = defineComponent({
    emits: ['update:modelValue', 'update:open'],
    setup(_, { emit }) {
      return () =>
        h(
          SelectRoot as any,
          {
            options: OPTIONS,
            ...props,
            'onUpdate:modelValue': (value: any) => emit('update:modelValue', value),
            'onUpdate:open': (value: any) => emit('update:open', value)
          },
          () => [
            h(SelectTrigger as any, null, () => [
              h(SelectValue as any, { placeholder: chrome.placeholder }),
              h(SelectClear as any, null, () => '\u2297'),
              h(SelectIndicator as any, null, () => '\u25be')
            ]),
            h(Portal as any, { disabled: chrome.portal === false }, () => [
              h(Positioner as any, null, () => [
                h(Popup as any, { class: chrome.popupClass }, () => [
                  props.searchable ? h(SelectSearch as any) : null,
                  chrome.presets ? h(SelectPresets as any, null, { replace: () => 'replace' }) : null,
                  chrome.arrows ? h(SelectScrollIndicator as any, { direction: 'up' }) : null,
                  h(SelectList as any, null, {
                    ...(chrome.optionSlot ? { option: chrome.optionSlot } : {}),
                    ...(chrome.listSlot ? { default: chrome.listSlot } : {})
                  }),
                  chrome.arrows ? h(SelectScrollIndicator as any, { direction: 'down' }) : null,
                  h(SelectEmpty as any, null, () => chrome.emptyText ?? 'No matches')
                ])
              ])
            ])
          ]
        );
    }
  });
  return mount(Host, { attachTo: document.body });
}

const trigger = () => document.querySelector<HTMLElement>('[data-part="trigger"]')!;
const listbox = () => document.querySelector<HTMLElement>('[role="listbox"]');
const optionEls = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')];
const labeled = (text: string) => optionEls().find((el) => el.textContent?.trim() === text)!;
const chips = () => [...document.querySelectorAll<HTMLElement>('[data-part="chip"]')];
const search = () => document.querySelector<HTMLInputElement>('[data-part="search"]');
const valueText = () =>
  document.querySelector<HTMLElement>('[data-part="value"]')!.textContent!.replace(/\s+/g, ' ').trim();

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

async function open() {
  trigger().dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await settle();
}

const key = (target: EventTarget, k: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

describe('Select', () => {
  describe('bare options', () => {
    it('reads a string or a number as its own value and label', async () => {
      mountSelect({ options: ['Red', 'Green', 10] });
      await open();

      expect(optionEls().map((el) => el.textContent!.trim())).toEqual(['Red', 'Green', '10']);
    });

    it('selects one, and names it on the trigger', async () => {
      const wrapper = mountSelect({ options: ['Red', 'Green'] });
      await open();

      labeled('Green').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();

      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Green']);
      expect(valueText()).toBe('Green');
    });

    it('resolves a value it was given against them', async () => {
      mountSelect({ options: [10, 20, 50], modelValue: 20 });
      await nextTick();

      expect(valueText()).toBe('20');
    });

    it('mixes with options that are written out in full', async () => {
      mountSelect({ options: ['Red', { value: 'g', label: 'Green' }] });
      await open();

      expect(optionEls().map((el) => el.textContent!.trim())).toEqual(['Red', 'Green']);
    });

    it('takes them inside a group too', async () => {
      mountSelect({ options: [{ label: 'Warm', options: ['Red', 'Orange'] }] });
      await open();

      expect(optionEls().map((el) => el.textContent!.trim())).toEqual(['Red', 'Orange']);
      expect(document.querySelector('[data-part="group-label"]')!.textContent!.trim()).toBe('Warm');
    });

    it('keys them by `valueKey` when one is set', async () => {
      const wrapper = mountSelect({ options: ['Red'], valueKey: 'id' });
      await open();

      labeled('Red').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();

      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Red']);
    });
  });

  describe('structure', () => {
    it('advertises the listbox it controls', () => {
      mountSelect();
      expect(trigger().getAttribute('role')).toBe('combobox');
      expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(listbox()).toBeNull();
    });

    it('opens on click and points aria-controls at the listbox', async () => {
      mountSelect();
      await open();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(trigger().getAttribute('aria-controls')).toBe(listbox()!.id);
      expect(optionEls()).toHaveLength(4);
    });

    it('shows the placeholder until something is chosen', async () => {
      mountSelect({}, { placeholder: 'Pick one' });
      expect(valueText()).toBe('Pick one');
      await open();
      labeled('France').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
      expect(valueText()).toBe('France');
    });

    it('labels a group and leaves a loose run out of the accessibility tree', async () => {
      mountSelect();
      await open();
      const groups = [...document.querySelectorAll('[data-part="group"]')];
      expect(groups[0].getAttribute('role')).toBe('group');
      expect(groups[0].getAttribute('aria-labelledby')).toBe(document.querySelector('[data-part="group-label"]')!.id);
      // A listbox owns options and groups; a bare wrapper would break that.
      expect(groups[1].getAttribute('role')).toBe('none');
    });

    it('renders a hidden input per selection for the form', async () => {
      mountSelect({ name: 'country', multiple: true, defaultValue: ['pl', 'us'] });
      await nextTick();
      const inputs = [...document.querySelectorAll<HTMLInputElement>('input[type="hidden"]')];
      expect(inputs.map((el) => el.value)).toEqual(['pl', 'us']);
      expect(inputs.every((el) => el.name === 'country')).toBe(true);
    });
  });

  describe('single select', () => {
    it('emits the chosen value and closes', async () => {
      const w = mountSelect();
      await open();
      labeled('Spain').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();

      expect(w.emitted('update:modelValue')).toEqual([['es']]);
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('marks the chosen option selected', async () => {
      mountSelect({ defaultValue: 'es' });
      await open();
      expect(labeled('Spain').getAttribute('aria-selected')).toBe('true');
      expect(labeled('France').getAttribute('aria-selected')).toBe('false');
    });

    it('clears back to nothing', async () => {
      const w = mountSelect({ defaultValue: 'es' });
      await nextTick();
      document
        .querySelector<HTMLElement>('[data-part="clear"]')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();
      expect(w.emitted('update:modelValue')).toEqual([[null]]);
    });

    it('offers no clear control while nothing is chosen', () => {
      mountSelect();
      expect(document.querySelector('[data-part="clear"]')).toBeNull();
    });
  });

  describe('disabled options', () => {
    it('marks them and refuses the click', async () => {
      const w = mountSelect();
      await open();
      expect(labeled('Germany').getAttribute('aria-disabled')).toBe('true');

      labeled('Germany').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
      expect(w.emitted('update:modelValue')).toBeUndefined();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('steps over them with the arrow keys', async () => {
      mountSelect();
      await open();
      expect(trigger().getAttribute('aria-activedescendant')).toBe(labeled('France').id);
      key(trigger(), 'ArrowDown');
      await nextTick();
      // Germany sits between the two and is skipped.
      expect(trigger().getAttribute('aria-activedescendant')).toBe(labeled('Spain').id);
    });
  });

  describe('keyboard', () => {
    it('opens on ArrowDown and starts on the first option', async () => {
      mountSelect();
      key(trigger(), 'ArrowDown');
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(labeled('France').id);
    });

    it('opens on Enter', async () => {
      mountSelect();
      key(trigger(), 'Enter');
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('opens on the selected option rather than the first', async () => {
      mountSelect({ defaultValue: 'us' });
      await open();
      expect(trigger().getAttribute('aria-activedescendant')).toBe(labeled('United States').id);
    });

    it('takes the active option on Enter', async () => {
      const w = mountSelect();
      await open();
      key(trigger(), 'ArrowDown');
      await nextTick();
      key(trigger(), 'Enter');
      await settle();
      expect(w.emitted('update:modelValue')).toEqual([['es']]);
    });

    it('closes on Escape', async () => {
      mountSelect();
      await open();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('wraps at the end when looping', async () => {
      mountSelect();
      await open();
      key(trigger(), 'End');
      await nextTick();
      expect(trigger().getAttribute('aria-activedescendant')).toBe(labeled('United States').id);
      key(trigger(), 'ArrowDown');
      await nextTick();
      expect(trigger().getAttribute('aria-activedescendant')).toBe(labeled('France').id);
    });

    it('jumps by typeahead when there is no search box', async () => {
      mountSelect();
      await open();
      trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'u', bubbles: true }));
      await nextTick();
      expect(trigger().getAttribute('aria-activedescendant')).toBe(labeled('United States').id);
    });
  });

  /**
   * jsdom performs no layout, so a list never overflows and nothing here would
   * run. These give one element the geometry of a scroller — a viewport shorter
   * than its content, and a `scrollTop` that clamps — so the real code paths
   * execute against plausible numbers.
   */
  describe('scrolling', () => {
    const rectOf = (top: number, height: number) =>
      ({
        top,
        bottom: top + height,
        height,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: top,
        toJSON: () => ({})
      }) as DOMRect;

    const CLIENT = 100;
    const CONTENT = 400;

    function makeScrollable() {
      const list = listbox()!;
      let top = 0;
      Object.defineProperty(list, 'clientHeight', { configurable: true, get: () => CLIENT });
      Object.defineProperty(list, 'scrollHeight', { configurable: true, get: () => CONTENT });
      Object.defineProperty(list, 'scrollTop', {
        configurable: true,
        get: () => top,
        set: (next: number) => {
          top = Math.max(0, Math.min(next, CONTENT - CLIENT));
        }
      });
      Object.defineProperty(list, 'getBoundingClientRect', {
        configurable: true,
        value: () => rectOf(0, CLIENT)
      });
      return list;
    }

    /** Every option half off the bottom edge, so any reveal would scroll. */
    function clipOptions() {
      for (const el of optionEls()) {
        Object.defineProperty(el, 'getBoundingClientRect', {
          configurable: true,
          value: () => rectOf(CLIENT - 10, 32)
        });
      }
    }

    function pointerMove(target: EventTarget, movement: number) {
      const event = new PointerEvent('pointermove', { bubbles: true });
      Object.defineProperty(event, 'movementY', { value: movement });
      Object.defineProperty(event, 'movementX', { value: 0 });
      target.dispatchEvent(event);
    }

    const arrow = (direction: 'up' | 'down') =>
      document.querySelector<HTMLElement>(`[data-part="scroll"][data-direction="${direction}"]`);

    it('does not scroll the list when the pointer moves over an option', async () => {
      // The loop this guards: revealing a half-clipped row slides the list
      // under a stationary cursor, which puts another half-clipped row under
      // it, which reveals again.
      mountSelect();
      await open();
      const list = makeScrollable();
      clipOptions();

      pointerMove(labeled('Spain'), 4);
      await nextTick();
      expect(list.scrollTop).toBe(0);
    });

    it('still reveals an option the keyboard moves to', async () => {
      mountSelect();
      await open();
      const list = makeScrollable();
      clipOptions();

      key(trigger(), 'ArrowDown');
      await nextTick();
      expect(list.scrollTop).toBeGreaterThan(0);
    });

    it('ignores a pointer event that reports no movement', async () => {
      // Scrolling fires `pointermove` at a cursor that never moved. Acting on
      // those makes the highlight chase the wheel.
      mountSelect();
      await open();
      const before = trigger().getAttribute('aria-activedescendant');

      pointerMove(labeled('Spain'), 0);
      await nextTick();
      expect(trigger().getAttribute('aria-activedescendant')).toBe(before);

      pointerMove(labeled('Spain'), 3);
      await nextTick();
      expect(trigger().getAttribute('aria-activedescendant')).toBe(labeled('Spain').id);
    });

    it('offers an arrow only towards content there is', async () => {
      mountSelect({}, { arrows: true });
      await open();
      const list = makeScrollable();

      list.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(arrow('up')).toBeNull();
      expect(arrow('down')).not.toBeNull();

      list.scrollTop = 150;
      list.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(arrow('up')).not.toBeNull();
      expect(arrow('down')).not.toBeNull();

      list.scrollTop = CONTENT;
      list.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(arrow('up')).not.toBeNull();
      expect(arrow('down')).toBeNull();
    });

    it('scrolls while the pointer rests on an arrow, and stops when it leaves', async () => {
      mountSelect({}, { arrows: true });
      await open();
      const list = makeScrollable();
      list.dispatchEvent(new Event('scroll'));
      await nextTick();

      arrow('down')!.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
      await settle();
      const moved = list.scrollTop;
      expect(moved).toBeGreaterThan(0);

      arrow('down')!.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
      await settle();
      expect(list.scrollTop).toBe(moved);
    });

    it('does nothing on touch, where there is no hovering', async () => {
      mountSelect({}, { arrows: true });
      await open();
      const list = makeScrollable();
      list.dispatchEvent(new Event('scroll'));
      await nextTick();

      arrow('down')!.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, pointerType: 'touch' }));
      await settle();
      expect(list.scrollTop).toBe(0);
    });
  });

  /**
   * One part, placed by hand, rather than a pair of named slots reimplemented
   * in every control that has room beside its value.
   */
  describe('slots', () => {
    const mountAdorned = (...slots: Array<'start' | 'end'>) => {
      const Host = defineComponent({
        setup: () => () =>
          h(SelectRoot as any, { options: OPTIONS }, () => [
            h(SelectTrigger as any, null, () => [
              slots.includes('start')
                ? h(Addon as any, { side: 'start' }, () => h('span', { class: 'flag' }, '@'))
                : null,
              h(SelectValue as any),
              slots.includes('end') ? h(Addon as any, { side: 'end' }, () => 'kg') : null
            ])
          ])
      });
      return mount(Host, { attachTo: document.body });
    };

    const sides = () => [...document.querySelectorAll('[data-part="addon"]')].map((el) => el.getAttribute('data-side'));

    it('marks which end each slot sits at', () => {
      mountAdorned('start', 'end');
      expect(sides()).toEqual(['start', 'end']);
    });

    it('renders only what was written', () => {
      mountAdorned('start');
      expect(sides()).toEqual(['start']);
    });

    it('renders nothing when none was written', () => {
      mountAdorned();
      expect(document.querySelectorAll('[data-part="addon"]')).toHaveLength(0);
    });

    it('keeps the slot inside the trigger, so pressing it still opens', async () => {
      mountAdorned('start');
      document.querySelector('.flag')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('takes control state from the trigger it sits in', () => {
      // The slot carries no context of its own: the surrounding part already
      // publishes the state, so there is nothing to duplicate.
      const Host = defineComponent({
        setup: () => () =>
          h(SelectRoot as any, { options: OPTIONS, disabled: true }, () => [
            h(SelectTrigger as any, null, {
              default: ({ disabled }: any) => [
                h(Addon as any, { side: 'start' }, () => h('span', { class: 'flag' }, String(disabled)))
              ]
            })
          ])
      });
      mount(Host, { attachTo: document.body });
      expect(document.querySelector('.flag')!.textContent).toBe('true');
    });
  });

  describe('multiple', () => {
    it('collects selections and stays open', async () => {
      const w = mountSelect({ multiple: true });
      await open();
      labeled('France').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();
      labeled('Spain').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();

      expect(w.emitted('update:modelValue')).toEqual([[['pl']], [['pl', 'es']]]);
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(listbox()!.getAttribute('aria-multiselectable')).toBe('true');
    });

    it('unchooses an option that is chosen again', async () => {
      const w = mountSelect({ multiple: true, defaultValue: ['pl', 'es'] });
      await open();
      labeled('France').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();
      expect(w.emitted('update:modelValue')).toEqual([[['es']]]);
    });

    it('names every selection when flatten is off', async () => {
      mountSelect({ multiple: true, defaultValue: ['pl', 'es'] });
      await nextTick();
      expect(valueText()).toBe('France, Spain');
    });

    // Chips belong to the combobox, where there is somewhere to type between
    // them. A select's trigger reports a value; it is not an editing surface.
    it('renders no chips', async () => {
      mountSelect({ multiple: true, defaultValue: ['pl', 'es'] });
      await nextTick();
      expect(chips()).toHaveLength(0);
    });

    it('names the first few and counts the rest', async () => {
      mountSelect({ multiple: true, flatten: 1, defaultValue: ['pl', 'es', 'us'] });
      await nextTick();
      expect(valueText()).toBe('France and 2 more');
    });

    it('names none of them when flatten is zero', async () => {
      mountSelect({ multiple: true, flatten: 0, defaultValue: ['pl', 'es', 'us'] });
      await nextTick();
      expect(valueText()).toBe('3 selected');
    });

    it('drops the count again when the selection falls below flatten', async () => {
      mountSelect({ multiple: true, flatten: 1, defaultValue: ['pl', 'es'] });
      await nextTick();
      expect(valueText()).toBe('France and 1 more');

      await open();
      labeled('Spain').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();
      expect(valueText()).toBe('France');
    });

    it('clears everything at once', async () => {
      const w = mountSelect({ multiple: true, defaultValue: ['pl', 'es'] });
      await nextTick();
      document
        .querySelector<HTMLElement>('[data-part="clear"]')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();
      expect(w.emitted('update:modelValue')).toEqual([[[]]]);
    });
  });

  // A route query is always a string; the options are often coded by number.
  describe('values from a URL', () => {
    const STATUSES = [
      { value: 1, label: 'Active' },
      { value: 0, label: 'Paused' }
    ];

    it('names the option a string value matches', async () => {
      mountSelect({ options: STATUSES, modelValue: '1' });
      await open();

      expect(valueText()).toBe('Active');
      expect(labeled('Active').getAttribute('aria-selected')).toBe('true');
    });

    it('does not match an empty string to 0', async () => {
      mountSelect({ options: STATUSES, modelValue: '' }, { placeholder: 'Status' });
      await open();

      expect(valueText()).toBe('Status');
      expect(labeled('Paused').getAttribute('aria-selected')).toBe('false');
    });

    it('unchooses a string value when its option is chosen again', async () => {
      const w = mountSelect({ options: STATUSES, multiple: true, defaultValue: ['1', '0'] });
      await open();
      labeled('Active').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();

      expect(w.emitted('update:modelValue')).toEqual([[['0']]]);
    });

    it('counts a preset active, and adds no repeats', async () => {
      const presets = [{ label: 'Both', values: [1, 0] }];
      const w = mountSelect({ options: STATUSES, multiple: true, presets, defaultValue: ['1'] }, { presets: true });
      await open();
      const both = document.querySelector<HTMLElement>('[data-part="preset"]')!;
      expect(both.getAttribute('aria-pressed')).toBe('false');

      both.click();
      await nextTick();
      expect(w.emitted('update:modelValue')).toEqual([[['1', 0]]]);
      expect(both.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('search', () => {
    it('focuses the search box and gives it the combobox role', async () => {
      mountSelect({ searchable: true });
      await open();
      expect(search()!.getAttribute('role')).toBe('combobox');
      expect(document.activeElement).toBe(search());
      // The trigger yields the role, so there is only ever one combobox.
      expect(trigger().getAttribute('role')).toBe('button');
    });

    it('narrows the list as it is typed into', async () => {
      mountSelect({ searchable: true });
      await open();
      search()!.value = 'fra';
      search()!.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();

      expect(optionEls().map((el) => el.textContent!.trim())).toEqual(['France']);
    });

    it('drops a group whose options all filter out', async () => {
      mountSelect({ searchable: true });
      await open();
      search()!.value = 'united';
      search()!.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();
      expect(document.querySelector('[data-part="group-label"]')).toBeNull();
    });

    it('says so when nothing matches', async () => {
      mountSelect({ searchable: true }, { emptyText: 'Nothing here' });
      await open();
      search()!.value = 'zzz';
      search()!.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();

      expect(optionEls()).toHaveLength(0);
      expect(document.querySelector('[data-part="empty"]')!.textContent!.trim()).toBe('Nothing here');
    });

    it('moves the highlight back to the first match after filtering', async () => {
      mountSelect({ searchable: true });
      await open();
      search()!.value = 'spa';
      search()!.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();
      expect(search()!.getAttribute('aria-activedescendant')).toBe(labeled('Spain').id);
    });

    it('keeps the keyboard working from the search box', async () => {
      const w = mountSelect({ searchable: true });
      await open();
      key(search()!, 'ArrowDown');
      await nextTick();
      key(search()!, 'Enter');
      await settle();
      expect(w.emitted('update:modelValue')).toEqual([['es']]);
    });

    it('takes back the last chip on Backspace in an empty box', async () => {
      const w = mountSelect({ searchable: true, multiple: true, defaultValue: ['pl', 'es'] });
      await open();
      key(search()!, 'Backspace');
      await nextTick();
      expect(w.emitted('update:modelValue')).toEqual([[['pl']]]);
    });

    it('leaves the chips alone while the box has text', async () => {
      const w = mountSelect({ searchable: true, multiple: true, defaultValue: ['pl'] });
      await open();
      search()!.value = 'x';
      search()!.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();
      key(search()!, 'Backspace');
      await nextTick();
      expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('forgets the search when it closes', async () => {
      mountSelect({ searchable: true });
      await open();
      search()!.value = 'fra';
      search()!.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      await open();
      expect(search()!.value).toBe('');
      expect(optionEls()).toHaveLength(4);
    });
  });

  describe('inside a field', () => {
    const mountInField = (selectProps: Record<string, any> = {}, rootProps: Record<string, any> = {}) => {
      const Host = defineComponent({
        setup: () => () =>
          h(FieldRoot as any, { class: 'field', ...rootProps }, () => [
            h(FieldLabel as any, () => 'Country'),
            h(SelectRoot as any, { options: OPTIONS, ...selectProps }, () => [
              h(SelectTrigger as any, null, () => [h(SelectValue as any)]),
              h(Portal as any, null, () => [
                h(Positioner as any, null, () => [h(Popup as any, null, () => [h(SelectList as any)])])
              ])
            ]),
            h(FieldDescription as any, () => 'Where you live')
          ])
      });
      return mount(Host, { attachTo: document.body });
    };

    it('takes the field id, so the label points at the trigger', async () => {
      mountInField();
      await nextTick();
      expect(document.querySelector('label')!.getAttribute('for')).toBe(trigger().id);
    });

    it('inherits the field description and label', async () => {
      mountInField();
      await nextTick();
      expect(trigger().getAttribute('aria-describedby')).toBe(document.querySelector('p')!.id);
      expect(trigger().getAttribute('aria-labelledby')).toBe(document.querySelector('label')!.id);
    });

    it('reports emptiness the field cannot read for itself', async () => {
      mountInField({ defaultValue: 'pl' });
      await nextTick();
      expect(document.querySelector('.field')!.hasAttribute('data-filled')).toBe(true);
    });

    it('focuses the trigger, without opening, when the label is clicked', async () => {
      mountInField();
      await nextTick();

      document.querySelector('label')!.click();
      await nextTick();

      expect(document.activeElement).toBe(trigger());
      expect(listbox()).toBeNull();
    });

    it('is read-only and required by the field', async () => {
      mountInField({}, { readOnly: true, required: true });
      await nextTick();

      expect(trigger().getAttribute('aria-readonly')).toBe('true');
      expect(trigger().getAttribute('aria-required')).toBe('true');
    });

    it('is disabled by the field', async () => {
      mountInField({}, { disabled: true });
      await nextTick();
      expect(trigger().getAttribute('aria-disabled')).toBe('true');
      expect(trigger().hasAttribute('tabindex')).toBe(false);

      await open();
      expect(listbox()).toBeNull();
    });

    it('is marked invalid by the field', async () => {
      mountInField({}, { invalid: true });
      await nextTick();
      expect(trigger().getAttribute('aria-invalid')).toBe('true');
      expect(trigger().hasAttribute('data-invalid')).toBe(true);
    });
  });

  describe('placement before focus', () => {
    it('does not focus the search box until the popup has been placed', async () => {
      // Focusing into a popup that still sits at the document origin scrolls
      // the page to the top.
      mountSelect({ searchable: true });
      trigger().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();
      await nextTick();

      expect(document.activeElement).not.toBe(search());
      await settle();
      expect(document.activeElement).toBe(search());
    });
  });

  describe('aligned to the selected item', () => {
    const positioner = () => document.querySelector<HTMLElement>('[data-part="positioner"]')!;

    it('places the popup itself instead of hanging it off the trigger', async () => {
      mountSelect({ alignWithTrigger: true, defaultValue: 'es' });
      await open();

      expect(positioner().style.position).toBe('fixed');
      expect(positioner().getAttribute('data-align')).toBe('item');
      expect(positioner().getAttribute('data-side')).toBe('none');
      expect(trigger().hasAttribute('data-aligned-to-item')).toBe(true);
    });

    it('caps the list so the popup fits the space the alignment left', async () => {
      mountSelect({ alignWithTrigger: true, defaultValue: 'es' });
      await open();
      expect(listbox()!.style.maxHeight).toMatch(/px$/);
    });

    it('aligns within maxHeight, falling back when that leaves too little room', async () => {
      mountSelect({ alignWithTrigger: true, defaultValue: 'es', maxHeight: 20 });
      await open();
      expect(trigger().hasAttribute('data-aligned-to-item')).toBe(false);
      expect(listbox()!.style.maxHeight).toBe('20px');
    });

    it('keeps a maxHeight cap after falling back', async () => {
      setLayout({ y: 5 });
      try {
        mountSelect({ alignWithTrigger: true, defaultValue: 'es', maxHeight: 200 });
        await open();
        expect(trigger().hasAttribute('data-aligned-to-item')).toBe(false);
        expect(listbox()!.style.maxHeight).toBe('200px');
      } finally {
        resetLayout();
      }
    });

    it('publishes where the option ended up, for the enter animation', async () => {
      mountSelect({ alignWithTrigger: true, defaultValue: 'es' });
      await open();
      const popup = document.querySelector<HTMLElement>('[data-part="popup"]')!;
      expect(popup.style.getPropertyValue('--listbox-transform-origin')).toMatch(/^50% /);
    });

    it('stays above or below the trigger when too tall for either, and never moves beside it', async () => {
      // As tall as most of the viewport: no room above or below, plenty on the right.
      setLayout({ x: 200, y: 300, width: 120, height: 400 });
      try {
        mountSelect();
        await open();
        expect(['bottom', 'top']).toContain(positioner().getAttribute('data-side'));
      } finally {
        resetLayout();
      }
    });

    it('is ignored while searchable, where filtering would move the list', async () => {
      mountSelect({ alignWithTrigger: true, searchable: true });
      await open();
      expect(positioner().getAttribute('data-side')).not.toBe('none');
      expect(trigger().hasAttribute('data-aligned-to-item')).toBe(false);
    });

    it('falls back to an ordinary dropdown with the trigger against an edge', async () => {
      // Too close to the top: an aligned popup would have nowhere to extend.
      setLayout({ y: 5 });
      try {
        mountSelect({ alignWithTrigger: true, defaultValue: 'es' });
        await open();
        expect(positioner().getAttribute('data-side')).not.toBe('none');
        expect(trigger().hasAttribute('data-aligned-to-item')).toBe(false);
      } finally {
        resetLayout();
      }
    });

    it('falls back when there is no option to align to', async () => {
      mountSelect({ alignWithTrigger: true, options: [] });
      await open();
      expect(positioner().getAttribute('data-side')).not.toBe('none');
    });

    it('holds the page still, having no anchor to follow', async () => {
      // The popup is pinned to the viewport. A scroll would move the trigger
      // out from under it, so the page does not scroll while it is open.
      mountSelect({ alignWithTrigger: true, defaultValue: 'es' });
      expect(document.body.style.overflow).toBe('');

      await open();
      expect(document.body.style.overflow).toBe('clip');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(document.body.style.overflow).toBe('');
    });

    it('leaves the page alone for an ordinary dropdown, which follows its anchor', async () => {
      mountSelect({ defaultValue: 'es' });
      await open();
      expect(document.body.style.overflow).toBe('');
    });

    it('leaves the page alone after falling back', async () => {
      setLayout({ y: 5 });
      try {
        mountSelect({ alignWithTrigger: true, defaultValue: 'es' });
        await open();
        expect(document.body.style.overflow).toBe('');
      } finally {
        resetLayout();
      }
    });

    it('measures again on each opening', async () => {
      mountSelect({ alignWithTrigger: true, defaultValue: 'es' });
      await open();
      expect(listbox()!.style.maxHeight).toMatch(/px$/);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      await open();

      // A fresh list, capped again rather than left to inherit the last one.
      expect(listbox()!.style.maxHeight).toMatch(/px$/);
      expect(trigger().hasAttribute('data-aligned-to-item')).toBe(true);
    });

    it('tries again on the next opening after falling back', async () => {
      // The fallback is about where the trigger was that time, not for ever.
      setLayout({ y: 5 });
      mountSelect({ alignWithTrigger: true, defaultValue: 'es' });
      await open();
      expect(trigger().hasAttribute('data-aligned-to-item')).toBe(false);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      resetLayout();
      await open();
      expect(trigger().hasAttribute('data-aligned-to-item')).toBe(true);
    });
  });

  describe('styling hooks', () => {
    it('carries a class onto the popup wherever it is teleported to', async () => {
      // The popup is written by the caller, so its class travels with it —
      // no prop needed to reach past the portal.
      mountSelect({}, { popupClass: 'my-popup' });
      await open();
      const popup = document.querySelector('[data-part="popup"]')!;
      expect(popup.classList.contains('my-popup')).toBe(true);
      expect(document.querySelector('[data-part="root"] [data-part="popup"]')).toBeNull();
    });

    it('names every part in the DOM, so structure is legible without classes', async () => {
      mountSelect({ searchable: true, defaultValue: 'pl' });
      await open();
      for (const part of [
        'root',
        'trigger',
        'value',
        'clear',
        'indicator',
        'positioner',
        'popup',
        'search',
        'listbox',
        'option',
        'group'
      ]) {
        expect(document.querySelector(`[data-part="${part}"]`)).not.toBeNull();
      }
    });

    it('keeps the popup in place when the portal is turned off', async () => {
      mountSelect({}, { portal: false });
      await open();
      expect(document.querySelector('[data-part="root"] [data-part="popup"]')).not.toBeNull();
    });
  });

  describe('custom rendering', () => {
    it('hands the option to the slot', async () => {
      mountSelect({}, { optionSlot: (o: any) => h('span', { class: 'custom' }, `${o.label}!`) });
      await open();
      expect(document.querySelector('.custom')!.textContent).toBe('France!');
    });

    it('reads values and labels from other keys', async () => {
      mountSelect({
        options: [{ id: 'a', name: 'Alpha' }],
        valueKey: 'id',
        labelKey: 'name'
      });
      await open();
      expect(optionEls()[0].textContent!.trim()).toBe('Alpha');

      optionEls()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
      expect(valueText()).toBe('Alpha');
    });

    it('takes a custom filter', async () => {
      const filter = vi.fn((option: any, query: string) => option.value.startsWith(query));
      mountSelect({ searchable: true, filter });
      await open();
      search()!.value = 'u';
      search()!.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();
      expect(optionEls().map((el) => el.textContent!.trim())).toEqual(['United States']);
    });
  });
});

describe('Select, maxHeight', () => {
  it('caps the list in pixels, and makes it scroll', async () => {
    mountSelect({ maxHeight: 240 });
    await open();
    expect(listbox()!.style.maxHeight).toBe('240px');
    expect(listbox()!.style.overflowY).toBe('auto');
  });

  it('takes any CSS length', async () => {
    mountSelect({ maxHeight: '40vh' });
    await open();
    expect(listbox()!.style.maxHeight).toBe('40vh');
  });

  it('leaves the list alone without one', async () => {
    mountSelect();
    await open();
    expect(listbox()!.style.maxHeight).toBe('');
  });
});

describe('Select, virtual', () => {
  const MANY = Array.from({ length: 1000 }, (_, i) => ({ value: i, label: i === 999 ? 'Zebra' : `Item ${i}` }));
  const ROW = 32;
  const VIEW = 320;
  const active = () => trigger().getAttribute('aria-activedescendant');
  const spacers = () => [...listbox()!.querySelectorAll<HTMLElement>(':scope > [aria-hidden="true"]')];

  /** Gives the listbox a viewport and a scrollTop that clamps, then lets the window re-measure. */
  async function makeScrollable() {
    const list = listbox()!;
    let top = 0;
    Object.defineProperty(list, 'clientHeight', { configurable: true, get: () => VIEW });
    Object.defineProperty(list, 'scrollTop', {
      configurable: true,
      get: () => top,
      set: (next: number) => {
        top = Math.max(0, Math.min(next, MANY.length * ROW - VIEW));
      }
    });
    window.dispatchEvent(new Event('resize'));
    await settle();
    return list;
  }

  /** jsdom fires no scroll event of its own. */
  async function scrolled() {
    listbox()!.dispatchEvent(new Event('scroll'));
    await settle();
  }

  it('renders a window of the options, with space standing in for the rest', async () => {
    mountSelect({ options: MANY, virtual: true });
    await open();
    await makeScrollable();

    const rendered = optionEls();
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(60);
    expect(rendered[0].getAttribute('aria-setsize')).toBe('1000');
    expect(rendered[0].getAttribute('aria-posinset')).toBe('1');

    const [before, after] = spacers();
    expect(before.style.height).toBe('0px');
    expect(parseFloat(after.style.height)).toBe((1000 - rendered.length) * ROW);
  });

  it('moves the window as the list scrolls', async () => {
    mountSelect({ options: MANY, virtual: true });
    await open();
    const list = await makeScrollable();

    list.scrollTop = 500 * ROW;
    await scrolled();

    expect(optionEls().some((el) => el.textContent?.trim() === 'Item 500')).toBe(true);
    expect(optionEls().some((el) => el.textContent?.trim() === 'Item 0')).toBe(false);
    expect(parseFloat(spacers()[0].style.height)).toBeGreaterThan(0);
  });

  it('reaches an option that is not rendered with the keyboard, and commits it', async () => {
    const w = mountSelect({ options: MANY, virtual: true });
    await open();
    const list = await makeScrollable();

    key(trigger(), 'End');
    await nextTick();
    expect(list.scrollTop).toBe(1000 * ROW - VIEW);
    await scrolled();

    expect(active()).toBe(labeled('Zebra').id);
    key(trigger(), 'Enter');
    await settle();
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([999]);
  });

  it('wraps from the first option to the last', async () => {
    mountSelect({ options: MANY, virtual: true });
    await open();
    await makeScrollable();

    key(trigger(), 'ArrowUp');
    await nextTick();
    await scrolled();
    expect(active()).toBe(labeled('Zebra').id);
  });

  it('finds an option that is not rendered by typeahead', async () => {
    mountSelect({ options: MANY, virtual: true });
    await open();
    await makeScrollable();

    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true }));
    await nextTick();
    await scrolled();
    expect(active()).toBe(labeled('Zebra').id);
  });

  it('opens with a selected option far down the list in the middle', async () => {
    // Opening scrolls before a test could reach the listbox, so every listbox gets the geometry up front.
    const tops = new WeakMap<Element, number>();
    const isList = (el: Element) => el.getAttribute('role') === 'listbox';
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get() {
        return isList(this) ? VIEW : 0;
      }
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
      configurable: true,
      get() {
        return tops.get(this) ?? 0;
      },
      set(next: number) {
        tops.set(this, Math.max(0, Math.min(next, MANY.length * ROW - VIEW)));
      }
    });
    try {
      mountSelect({ options: MANY, virtual: true, modelValue: 600 });
      await open();
      await scrolled();

      expect(listbox()!.scrollTop).toBe(600 * ROW + ROW / 2 - VIEW / 2);
      expect(active()).toBe(labeled('Item 600').id);
    } finally {
      delete (HTMLElement.prototype as any).clientHeight;
      delete (HTMLElement.prototype as any).scrollTop;
    }
  });

  it('scrolls only as far as it must for the keyboard', async () => {
    mountSelect({ options: MANY, virtual: true });
    await open();
    const list = await makeScrollable();

    for (let i = 0; i < 12; i += 1) key(trigger(), 'ArrowDown');
    await nextTick();

    // Row 12 just fits at the bottom edge, rather than being centered.
    expect(list.scrollTop).toBe(13 * ROW - VIEW);
  });

  it('measures the row height from a rendered option', async () => {
    setLayout({ height: 40 });
    mountSelect({ options: MANY, virtual: true });
    await open();
    await makeScrollable();

    expect(parseFloat(spacers()[1].style.height)).toBe((1000 - optionEls().length) * 40);
  });

  it('hands rows of the caller’s own only the ones on screen', async () => {
    const w = mountSelect(
      { options: MANY, virtual: true },
      {
        listSlot: ({ options }: any) =>
          options.map((option: any) => h(SelectItem as any, { key: option.value, option, class: 'row' }))
      }
    );
    await open();
    await makeScrollable();

    expect(optionEls().length).toBeGreaterThan(0);
    expect(optionEls().length).toBeLessThan(100);
    expect(optionEls().every((el) => el.classList.contains('row'))).toBe(true);
    // The list still holds the space around them.
    expect(spacers()).toHaveLength(2);

    key(trigger(), 'End');
    key(trigger(), 'Enter');
    await settle();
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([999]);
  });

  it('renders everything when the list is grouped', async () => {
    mountSelect({ virtual: true });
    await open();

    expect(spacers()).toHaveLength(0);
    expect(optionEls()[0].hasAttribute('aria-setsize')).toBe(false);
  });
});

describe('Select, order', () => {
  const FLAT = ['Alpha', 'Bravo', 'Charlie', 'Delta'].map((label) => ({ value: label.toLowerCase(), label }));
  const labels = () => optionEls().map((el) => el.textContent?.trim());
  const close = async () => {
    key(trigger(), 'Escape');
    await settle();
  };

  it('lifts the selected options to the top, keeping their own order', async () => {
    mountSelect({ options: FLAT, multiple: true, modelValue: ['delta', 'bravo'], order: 'selected-first' });
    await open();

    expect(labels()).toEqual(['Bravo', 'Delta', 'Alpha', 'Charlie']);
    // Indices follow what is shown, so the keyboard walks it top to bottom.
    expect(optionEls().map((el) => el.dataset.index)).toEqual(['0', '1', '2', '3']);
  });

  it('holds the order while open, and takes the new selection on the next opening', async () => {
    const w = mountSelect({ options: FLAT, multiple: true, defaultValue: ['bravo'], order: 'selected-first' });
    await open();
    labeled('Delta').click();
    await settle();

    expect(labels()).toEqual(['Bravo', 'Alpha', 'Charlie', 'Delta']);

    await close();
    await open();
    expect(labels()).toEqual(['Bravo', 'Delta', 'Alpha', 'Charlie']);
    void w;
  });

  it('keeps groups whole, lifting within each', async () => {
    mountSelect({ modelValue: 'es', order: 'selected-first' });
    await open();

    const europe = [...document.querySelectorAll('[role="group"]')][0];
    expect(europe.querySelector('[role="option"]')?.textContent?.trim()).toBe('Spain');
  });

  it('leaves the order alone without it', async () => {
    mountSelect({ options: FLAT, multiple: true, modelValue: ['delta'] });
    await open();
    expect(labels()).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta']);
  });
});

describe('Select, presets', () => {
  const PEOPLE = ['ann', 'bob', 'cid', 'dee'].map((value) => ({ value, label: value.toUpperCase() }));
  const PRESETS = [
    { label: 'Pair', values: ['ann', 'bob'] },
    {
      label: 'Teams',
      presets: [
        { label: 'Front', values: ['cid'] },
        { label: 'Back', values: ['dee', 'ann'] }
      ]
    },
    { label: 'Nobody', values: ['bob'], disabled: true }
  ];
  const presetButton = (label: string) =>
    [...document.querySelectorAll<HTMLElement>('[data-part="preset"]')].find((el) => el.textContent?.trim() === label)!;
  const replaceButton = (label: string) =>
    presetButton(label).parentElement!.querySelector<HTMLElement>('[data-part="preset-replace"]')!;
  const last = (w: any) => w.emitted('update:modelValue')?.at(-1)?.[0];

  function mountPresets(props: Record<string, any> = {}) {
    return mountSelect({ options: PEOPLE, multiple: true, presets: PRESETS, ...props }, { presets: true });
  }

  it('renders loose presets and labeled groups', async () => {
    mountPresets();
    await open();

    const groups = [...document.querySelectorAll<HTMLElement>('[data-part="preset-group"]')];
    expect(groups.map((g) => g.textContent?.replace(/replace/g, '').trim())).toEqual([
      'Pair',
      'TeamsFrontBack',
      'Nobody'
    ]);
    const labeled = groups[1];
    expect(labeled.getAttribute('role')).toBe('group');
    expect(document.getElementById(labeled.getAttribute('aria-labelledby')!)!.textContent?.trim()).toBe('Teams');
  });

  it('toggles when uncontrolled, marking itself pressed', async () => {
    const w = mountPresets({ defaultValue: ['dee'] });
    await open();

    presetButton('Pair').click();
    await nextTick();
    expect(last(w)).toEqual(['dee', 'ann', 'bob']);
    expect(presetButton('Pair').getAttribute('aria-pressed')).toBe('true');
    expect(presetButton('Pair').parentElement!.hasAttribute('data-active')).toBe(true);

    presetButton('Pair').click();
    await nextTick();
    expect(last(w)).toEqual(['dee']);
    expect(presetButton('Pair').getAttribute('aria-pressed')).toBe('false');
  });

  it('replaces the selection with exactly its values', async () => {
    const w = mountPresets({ defaultValue: ['cid', 'dee'] });
    await open();

    replaceButton('Pair').click();
    await nextTick();
    expect(last(w)).toEqual(['ann', 'bob']);
  });

  it('ignores a disabled preset', async () => {
    const w = mountPresets({ defaultValue: [] });
    await open();

    presetButton('Nobody').click();
    await nextTick();
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  it('keeps focus where it is when pressed', async () => {
    mountPresets();
    await open();

    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    presetButton('Pair').dispatchEvent(press);
    expect(press.defaultPrevented).toBe(true);
  });

  it('follows the search, by its own label or its group label', async () => {
    mountPresets({ searchable: true });
    await open();
    const box = search()!;

    box.value = 'tea';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect([...document.querySelectorAll('[data-part="preset"]')].map((el) => el.textContent?.trim())).toEqual([
      'Front',
      'Back'
    ]);

    box.value = 'pai';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect([...document.querySelectorAll('[data-part="preset"]')].map((el) => el.textContent?.trim())).toEqual([
      'Pair'
    ]);
  });

  const heading = (label: string) =>
    [...document.querySelectorAll<HTMLElement>('[data-part="preset-group-trigger"]')].find(
      (el) => el.textContent?.trim() === label
    )!;
  // A folded section keeps its presets, inert, so the fold can animate.
  const shown = () =>
    [...document.querySelectorAll('[data-part="preset"]')]
      .filter((el) => !el.closest('[inert]'))
      .map((el) => el.textContent?.trim());

  it('folds a labeled group from its heading, starting closed when collapsed', async () => {
    mountPresets({ presets: [PRESETS[0], { ...PRESETS[1], collapsed: true }] });
    await open();

    const teams = heading('Teams');
    const panel = () => document.getElementById(teams.getAttribute('aria-controls')!);
    expect(teams.getAttribute('aria-expanded')).toBe('false');
    expect(panel()!.hasAttribute('inert')).toBe(true);
    expect(teams.parentElement!.hasAttribute('data-closed')).toBe(true);
    expect(shown()).toEqual(['Pair']);

    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    teams.dispatchEvent(press);
    expect(press.defaultPrevented).toBe(true);

    teams.click();
    await settle();
    expect(teams.getAttribute('aria-expanded')).toBe('true');
    expect(teams.hasAttribute('data-open')).toBe(true);
    expect(teams.parentElement!.hasAttribute('data-open')).toBe(true);
    expect(panel()!.hasAttribute('inert')).toBe(false);
    expect(shown()).toEqual(['Pair', 'Front', 'Back']);

    teams.click();
    await settle();
    expect(shown()).toEqual(['Pair']);
  });

  it('opens a folded group while a search finds something in it', async () => {
    mountPresets({ searchable: true, presets: [{ ...PRESETS[1], collapsed: true }] });
    await open();
    const box = search()!;

    box.value = 'fro';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect(shown()).toEqual(['Front']);
    expect((heading('Teams') as HTMLButtonElement).disabled).toBe(true);

    box.value = '';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    expect(shown()).toEqual([]);
    expect((heading('Teams') as HTMLButtonElement).disabled).toBe(false);
  });

  it('gathers the loose presets under presets-label, where the first one sits', async () => {
    mountPresets({ presetsLabel: 'Saved' });
    await open();

    const groups = [...document.querySelectorAll<HTMLElement>('[data-part="preset-group"]')];
    expect(groups.map((g) => g.getAttribute('role'))).toEqual(['group', 'group']);
    expect(
      [...document.querySelectorAll('[data-part="preset-group-trigger"]')].map((el) => el.textContent?.trim())
    ).toEqual(['Saved', 'Teams']);
    expect(shown()).toEqual(['Pair', 'Nobody', 'Front', 'Back']);

    heading('Saved').click();
    await settle();
    expect(shown()).toEqual(['Front', 'Back']);
  });

  it('shows nothing for a single select', async () => {
    mountPresets({ multiple: false });
    await open();
    expect(document.querySelector('[data-part="presets"]')).toBeNull();
  });
});

describe('Select, rows the app renders', () => {
  it('finds a row by its label as typed, whatever the row shows', async () => {
    const value = ref<string | null>(null);
    const Host = defineComponent({
      setup: () => () =>
        h(
          SelectRoot as any,
          {
            options: ['Apple', 'Banana', 'Cherry'],
            modelValue: value.value,
            'onUpdate:modelValue': (v: string) => (value.value = v),
          },
          () => [
            h(SelectTrigger as any, null, () => h(SelectValue as any)),
            h(Portal as any, null, () =>
              h(Positioner as any, null, () =>
                h(Popup as any, null, () =>
                  h(SelectList as any, null, {
                    // custom content: an icon-ish prefix the label doesn't have
                    default: ({ options }: any) =>
                      options.map((option: any) =>
                        h(SelectItem as any, { key: option.value, option }, () => `🍓 ${option.label}`),
                      ),
                  }),
                ),
              ),
            ),
          ],
        ),
    });
    mount(Host, { attachTo: document.body });
    await open();

    key(trigger(), 'c');
    key(trigger(), 'Enter');
    await settle();

    expect(value.value).toBe('Cherry');
  });
});
