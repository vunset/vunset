import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxInput,
  ComboboxClear,
  ComboboxIndicator,
  Positioner,
  Popup,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  Portal,
  Addon,
  FieldRoot,
  FieldLabel,
} from '../src';

const OPTIONS = [
  {
    label: 'Frameworks',
    options: [
      { value: 'vue', label: 'Vue' },
      { value: 'react', label: 'React', disabled: true },
      { value: 'svelte', label: 'Svelte' },
    ],
  },
  { value: 'solid', label: 'Solid' },
  { value: 'ng', label: 'Angular' },
];

interface Chrome {
  placeholder?: string;
  emptyText?: string;
  createSlot?: (option: any) => any;
}

/** The parts, assembled the way a caller would. The Host re-emits. */
function mountCombobox(props: Record<string, any> = {}, chrome: Chrome = {}) {
  const Host = defineComponent({
    emits: ['update:modelValue', 'update:open', 'create'],
    setup(_, { emit }) {
      return () =>
        h(
          ComboboxRoot as any,
          {
            options: OPTIONS,
            ...props,
            'onUpdate:modelValue': (value: any) => emit('update:modelValue', value),
            'onUpdate:open': (value: any) => emit('update:open', value),
            onCreate: (value: any) => emit('create', value),
          },
          () => [
            h(ComboboxTrigger as any, null, () => [
              h(ComboboxChips as any),
              h(ComboboxInput as any, { placeholder: chrome.placeholder }),
              h(ComboboxClear as any, null, () => '⊗'),
              h(ComboboxIndicator as any, null, () => '▾'),
            ]),
            h(Portal as any, null, () => [
              h(Positioner as any, null, () => [
                h(Popup as any, null, () => [
                  h(
                    ComboboxList as any,
                    null,
                    chrome.createSlot ? { create: chrome.createSlot } : {},
                  ),
                  h(ComboboxEmpty as any, null, () => chrome.emptyText ?? 'No matches'),
                ]),
              ]),
            ]),
          ],
        );
    },
  });
  return mount(Host, { attachTo: document.body });
}

const trigger = () => document.querySelector<HTMLElement>('[data-part="trigger"]')!;
const input = () => document.querySelector<HTMLInputElement>('[data-part="input"]')!;
const listbox = () => document.querySelector<HTMLElement>('[role="listbox"]');
const optionEls = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')];
const labeled = (text: string) => optionEls().find((el) => el.textContent?.trim() === text)!;
const chips = () => [...document.querySelectorAll<HTMLElement>('[data-part="chip"]')];
const createRow = () => document.querySelector<HTMLElement>('[role="option"][data-create]');

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

/** Typing, as the DOM reports it: the element's value first, then the event. */
async function type(text: string) {
  const el = input();
  el.value = text;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  await settle();
}

async function open() {
  input().dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await settle();
}

const key = (target: EventTarget, k: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

describe('Combobox', () => {
  describe('structure', () => {
    it('puts the combobox role on the input, not the wrapper', () => {
      mountCombobox();
      expect(input().getAttribute('role')).toBe('combobox');
      expect(input().getAttribute('aria-autocomplete')).toBe('list');
      expect(input().getAttribute('aria-expanded')).toBe('false');
      // The wrapper is only an anchor and a box for the chips.
      expect(trigger().getAttribute('role')).toBeNull();
      expect(trigger().getAttribute('tabindex')).toBeNull();
    });

    it('points aria-controls at the listbox only while it exists', async () => {
      mountCombobox();
      expect(input().getAttribute('aria-controls')).toBeNull();

      await open();
      expect(listbox()).not.toBeNull();
      expect(input().getAttribute('aria-controls')).toBe(listbox()!.id);
      expect(input().getAttribute('aria-expanded')).toBe('true');
    });

    it('takes its id and labeling from a surrounding field', async () => {
      const Host = defineComponent({
        setup() {
          return () =>
            h(FieldRoot as any, null, () => [
              h(FieldLabel as any, null, () => 'Stack'),
              h(ComboboxRoot as any, { options: OPTIONS }, () => [
                h(ComboboxTrigger as any, null, () => [h(ComboboxInput as any)]),
              ]),
            ]);
        },
      });
      mount(Host, { attachTo: document.body });
      await nextTick();

      const label = document.querySelector('label')!;
      expect(input().id).toBe(label.getAttribute('for'));
      expect(input().getAttribute('aria-labelledby')).toBe(label.id);
    });
  });

  describe('filtering', () => {
    it('opens as soon as anything is typed', async () => {
      mountCombobox();
      expect(listbox()).toBeNull();
      await type('sv');
      expect(listbox()).not.toBeNull();
      expect(optionEls().map((el) => el.textContent!.trim())).toEqual(['Svelte']);
    });

    it('reports an empty list when nothing matches', async () => {
      mountCombobox();
      await type('zzz');
      expect(optionEls()).toHaveLength(0);
      expect(document.querySelector('[data-part="empty"]')!.textContent).toContain('No matches');
    });

    it('does not filter by the label it parks in the box', async () => {
      // The single-value combobox shows the selection as text. Treating that
      // text as a search would leave the list showing only what is already
      // chosen, which is the classic combobox bug.
      mountCombobox({ defaultValue: 'vue' });
      await nextTick();
      expect(input().value).toBe('Vue');

      await open();
      expect(optionEls().map((el) => el.textContent!.trim())).toEqual([
        'Vue',
        'React',
        'Svelte',
        'Solid',
        'Angular',
      ]);
    });

    it('moves the highlight to the first match as the list narrows', async () => {
      mountCombobox({ creatable: true });
      await type('S');
      expect(optionEls().map((el) => el.textContent!.trim())).toEqual([
        'Svelte',
        'Solid',
        'Create \u201cS\u201d',
      ]);
      expect(input().getAttribute('aria-activedescendant')).toBe(labeled('Svelte').id);

      await type('So');
      expect(input().getAttribute('aria-activedescendant')).toBe(labeled('Solid').id);
    });

    it('reaches the create row with the arrow keys', async () => {
      mountCombobox({ creatable: true });
      await type('Vu');
      expect(input().getAttribute('aria-activedescendant')).toBe(labeled('Vue').id);

      key(input(), 'ArrowDown');
      await settle();
      expect(input().getAttribute('aria-activedescendant')).toBe(createRow()!.id);
    });

    it('puts the selected label back after an abandoned search', async () => {
      mountCombobox({ defaultValue: 'vue' });
      await nextTick();
      await type('sve');
      expect(input().value).toBe('sve');

      key(input(), 'Escape');
      await settle();
      expect(input().value).toBe('Vue');
    });
  });

  describe('selection', () => {
    it('commits the highlighted option on Enter and shows it as text', async () => {
      const w = mountCombobox();
      await type('sve');
      key(input(), 'Enter');
      await settle();

      expect(w.emitted('update:modelValue')).toEqual([['svelte']]);
      expect(input().value).toBe('Svelte');
      expect(listbox()).toBeNull();
    });

    it('follows a value set from outside', async () => {
      // Controlled from the page, with nothing touching the input: the text is
      // a view of the value, not a second place the value lives.
      const value = ref<string | null>(null);
      const Host = defineComponent({
        setup: () => () =>
          h(
            ComboboxRoot as any,
            {
              options: OPTIONS,
              modelValue: value.value,
              'onUpdate:modelValue': (next: any) => (value.value = next),
            },
            () => [h(ComboboxTrigger as any, null, () => [h(ComboboxInput as any)])],
          ),
      });
      mount(Host, { attachTo: document.body });
      await nextTick();
      expect(input().value).toBe('');

      value.value = 'solid';
      await nextTick();
      expect(input().value).toBe('Solid');
    });

    it('leaves a disabled option alone', async () => {
      const w = mountCombobox();
      await open();
      labeled('React').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
      expect(w.emitted('update:modelValue')).toBeUndefined();
    });
  });

  describe('multiple', () => {
    it('renders a chip per selection and clears the search after each', async () => {
      const w = mountCombobox({ multiple: true });
      await type('sve');
      key(input(), 'Enter');
      await settle();

      expect(chips().map((el) => el.textContent!.replace(/[×\s]+/g, ''))).toEqual(['Svelte']);
      // The label is its own element, so a stylesheet can truncate it without
      // also truncating the remove button.
      expect(chips()[0].querySelector('[data-part="chip-label"]')!.textContent).toBe('Svelte');
      // Emptied, not left holding "sve": the box is where the next one is typed.
      expect(input().value).toBe('');
      expect(w.emitted('update:modelValue')).toEqual([[['svelte']]]);
    });

    it('removes a chip by its button', async () => {
      const w = mountCombobox({ multiple: true, defaultValue: ['vue', 'solid'] });
      await nextTick();
      chips()[0]
        .querySelector('[data-part="chip-remove"]')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();
      expect(w.emitted('update:modelValue')).toEqual([[['solid']]]);
    });

    function mountChips(slots: Record<string, (option: any) => any>, props: Record<string, any> = {}) {
      const onUpdate = vi.fn();
      const w = mount(
        defineComponent(
          () => () =>
            h(
              ComboboxRoot as any,
              { options: OPTIONS, multiple: true, defaultValue: ['vue', 'solid'], ...props, 'onUpdate:modelValue': onUpdate },
              () => h(ComboboxTrigger as any, null, () => [h(ComboboxChips as any, null, slots), h(ComboboxInput as any)]),
            ),
        ),
        { attachTo: document.body },
      );
      return { onUpdate, el: w.element as HTMLElement };
    }

    it('swaps only the remove button through the remove slot', async () => {
      const { onUpdate, el } = mountChips({ remove: () => h(ComboboxChipRemove as any, { class: 'mine' }, () => 'x') });
      await nextTick();
      const remove = el.querySelector('[data-part="chip"] > .mine[data-part="chip-remove"]')!;
      // The default chip around it is kept.
      expect(remove.previousElementSibling!.getAttribute('data-part')).toBe('chip-label');
      expect(remove.getAttribute('aria-label')).toBe('Remove Vue');
      expect(remove.textContent).toBe('x');
      remove.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();
      expect(onUpdate).toHaveBeenCalledWith(['solid']);
    });

    it('rebuilds a chip from ComboboxChip and ComboboxChipRemove', async () => {
      const { onUpdate, el } = mountChips({
        chip: (option: any) =>
          h(ComboboxChip as any, { option, class: 'own' }, () => [option.label, h(ComboboxChipRemove as any)]),
      });
      await nextTick();
      const chip = el.querySelector('.own[data-part="chip"]')!;
      expect(chip.getAttribute('data-value')).toBe('vue');
      chip.querySelector('[data-part="chip-remove"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();
      expect(onUpdate).toHaveBeenCalledWith(['solid']);
    });

    it('hides the remove button while read-only', async () => {
      const { el } = mountChips({ remove: () => h(ComboboxChipRemove as any, { class: 'ro' }) }, { readOnly: true });
      await nextTick();
      expect(el.querySelectorAll('[data-part="chip"]')).toHaveLength(2);
      expect(el.querySelector('[data-part="chip-remove"]')).toBeNull();
    });

    it('takes back the last chip on Backspace in an empty box', async () => {
      const w = mountCombobox({ multiple: true, defaultValue: ['vue', 'solid'] });
      await nextTick();
      key(input(), 'Backspace');
      await settle();
      expect(w.emitted('update:modelValue')).toEqual([[['vue']]]);
    });

    it('leaves the chips alone when Backspace has text to delete', async () => {
      const w = mountCombobox({ multiple: true, defaultValue: ['vue'] });
      await type('sv');
      key(input(), 'Backspace');
      await settle();
      expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('collapses the chips beyond flatten into a count', async () => {
      mountCombobox({ multiple: true, flatten: 1, defaultValue: ['vue', 'solid'] });
      await nextTick();
      expect(chips()).toHaveLength(1);
      expect(document.querySelector('[data-part="chip-overflow"]')!.textContent).toBe('+1');
    });

    it('keeps the popup open across selections', async () => {
      mountCombobox({ multiple: true });
      await open();
      labeled('Vue').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
      expect(listbox()).not.toBeNull();
      expect(listbox()!.getAttribute('aria-multiselectable')).toBe('true');
    });
  });

  describe('slots', () => {
    const mountAdorned = () => {
      const Host = defineComponent({
        setup: () => () =>
          h(ComboboxRoot as any, { options: OPTIONS }, () => [
            h(ComboboxTrigger as any, null, () => [
              h(Addon as any, { side: 'start' }, () => h('span', { class: 'flag' }, '@')),
              h(ComboboxInput as any),
              h(Addon as any, { side: 'end' }, () => 'kg'),
            ]),
          ]),
      });
      return mount(Host, { attachTo: document.body });
    };

    it('uses the same part and hooks a select and a field group use', () => {
      mountAdorned();
      const sides = [...document.querySelectorAll('[data-part="addon"]')].map((el) =>
        el.getAttribute('data-side'),
      );
      expect(sides).toEqual(['start', 'end']);
    });

    it('lets a press on the slot reach the input', async () => {
      // The slot has no behavior of its own; the trigger focuses its input for
      // any press that is not on something interactive, the way clicking the
      // padding of a text field does.
      mountAdorned();
      document
        .querySelector('.flag')!
        .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      await settle();
      expect(document.activeElement).toBe(input());
    });
  });

  describe('creatable', () => {
    it('offers nothing until it is switched on', async () => {
      mountCombobox();
      await type('Qwik');
      expect(createRow()).toBeNull();
    });

    it('offers the typed text as a last row', async () => {
      mountCombobox({ creatable: true });
      await type('Vu');
      // "Vu" matches Vue and is not itself an option, so both rows are there —
      // and the create row has to come after the match, or arrowing to the
      // first result would land on the invented one.
      expect(optionEls().map((el) => el.textContent!.trim())).toEqual([
        'Vue',
        'Create \u201cVu\u201d',
      ]);
      expect(optionEls().at(-1)).toBe(createRow());
    });

    it('announces the coined value and selects it', async () => {
      const w = mountCombobox({ creatable: true });
      await type('Qwik');
      createRow()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();

      expect(w.emitted('create')).toEqual([['Qwik']]);
      expect(w.emitted('update:modelValue')).toEqual([['Qwik']]);
      expect(input().value).toBe('Qwik');
    });

    it('renders a coined value with no option behind it', async () => {
      // Nothing in `options` carries this value, so the trigger has only the
      // raw value to go on. It has to be enough.
      mountCombobox({ creatable: true, multiple: true, defaultValue: ['Qwik'] });
      await nextTick();
      expect(chips().map((el) => el.textContent!.replace(/[×\s]+/g, ''))).toEqual(['Qwik']);
    });

    it('holds back when an option already has that label', async () => {
      // Angular's value is "ng", so only the label can be what matches here.
      mountCombobox({ creatable: true });
      await type('Angular');
      expect(createRow()).toBeNull();
      expect(labeled('Angular')).not.toBeUndefined();
    });

    it('holds back when an option already has that value', async () => {
      // "ng" matches no label at all, so only the value can be what matches.
      mountCombobox({ creatable: true });
      await type('ng');
      expect(createRow()).toBeNull();
    });

    it('holds back when the text is already chosen', async () => {
      mountCombobox({ creatable: true, multiple: true, defaultValue: ['Qwik'] });
      await type('Qwik');
      expect(createRow()).toBeNull();
    });

    it('holds back on whitespace alone', async () => {
      mountCombobox({ creatable: true });
      await type('   ');
      expect(createRow()).toBeNull();
    });

    it('trims what it coins', async () => {
      const w = mountCombobox({ creatable: true });
      await type('  Qwik  ');
      createRow()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
      expect(w.emitted('create')).toEqual([['Qwik']]);
    });

    it('lets a predicate refuse the text', async () => {
      mountCombobox({ creatable: (query: string) => query.length >= 4 });
      await type('Qwi');
      expect(createRow()).toBeNull();
      await type('Qwik');
      expect(createRow()).not.toBeNull();
    });

    it('keeps the empty message away while there is something to create', async () => {
      mountCombobox({ creatable: true });
      await type('Qwik');
      expect(document.querySelector('[data-part="empty"]')).toBeNull();
    });

    it('renders the create row through its own slot', async () => {
      mountCombobox(
        { creatable: true },
        { createSlot: (option: any) => h('span', null, `Add ${option.label}`) },
      );
      await type('Qwik');
      expect(createRow()!.textContent!.trim()).toBe('Add Qwik');
    });

    it('takes a real match over the create row on Enter', async () => {
      const w = mountCombobox({ creatable: true });
      await type('Sve');
      expect(createRow()).not.toBeNull();

      key(input(), 'Enter');
      await settle();
      expect(w.emitted('create')).toBeUndefined();
      expect(w.emitted('update:modelValue')).toEqual([['svelte']]);
    });
  });

  describe('clearing', () => {
    it('drops the whole selection and empties the box', async () => {
      const w = mountCombobox({ multiple: true, defaultValue: ['vue', 'solid'] });
      await nextTick();
      document
        .querySelector<HTMLElement>('[data-part="clear"]')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();

      expect(w.emitted('update:modelValue')).toEqual([[[]]]);
      expect(chips()).toHaveLength(0);
    });

    it('offers no clear button while nothing is selected', async () => {
      mountCombobox();
      await nextTick();
      expect(document.querySelector('[data-part="clear"]')).toBeNull();
    });
  });

  describe('disabled and read-only', () => {
    it('does not open when disabled', async () => {
      mountCombobox({ disabled: true });
      expect(input().disabled).toBe(true);
      await open();
      expect(listbox()).toBeNull();
    });

    it('does not change when read-only', async () => {
      const w = mountCombobox({ readOnly: true, defaultValue: 'vue' });
      expect(input().readOnly).toBe(true);
      await open();
      expect(listbox()).toBeNull();
      expect(w.emitted('update:modelValue')).toBeUndefined();
    });
  });
});

describe('Combobox, rows the app renders', () => {
  const MANY = Array.from({ length: 100 }, (_, i) => ({ value: `item-${i}`, label: `Item ${i}` }));

  /** Renders only the first `window` rows, as a virtualizer would; records `activeIndex`. */
  function mountWindowed(window: number, seen: number[] = []) {
    const value = ref<string | null>(null);
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            ComboboxRoot as any,
            { options: MANY, modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) },
            () => [
              h(ComboboxTrigger as any, null, () => [h(ComboboxInput as any)]),
              h(Portal as any, null, () => [
                h(Positioner as any, null, () => [
                  h(Popup as any, null, () => [
                    h(ComboboxList as any, null, {
                      default: ({ options, activeIndex }: any) => {
                        seen.push(activeIndex);
                        return options
                          .slice(0, window)
                          .map((option: any) => h(ComboboxItem as any, { key: option.value, option, class: 'row' }));
                      },
                    }),
                  ]),
                ]),
              ]),
            ],
          );
      },
    });
    mount(Host, { attachTo: document.body });
    return value;
  }

  it('renders the rows it is given, with what an option needs', async () => {
    mountWindowed(10);
    await open();

    expect(optionEls()).toHaveLength(10);
    const first = optionEls()[0]!;
    expect(first.getAttribute('data-part')).toBe('option');
    expect(first.classList.contains('row')).toBe(true);
    expect(first.textContent).toBe('Item 0');
    // Only some rows are in the page, so each says where it stands among all of them.
    expect(first.getAttribute('aria-setsize')).toBe('100');
    expect(first.getAttribute('aria-posinset')).toBe('1');
  });

  it('moves past the rendered rows, and says where to scroll', async () => {
    const seen: number[] = [];
    mountWindowed(10, seen);
    await open();

    for (let i = 0; i < 15; i += 1) key(input(), 'ArrowDown');
    await nextTick();

    // The highlight reached an option the app hasn't rendered; the app learns which.
    expect(input().getAttribute('aria-activedescendant')).toMatch(/-o15$/);
    expect(seen.at(-1)).toBe(15);
  });

  it('commits an option the app hasn’t rendered', async () => {
    const value = mountWindowed(10);
    await open();

    key(input(), 'End');
    key(input(), 'Enter');
    await settle();

    expect(value.value).toBe('item-99');
  });

  it('filters every option, not only the rendered ones', async () => {
    mountWindowed(10);
    await open();
    await type('Item 87');

    expect(optionEls().map((el) => el.textContent)).toEqual(['Item 87']);
  });
});
