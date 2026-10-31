import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { FormCombobox } from '../src';

const OPTIONS = [
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' }
];

const input = () => document.querySelector<HTMLInputElement>('.form-combobox-input')!;
const label = () => document.querySelector<HTMLLabelElement>('.form-label')!;
const option = (text: string) =>
  [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((el) => el.textContent?.trim() === text)!;
const chips = () => [...document.querySelectorAll<HTMLElement>('[data-part="chip-label"]')].map((el) => el.textContent);
const clearButton = () => document.querySelector<HTMLElement>('[data-part="clear"]');

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

async function type(text: string) {
  input().value = text;
  input().dispatchEvent(new Event('input', { bubbles: true }));
  await settle();
}

function press(key: string) {
  input().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

let wrapper: VueWrapper | undefined;

function mountCombobox(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  wrapper = mount(FormCombobox as any, {
    props: { label: 'Framework', options: OPTIONS, placeholder: 'Type to search', ...props },
    slots,
    attachTo: document.body
  });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('FormCombobox', () => {
  it('labels the input', () => {
    mountCombobox();
    expect(label().htmlFor).toBe(input().id);
    expect(input().placeholder).toBe('Type to search');
  });

  it('filters as you type, and commits the highlighted option on Enter', async () => {
    const w = mountCombobox();
    await type('sv');

    expect(option('Svelte')).toBeTruthy();
    expect(option('Vue')).toBeUndefined();
    press('Enter');
    await settle();

    expect(w.emitted('update:modelValue')).toEqual([['svelte']]);
    expect(input().value).toBe('Svelte');
  });

  it('says when nothing matches', async () => {
    mountCombobox({ emptyText: 'Nothing here' });
    await type('zzz');
    expect(document.querySelector('.form-listbox-empty')!.textContent!.trim()).toBe('Nothing here');
  });

  it('is described by its help and its error', async () => {
    mountCombobox({ help: 'Your favorite', error: 'Pick one' });
    await nextTick();

    const ids = input().getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual(['Your favorite', 'Pick one']);
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('shows chips when multiple, each with a remove button', async () => {
    const w = mountCombobox({ multiple: true, defaultValue: ['vue', 'solid'] });
    await nextTick();
    expect(chips()).toEqual(['Vue', 'Solid']);

    document.querySelector<HTMLElement>('.form-combobox-chip-remove')!.click();
    await settle();
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([['solid']]);
  });

  it('takes a value set from code on a model that started out undefined', async () => {
    const w = mountCombobox({ multiple: true, modelValue: undefined });
    await nextTick();
    expect(chips()).toEqual([]);

    await w.setProps({ modelValue: ['vue', 'solid'] });
    expect(chips()).toEqual(['Vue', 'Solid']);
    await w.setProps({ modelValue: undefined });
    expect(chips()).toEqual([]);
  });

  it('writes undefined once the last chip goes, with v-model.optional', async () => {
    const w = mountCombobox({ multiple: true, modelValue: ['vue'], modelModifiers: { optional: true } });
    await nextTick();

    document.querySelector<HTMLElement>('.form-combobox-chip-remove')!.click();
    await settle();
    expect(w.emitted('update:modelValue')).toEqual([[undefined]]);
  });

  it('drops the placeholder once a chip is chosen, unless show-placeholder keeps it', async () => {
    const w = mountCombobox({ multiple: true, modelValue: [] });
    await nextTick();
    expect(input().placeholder).toBe('Type to search');

    await w.setProps({ modelValue: ['vue'] });
    expect(input().hasAttribute('placeholder')).toBe(false);

    await w.setProps({ showPlaceholder: true });
    expect(input().placeholder).toBe('Type to search');
  });

  it('hides chip remove buttons while read-only', async () => {
    mountCombobox({ multiple: true, defaultValue: ['vue'], readOnly: true });
    await nextTick();
    expect(chips()).toEqual(['Vue']);
    expect(document.querySelector('.form-combobox-chip-remove')).toBeNull();
  });

  it('offers no chips for a single combobox', async () => {
    mountCombobox({ defaultValue: 'vue' });
    await nextTick();
    expect(document.querySelector('.form-combobox-chips')).toBeNull();
  });

  it('turns typed text into a value when creatable, and says so', async () => {
    const w = mountCombobox({ creatable: true });
    await type('Qwik');

    option('Create “Qwik”').click();
    await settle();

    expect(w.emitted('create')).toEqual([['Qwik']]);
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['Qwik']);
  });

  describe('presets', () => {
    const PRESETS = [
      { label: 'Signals', values: ['svelte', 'solid'] },
      { label: 'Everything', values: ['vue', 'svelte', 'solid'] }
    ];
    const preset = (label: string) =>
      [...document.querySelectorAll<HTMLElement>('.form-listbox-presets [data-part="preset"]')].find(
        (el) => el.textContent?.trim() === label
      )!;
    const open = async () => {
      input().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
    };

    it('adds and takes back a preset, showing its values as chips', async () => {
      const w = mountCombobox({ multiple: true, presets: PRESETS, defaultValue: ['vue'] });
      await open();

      preset('Signals').click();
      await settle();
      expect(w.emitted('update:modelValue')!.at(-1)).toEqual([['vue', 'svelte', 'solid']]);
      expect(chips()).toEqual(['Vue', 'Svelte', 'Solid']);
      expect(preset('Signals').getAttribute('aria-pressed')).toBe('true');

      preset('Signals').click();
      await settle();
      expect(w.emitted('update:modelValue')!.at(-1)).toEqual([['vue']]);
    });

    it('replaces the selection with exactly its values', async () => {
      const w = mountCombobox({ multiple: true, presets: PRESETS, defaultValue: ['vue'] });
      await open();

      preset('Signals').parentElement!.querySelector<HTMLElement>('[data-part="preset-replace"]')!.click();
      await settle();
      expect(w.emitted('update:modelValue')!.at(-1)).toEqual([['svelte', 'solid']]);
    });

    it('follows what is typed', async () => {
      mountCombobox({ multiple: true, presets: PRESETS });
      await type('every');
      expect(preset('Everything')).toBeTruthy();
      expect(preset('Signals')).toBeUndefined();
    });

    it('names the loose ones with presets-label, folding them from a heading with a chevron', async () => {
      mountCombobox({ multiple: true, presets: PRESETS, presetsLabel: 'Saved' });
      await open();
      const heading = document.querySelector<HTMLElement>('.form-listbox-presets [data-part="preset-group-trigger"]')!;

      expect(heading.querySelector('[data-part="preset-group-label"]')!.textContent?.trim()).toBe('Saved');
      expect(heading.querySelector('.form-listbox-preset-chevron')).not.toBeNull();
      expect(heading.getAttribute('aria-expanded')).toBe('true');

      heading.click();
      await settle();
      expect(heading.getAttribute('aria-expanded')).toBe('false');
      expect(preset('Signals').closest('[inert]')).not.toBeNull();
    });

    it('lays the presets out in preset-columns, widening the popup', async () => {
      mountCombobox({ multiple: true, presets: PRESETS, presetColumns: 3 });
      await open();
      const popup = document.querySelector<HTMLElement>('.form-listbox-popup')!;

      expect(popup.dataset.presetColumns).toBe('3');
      expect(popup.style.getPropertyValue('--form-listbox-preset-columns')).toBe('3');
    });

    it('holds up under hundreds of presets: folds, searches and applies a big one', async () => {
      const options = Array.from({ length: 620 }, (_, index) => ({ value: `c${index}`, label: `Company ${index}` }));
      const presets = [
        { label: 'Every one', values: options.map((option) => option.value) },
        {
          label: 'Companies',
          collapsed: true,
          presets: options.slice(0, 330).map((option) => ({ label: option.label, values: [option.value] }))
        }
      ];
      const w = mountCombobox({ multiple: true, options, presets, flatten: 5 });
      await open();

      const panel = () => [...document.querySelectorAll('.form-listbox-presets [data-part="preset-group-panel"]')].at(-1)!;
      expect(panel().querySelectorAll('[data-part="preset"]')).toHaveLength(330);
      expect(panel().hasAttribute('inert')).toBe(true);

      await type('company 32');
      // Company 32 and 320–329: the folded group opens for its hits.
      expect(panel().hasAttribute('inert')).toBe(false);
      expect(panel().querySelectorAll('[data-part="preset"]')).toHaveLength(11);

      await type('');
      preset('Every one').click();
      await settle();
      expect((w.emitted('update:modelValue')!.at(-1) as string[][])[0]).toHaveLength(620);
    });

    it('keeps the scroll arrows with the list, under the presets', async () => {
      mountCombobox({ multiple: true, presets: PRESETS });
      await open();
      const viewport = document.querySelector('.form-listbox-viewport')!;

      expect(viewport.querySelector('.form-listbox-list')).not.toBeNull();
      expect(viewport.previousElementSibling!.classList.contains('form-listbox-presets')).toBe(true);
      // Presets and list scroll as one body, capped by the popup.
      expect(viewport.parentElement!.classList.contains('form-listbox-body')).toBe(true);
    });

    it('draws each preset title on one line, the whole of it in its title', async () => {
      mountCombobox({ multiple: true, presets: PRESETS });
      await open();
      const label = preset('Signals').querySelector<HTMLElement>('.form-listbox-preset-label')!;

      expect(label.textContent).toBe('Signals');
      expect(label.title).toBe('Signals');
    });

    it('ticks a preset while all of it is chosen, its heading naming the section', async () => {
      mountCombobox({ multiple: true, presets: PRESETS, presetsLabel: 'Saved', defaultValue: ['svelte', 'solid'] });
      await open();
      const check = (label: string) => preset(label).querySelector('.form-listbox-preset-check')!;
      const heading = document.querySelector<HTMLElement>('[data-part="preset-group-trigger"]')!;

      expect(check('Signals').querySelector('svg')).not.toBeNull();
      expect(check('Everything').querySelector('svg')).toBeNull();
      expect(check('Signals').getAttribute('aria-hidden')).toBe('true');
      // The heading's label, which names the group, holds the name alone.
      expect(document.getElementById(heading.parentElement!.getAttribute('aria-labelledby')!)!.textContent!.trim()).toBe('Saved');
    });

    it('shows none for a single combobox', async () => {
      mountCombobox({ presets: PRESETS });
      await open();
      expect(document.querySelector('.form-listbox-presets [data-part="preset"]')).toBeNull();
    });
  });

  it('offers to clear a selection unless clearable is off', async () => {
    const w = mountCombobox({ defaultValue: 'vue' });
    await nextTick();
    clearButton()!.click();
    await settle();
    expect(w.emitted('update:modelValue')).toEqual([[null]]);
    w.unmount();

    mountCombobox({ defaultValue: 'vue', clearable: false });
    await nextTick();
    expect(clearButton()).toBeNull();
  });

  it('passes the field state down to the input', async () => {
    mountCombobox({ disabled: true, required: true });
    await nextTick();

    expect(input().disabled).toBe(true);
    expect(input().getAttribute('aria-required')).toBe('true');
  });

  it('submits its value under its name', async () => {
    mountCombobox({ name: 'framework', defaultValue: 'solid' });
    await nextTick();

    const hidden = document.querySelector<HTMLInputElement>('input[type="hidden"][name="framework"]')!;
    expect(hidden.value).toBe('solid');
  });

  it('renders options through its slot', async () => {
    mountCombobox({}, { option: ({ label }: { label: string }) => h('em', label.toUpperCase()) });
    await type('v');
    expect(document.querySelector('[role="option"] em')!.textContent).toBe('VUE');
  });
});
