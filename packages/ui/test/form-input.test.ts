import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { FormInput } from '../src';

const input = () => document.querySelector<HTMLInputElement>('.form-input-control')!;
const label = () => document.querySelector<HTMLLabelElement>('.form-label')!;
const clearButton = () => document.querySelector<HTMLButtonElement>('.form-clear');

function type(text: string) {
  input().value = text;
  input().dispatchEvent(new Event('input', { bubbles: true }));
}

let wrapper: VueWrapper | undefined;

function mountInput(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}, slots = {}) {
  wrapper = mount(FormInput as any, { props: { label: 'Email', ...props }, attrs, slots, attachTo: document.body });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('FormInput', () => {
  it('labels the input', () => {
    mountInput();
    expect(label().htmlFor).toBe(input().id);
  });

  it('binds v-model', async () => {
    const value = ref('a@b.c');
    wrapper = mount(
      defineComponent({
        render: () =>
          h(FormInput as any, { label: 'Email', modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) })
      }),
      { attachTo: document.body }
    );

    expect(input().value).toBe('a@b.c');
    type('x@y.z');
    await nextTick();
    expect(value.value).toBe('x@y.z');
  });

  it('puts class and style on the field, every other attribute on the input', () => {
    mountInput({}, { class: 'wide', style: 'margin: 1px', placeholder: 'you@example.com', autocomplete: 'email' });

    const field = document.querySelector<HTMLElement>('.form-field')!;
    expect(field.classList.contains('wide')).toBe(true);
    expect(field.style.margin).toBe('1px');
    expect(input().placeholder).toBe('you@example.com');
    expect(input().getAttribute('autocomplete')).toBe('email');
    expect(input().classList.contains('wide')).toBe(false);
  });

  it('shows a null model as empty, not the text "null"', () => {
    mountInput({ modelValue: null });
    expect(input().value).toBe('');
  });

  it('puts input-class on the input, and control-class on the box', () => {
    mountInput({ inputClass: 'centered', controlClass: 'boxed' });

    expect(input().classList.contains('centered')).toBe(true);
    expect(document.querySelector('.form-input')!.classList.contains('boxed')).toBe(true);
    expect(document.querySelector('.form-input')!.classList.contains('centered')).toBe(false);
  });

  it('trims with v-model.trim, and writes undefined for blank text with .trim.optional', async () => {
    const w = mountInput({ modelValue: '', modelModifiers: { trim: true } });
    type('  a  ');
    await nextTick();
    expect(w.emitted('update:modelValue')).toEqual([['a']]);
    w.unmount();

    const optional = mountInput({ modelValue: 'a', modelModifiers: { trim: true, optional: true } });
    type('   ');
    await nextTick();
    expect(optional.emitted('update:modelValue')).toEqual([[undefined]]);
  });

  it('turns numeric text into a number with v-model.number', async () => {
    const w = mountInput({ modelValue: '', modelModifiers: { number: true } });
    type('42');
    await nextTick();
    expect(w.emitted('update:modelValue')).toEqual([[42]]);
  });

  it('is described by its help and its error', async () => {
    mountInput({ help: 'For the receipt', error: 'Required' });
    await nextTick();

    const ids = input().getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual(['For the receipt', 'Required']);
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('offers a clear button while filled, which empties and refocuses it', async () => {
    const w = mountInput({ clearable: true, defaultValue: '' });
    expect(clearButton()).toBeNull();

    type('hello');
    await nextTick();
    clearButton()!.click();
    await nextTick();

    expect(input().value).toBe('');
    expect(document.activeElement).toBe(input());
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['']);
    expect(clearButton()).toBeNull();
  });

  it('offers no clear button when not clearable, disabled or read-only', async () => {
    mountInput({ defaultValue: 'x' });
    expect(clearButton()).toBeNull();
    wrapper!.unmount();

    mountInput({ defaultValue: 'x', clearable: true, disabled: true });
    expect(clearButton()).toBeNull();
    wrapper!.unmount();

    mountInput({ defaultValue: 'x', clearable: true, readOnly: true });
    expect(clearButton()).toBeNull();
  });

  it('passes the field state to the input', () => {
    mountInput({ disabled: true, required: true, name: 'email' });

    expect(input().disabled).toBe(true);
    expect(input().required).toBe(false);
    expect(input().getAttribute('aria-required')).toBe('true');
    expect(input().name).toBe('email');
  });

  it('gives a required field with no label what its corner mark is drawn from', async () => {
    mountInput({ label: undefined, required: true, 'aria-label': 'Search' });
    const field = document.querySelector<HTMLElement>('.form-field')!;

    // The stylesheet draws the mark on a required field with no label, until it has a value.
    expect(field.hasAttribute('data-required')).toBe(true);
    expect(field.querySelector(':scope > .form-label, :scope > .form-label-row')).toBeNull();
    expect(field.hasAttribute('data-filled')).toBe(false);

    type('vue');
    await nextTick();
    expect(field.hasAttribute('data-filled')).toBe(true);
  });

  it('keeps letters out of a number input', async () => {
    mountInput({ type: 'number', min: 0 });

    // A browser asks first and commits only what is let through.
    for (const character of '1a2') {
      const gate = new InputEvent('beforeinput', { bubbles: true, cancelable: true, data: character, inputType: 'insertText' });
      input().dispatchEvent(gate);
      if (!gate.defaultPrevented) type(input().value + character);
      await nextTick();
    }

    expect(input().value).toBe('12');
  });

  it('renders addons at either end', () => {
    mountInput({}, {}, { start: () => '@', end: () => '.com' });

    const addons = [...document.querySelectorAll('.form-input .form-addon')].map((el) => el.textContent);
    expect(addons).toEqual(['@', '.com']);
  });
});
