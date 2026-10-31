import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { FormRange } from '../src';

const inputs = () => [...document.querySelectorAll<HTMLInputElement>('input[type="range"]')];
const label = () => document.querySelector<HTMLElement>('.form-label')!;
const valueText = () => document.querySelector('.form-range-value')?.textContent?.trim();

function press(input: HTMLInputElement, key: string) {
  input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

let wrapper: VueWrapper | undefined;

function mountRange(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  wrapper = mount(FormRange as any, { props: { label: 'Volume', ...props }, slots, attachTo: document.body });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('FormRange', () => {
  it('labels a single thumb through the field', () => {
    mountRange({ defaultValue: 40 });

    expect(inputs()).toHaveLength(1);
    expect((label() as HTMLLabelElement).htmlFor).toBe(inputs()[0]!.id);
  });

  it('steps with the keyboard, emitting the new value', async () => {
    const w = mountRange({ defaultValue: 40, step: 5 });
    press(inputs()[0]!, 'ArrowRight');
    await nextTick();

    expect(w.emitted('update:modelValue')).toEqual([[45]]);
    expect(valueText()).toBe('45');
  });

  it('renders a thumb per value, each named by the label', async () => {
    const w = mountRange({ defaultValue: [20, 80], label: 'Price' });
    await nextTick();

    expect(inputs()).toHaveLength(2);
    for (const input of inputs()) expect(input.getAttribute('aria-labelledby')).toBe(label().id);
    expect(inputs().map((input) => input.getAttribute('aria-valuetext'))).toEqual(['20 start range', '80 end range']);

    press(inputs()[1]!, 'ArrowLeft');
    await nextTick();
    expect(w.emitted('update:modelValue')).toEqual([[[20, 79]]]);
  });

  it('names the thumbs from thumb-labels', () => {
    mountRange({ defaultValue: [20, 80], thumbLabels: ['Lowest', 'Highest'] });
    expect(inputs().map((input) => input.getAttribute('aria-label'))).toEqual(['Lowest', 'Highest']);
  });

  it('formats the value it shows and announces', () => {
    mountRange({ defaultValue: 0.25, min: 0, max: 1, step: 0.05, format: { style: 'percent' }, locale: 'en-US' });

    expect(valueText()).toBe('25%');
    expect(inputs()[0]!.getAttribute('aria-valuetext')).toBe('25%');
  });

  it('hides the value when asked', () => {
    mountRange({ defaultValue: 40, showValue: false });
    expect(valueText()).toBeUndefined();
  });

  it('renders the value through its slot', () => {
    mountRange(
      { defaultValue: [10, 30] },
      { value: ({ formattedValues }: { formattedValues: string[] }) => h('b', formattedValues.join(' to ')) }
    );
    expect(valueText()).toBe('10 to 30');
  });

  it('is described by its help and its error, and marked invalid', async () => {
    mountRange({ defaultValue: 40, help: 'Out of 100', error: 'Too loud' });
    await nextTick();

    const ids = inputs()[0]!.getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual(['Out of 100', 'Too loud']);
    expect(document.querySelector('.form-range')!.hasAttribute('data-invalid')).toBe(true);
  });

  it('disables every thumb', () => {
    mountRange({ defaultValue: [20, 80], disabled: true });
    expect(inputs().every((input) => input.disabled)).toBe(true);
  });

  it('submits each value under its name', () => {
    mountRange({ defaultValue: [20, 80], name: 'price' });
    expect(inputs().map((input) => [input.name, input.value])).toEqual([
      ['price', '20'],
      ['price', '80']
    ]);
  });

  it('runs vertically', () => {
    mountRange({ defaultValue: 40, orientation: 'vertical' });
    expect(document.querySelector('.form-range')!.getAttribute('data-orientation')).toBe('vertical');
    expect(inputs()[0]!.getAttribute('aria-orientation')).toBe('vertical');
  });
});
