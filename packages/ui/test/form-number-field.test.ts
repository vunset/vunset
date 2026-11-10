import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { FormNumberField } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

const input = () => document.querySelector<HTMLInputElement>('.form-number-field-input')!;
const buttons = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.form-number-field-button'));

function render(props: Record<string, unknown> = {}, initial: number | null = 1) {
  const model = ref<number | null>(initial);
  const Host = defineComponent({
    setup: () => () =>
      h(FormNumberField as any, {
        modelValue: model.value,
        'onUpdate:modelValue': (next: number | null) => (model.value = next),
        ...props
      })
  });
  wrapper = mount(Host, { attachTo: document.body });
  return { model };
}

describe('FormNumberField', () => {
  it('is a labeled box with − and + around the input', () => {
    render({ label: 'Guests', min: 0 });
    const box = document.querySelector('.form-number-field')!;
    expect(box.classList.contains('form-control')).toBe(true);
    expect(buttons().map((button) => button.getAttribute('aria-label'))).toEqual(['Decrease', 'Increase']);
    expect(document.querySelector('label')?.getAttribute('for')).toBe(input().id);
  });

  it('steps with its buttons', async () => {
    const { model } = render();
    buttons()[1].click();
    await nextTick();
    expect(model.value).toBe(2);
    expect(input().value).toBe('2');
  });

  it('leaves the buttons out, and takes its own labels for them', () => {
    render({ buttons: false });
    expect(buttons()).toHaveLength(0);
    wrapper!.unmount();

    render({ incrementLabel: 'Mehr', decrementLabel: 'Weniger' });
    expect(buttons().map((button) => button.getAttribute('aria-label'))).toEqual(['Weniger', 'Mehr']);
  });

  it('puts its attrs on the input and its class on the field', () => {
    render({ class: 'mine', placeholder: 'Any', 'aria-describedby': 'x', controlClass: 'box', inputClass: 'text' });
    expect(document.querySelector('.form-field')?.classList.contains('mine')).toBe(true);
    expect(input().getAttribute('placeholder')).toBe('Any');
    expect(input().classList.contains('text')).toBe(true);
    expect(document.querySelector('.form-number-field')?.classList.contains('box')).toBe(true);
  });

  it('keeps its own value without v-model', async () => {
    wrapper = mount(FormNumberField as any, { props: { defaultValue: 4 }, attachTo: document.body });
    buttons()[0].click();
    await nextTick();
    expect(input().value).toBe('3');
  });

  it('is marked invalid by an error', () => {
    render({ error: 'Too many' });
    expect(document.querySelector('.form-number-field')?.hasAttribute('data-invalid')).toBe(true);
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });
});
