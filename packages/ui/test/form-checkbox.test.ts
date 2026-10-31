import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { FormCheckbox } from '../src';

const boxes = () => [...document.querySelectorAll<HTMLElement>('[role="checkbox"]')];
const box = () => boxes()[0]!;
const labels = () => [...document.querySelectorAll<HTMLLabelElement>('.form-label')];

let wrapper: VueWrapper | undefined;

function mountBox(props: Record<string, unknown> = {}) {
  wrapper = mount(FormCheckbox as any, { props: { label: 'Accept the terms', ...props }, attachTo: document.body });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('FormCheckbox', () => {
  it('puts attrs on the checkbox, and class and style on the field', () => {
    mountBox({ label: undefined, 'aria-label': 'Select row', 'data-row': '3', class: 'row-box', style: 'margin: 1px' });

    expect(box().getAttribute('aria-label')).toBe('Select row');
    expect(box().dataset.row).toBe('3');
    expect(box().classList.contains('row-box')).toBe(false);
    const field = document.querySelector<HTMLElement>('.row-box')!;
    expect(field.contains(box())).toBe(true);
    expect(field.style.margin).toBe('1px');
  });

  it('reads a null model as unchecked', () => {
    mountBox({ modelValue: null });
    expect(box().getAttribute('aria-checked')).toBe('false');
  });

  it('labels the checkbox, and a click on the label toggles it', async () => {
    const w = mountBox();

    expect(labels()[0]!.htmlFor).toBe(box().id);
    labels()[0]!.click();
    await nextTick();

    expect(box().getAttribute('aria-checked')).toBe('true');
    expect(w.emitted('update:modelValue')).toEqual([[true]]);
  });

  it('adds and removes its value in an array v-model shared with others', async () => {
    const chosen = ref<string[]>(['vue']);
    wrapper = mount(
      defineComponent({
        render: () =>
          ['vue', 'ts'].map((value) =>
            h(FormCheckbox as any, {
              key: value,
              label: value,
              value,
              modelValue: chosen.value,
              'onUpdate:modelValue': (next: string[]) => (chosen.value = next)
            })
          )
      }),
      { attachTo: document.body }
    );

    expect(boxes().map((el) => el.getAttribute('aria-checked'))).toEqual(['true', 'false']);

    labels()[1]!.click();
    await nextTick();
    expect(chosen.value).toEqual(['vue', 'ts']);

    labels()[0]!.click();
    await nextTick();
    expect(chosen.value).toEqual(['ts']);
  });

  it('shows a dash, and reads as mixed, while indeterminate', () => {
    mountBox({ indeterminate: true });

    expect(box().getAttribute('aria-checked')).toBe('mixed');
    expect(box().querySelector('.form-checkbox-indicator path')!.getAttribute('d')).toBe('M6 12h12');
  });

  it('is described by its help and its error', async () => {
    mountBox({ help: 'You can read them first', error: 'Required to continue' });
    await nextTick();

    const ids = box().getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual([
      'You can read them first',
      'Required to continue'
    ]);
    expect(box().hasAttribute('data-invalid')).toBe(true);
  });

  it('is announced required, and submits its value under its name', async () => {
    mountBox({ required: true, name: 'terms', value: 'yes' });

    expect(box().getAttribute('aria-required')).toBe('true');
    const input = document.querySelector<HTMLInputElement>('input[name="terms"]')!;
    expect(input.required).toBe(false);
    expect(input.value).toBe('yes');
  });

  it('ignores the label while disabled', async () => {
    const w = mountBox({ disabled: true });

    labels()[0]!.click();
    await nextTick();

    expect(box().getAttribute('aria-checked')).toBe('false');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });
});
