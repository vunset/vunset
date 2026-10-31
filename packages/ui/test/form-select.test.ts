import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { FormSelect } from '../src';

const OPTIONS = [
  {
    label: 'Europe',
    options: [
      { value: 'pl', label: 'France' },
      { value: 'es', label: 'Spain' }
    ]
  },
  { value: 'us', label: 'United States' }
];

const trigger = () => document.querySelector<HTMLElement>('[data-part="trigger"]')!;
const label = () => document.querySelector<HTMLLabelElement>('.form-label')!;
const option = (text: string) =>
  [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((el) => el.textContent?.trim() === text)!;
const valueText = () => document.querySelector('.form-select-value')!.textContent!.trim();
const clearButton = () => document.querySelector<HTMLElement>('[data-part="clear"]');

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

async function open() {
  trigger().click();
  await settle();
}

let wrapper: VueWrapper | undefined;

function mountSelect(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  wrapper = mount(FormSelect as any, {
    props: { label: 'Country', options: OPTIONS, placeholder: 'Pick one', ...props },
    slots,
    attachTo: document.body
  });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('FormSelect', () => {
  it('labels the trigger, and a click on the label focuses it', async () => {
    mountSelect();
    await nextTick();

    expect(trigger().getAttribute('aria-labelledby')).toBe(label().id);
    label().click();
    expect(document.activeElement).toBe(trigger());
  });

  it('shows the placeholder, then the chosen option', async () => {
    const w = mountSelect();
    expect(valueText()).toBe('Pick one');

    await open();
    option('Spain').click();
    await settle();

    expect(w.emitted('update:modelValue')).toEqual([['es']]);
    expect(valueText()).toBe('Spain');
  });

  it('is described by its help and its error', async () => {
    mountSelect({ help: 'Where you live', error: 'Pick a country' });
    await nextTick();

    const ids = trigger().getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual([
      'Where you live',
      'Pick a country'
    ]);
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
  });

  it('offers to clear a selection only when clearable', async () => {
    const w = mountSelect({ defaultValue: 'pl', clearable: true });
    await nextTick();
    clearButton()!.click();
    await settle();
    expect(w.emitted('update:modelValue')).toEqual([[null]]);
    w.unmount();

    mountSelect({ defaultValue: 'pl' });
    await nextTick();
    expect(clearButton()).toBeNull();
  });

  it('searches, and says when nothing matches', async () => {
    mountSelect({ searchable: true, searchPlaceholder: 'Find a country', emptyText: 'Nothing here' });
    await open();

    const search = document.querySelector<HTMLInputElement>('.form-select-search')!;
    expect(search.placeholder).toBe('Find a country');
    // Above the scrolling body, so it stays put however long the presets and list run.
    expect(search.nextElementSibling!.classList.contains('form-listbox-body')).toBe(true);

    search.value = 'zzz';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();

    expect(document.querySelector('.form-listbox-empty')!.textContent!.trim()).toBe('Nothing here');
  });

  it('passes the field state down to the select', async () => {
    mountSelect({ disabled: true, readOnly: true, required: true });
    await nextTick();

    expect(trigger().getAttribute('aria-disabled')).toBe('true');
    expect(trigger().getAttribute('aria-readonly')).toBe('true');
    expect(trigger().getAttribute('aria-required')).toBe('true');
  });

  it('submits its value under its name', async () => {
    mountSelect({ name: 'country', defaultValue: 'us' });
    await nextTick();

    const hidden = document.querySelector<HTMLInputElement>('input[type="hidden"][name="country"]')!;
    expect(hidden.value).toBe('us');
  });

  it('selects several when multiple', async () => {
    const w = mountSelect({ multiple: true, modelValue: ['pl'] });
    await open();
    option('United States').click();
    await settle();

    expect(w.emitted('update:modelValue')).toEqual([[['pl', 'us']]]);
  });

  it('takes a value set from code on a model that started out undefined', async () => {
    const w = mountSelect({ multiple: true, modelValue: undefined });
    await nextTick();
    expect(valueText()).toBe('Pick one');

    await w.setProps({ modelValue: ['pl'] });
    expect(valueText()).toBe('France');
  });

  it('writes undefined once the last option is dropped, with v-model.optional', async () => {
    const w = mountSelect({ multiple: true, modelValue: ['pl'], modelModifiers: { optional: true } });
    await open();
    option('France').click();
    await settle();

    expect(w.emitted('update:modelValue')).toEqual([[undefined]]);
  });

  it('keeps its own value without a v-model', async () => {
    mountSelect({ multiple: true });
    await open();
    option('France').click();
    await settle();

    expect(valueText()).toBe('France');
  });

  it('renders options and the value through its slots', async () => {
    mountSelect(
      { defaultValue: 'pl' },
      {
        value: ({ summary }: { summary: string }) => h('strong', `→ ${summary}`),
        option: ({ label }: { label: string }) => h('em', label.toUpperCase())
      }
    );
    await open();

    expect(valueText()).toBe('→ France');
    expect(document.querySelector('[role="option"] em')!.textContent).toBe('FRANCE');
  });
});
