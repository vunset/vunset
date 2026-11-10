import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement, FieldRoot, FieldLabel } from '../src';
import { stepValue } from '../src/components/number-field/NumberFieldRoot.vue';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  vi.useRealTimers();
});

function mountField(rootProps: Record<string, any> = {}, initial: number | null = null) {
  const model = ref<number | null>(initial);
  const Host = defineComponent({
    setup: () => () =>
      h(
        NumberFieldRoot as any,
        { modelValue: model.value, 'onUpdate:modelValue': (next: number | null) => (model.value = next), ...rootProps },
        {
          default: () => [
            h(NumberFieldDecrement as any, null, { default: () => '−' }),
            h(NumberFieldInput as any),
            h(NumberFieldIncrement as any, null, { default: () => '+' })
          ]
        }
      )
  });
  wrapper = mount(Host, { attachTo: document.body });
  return { model };
}

const input = () => document.querySelector<HTMLInputElement>('[data-part="input"]')!;
const increment = () => document.querySelector<HTMLButtonElement>('[data-part="increment"]')!;
const decrement = () => document.querySelector<HTMLButtonElement>('[data-part="decrement"]')!;

async function typeText(text: string) {
  const el = input();
  el.focus();
  el.value = text;
  el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: text.slice(-1), bubbles: true }));
  await nextTick();
}

async function blur() {
  input().blur();
  await nextTick();
}

async function key(name: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init });
  input().dispatchEvent(event);
  await nextTick();
  return event;
}

function wouldInsert(text: string, current = '') {
  const el = input();
  el.value = current;
  el.setSelectionRange(current.length, current.length);
  const event = new InputEvent('beforeinput', { inputType: 'insertText', data: text, bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return !event.defaultPrevented;
}

describe('stepValue', () => {
  it('lands on the grid counted from its base', () => {
    expect(stepValue(1.5, 1, 1, 0)).toBe(2);
    expect(stepValue(1.5, 1, -1, 0)).toBe(1);
    expect(stepValue(2, 1, 1, 0)).toBe(3);
    expect(stepValue(3, 5, 1, 1)).toBe(6);
  });

  it('rounds away floating-point error', () => {
    expect(stepValue(0.2, 0.1, 1, 0)).toBe(0.3);
    expect(stepValue(0.30000000000000004, 0.1, 1, 0)).toBe(0.4);
  });
});

describe('NumberFieldRoot', () => {
  describe('typing', () => {
    it('writes the number as it is typed, and formats it on blur', async () => {
      const { model } = mountField();
      await typeText('1234.5');
      expect(model.value).toBe(1234.5);
      expect(input().value).toBe('1234.5');
      await blur();
      expect(input().value).toBe('1,234.5');
    });

    it('reads and writes in its locale and format', async () => {
      const { model } = mountField({ locale: 'de-DE', format: { style: 'currency', currency: 'EUR' } }, 1234.5);
      expect(input().value.replace(/\s/g, ' ')).toBe('1.234,50 €');
      await typeText('99,9');
      expect(model.value).toBe(99.9);
      await blur();
      expect(input().value.replace(/\s/g, ' ')).toBe('99,90 €');
    });

    it('writes null for empty text, and puts unreadable text back', async () => {
      const { model } = mountField({}, 5);
      await typeText('');
      expect(model.value).toBeNull();
      await typeText('-');
      await blur();
      expect(model.value).toBeNull();
      expect(input().value).toBe('');

      model.value = 7;
      await nextTick();
      expect(input().value).toBe('7');
    });

    it('clamps on commit', async () => {
      const { model } = mountField({ min: 0, max: 10 });
      await typeText('50');
      expect(model.value).toBe(50);
      await key('Enter');
      expect(model.value).toBe(10);
      expect(input().value).toBe('10');
    });

    it('refuses what could never be a number, and a minus when min rules it out', () => {
      mountField({ min: 0 });
      expect(wouldInsert('1')).toBe(true);
      expect(wouldInsert('.', '1')).toBe(true);
      expect(wouldInsert(',', '1')).toBe(true);
      expect(wouldInsert('a')).toBe(false);
      expect(wouldInsert('-')).toBe(false);
      wrapper!.unmount();

      mountField();
      expect(wouldInsert('-')).toBe(true);
    });
  });

  describe('stepping', () => {
    it('steps with the arrows, Shift and Page keys', async () => {
      const { model } = mountField({}, 5);
      await key('ArrowUp');
      expect(model.value).toBe(6);
      await key('ArrowDown', { shiftKey: true });
      expect(model.value).toBe(0);
      await key('PageUp');
      expect(model.value).toBe(10);
      expect(input().value).toBe('10');
    });

    it('starts from min, max or 0 when empty, clamped', async () => {
      const { model } = mountField({ min: 3, max: 8 });
      await key('ArrowUp');
      expect(model.value).toBe(3);
      model.value = null;
      await nextTick();
      await key('ArrowDown');
      expect(model.value).toBe(8);
    });

    it('goes to the ends with Home and End only when they exist', async () => {
      const { model } = mountField({ min: -5, max: 5 }, 1);
      await key('Home');
      expect(model.value).toBe(-5);
      await key('End');
      expect(model.value).toBe(5);
      wrapper!.unmount();

      mountField({}, 1);
      expect((await key('Home')).defaultPrevented).toBe(false);
    });

    it('shows the value a parent keeps when it turns a step down', async () => {
      const Host = defineComponent({
        setup: () => () =>
          h(NumberFieldRoot as any, { modelValue: 5, 'onUpdate:modelValue': () => {} }, { default: () => h(NumberFieldInput as any) })
      });
      wrapper = mount(Host, { attachTo: document.body });
      await key('ArrowUp');
      await nextTick();
      expect(input().value).toBe('5');
    });

    it('steps from the text being typed', async () => {
      const { model } = mountField({ step: 0.5 });
      await typeText('1.2');
      await key('ArrowUp');
      expect(model.value).toBe(1.5);
    });

    it('steps with the wheel only when asked and focused', async () => {
      const { model } = mountField({ wheel: true }, 1);
      input().dispatchEvent(new WheelEvent('wheel', { deltaY: -1, bubbles: true, cancelable: true }));
      expect(model.value).toBe(1);
      input().focus();
      const event = new WheelEvent('wheel', { deltaY: -1, bubbles: true, cancelable: true });
      input().dispatchEvent(event);
      expect(model.value).toBe(2);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('buttons', () => {
    it('step once at once, then repeat while held', async () => {
      vi.useFakeTimers();
      const { model } = mountField({}, 0);
      increment().dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true, cancelable: true }));
      expect(model.value).toBe(1);
      await vi.advanceTimersByTimeAsync(399);
      expect(model.value).toBe(1);
      await vi.advanceTimersByTimeAsync(1 + 60 * 3);
      expect(model.value).toBe(4);
      increment().dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(500);
      expect(model.value).toBe(4);
    });

    it('keep focus where it is, and stay out of the tab order', () => {
      mountField();
      const event = new PointerEvent('pointerdown', { button: 0, bubbles: true, cancelable: true });
      increment().dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(increment().getAttribute('tabindex')).toBe('-1');
      expect(increment().getAttribute('type')).toBe('button');
      expect(increment().getAttribute('aria-label')).toBe('Increase');
    });

    it('step once for a press and the click it ends in', async () => {
      const { model } = mountField({}, 0);
      increment().dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true, cancelable: true }));
      increment().dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      increment().click();
      await nextTick();
      expect(model.value).toBe(1);
    });

    it('step once on a click with no press before it', async () => {
      const { model } = mountField({}, 0);
      decrement().click();
      await nextTick();
      expect(model.value).toBe(-1);
    });

    it('turn off at their end of the range, and stop repeating there', async () => {
      vi.useFakeTimers();
      const { model } = mountField({ max: 3 }, 1);
      increment().dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true, cancelable: true }));
      await vi.advanceTimersByTimeAsync(2000);
      await nextTick();
      expect(model.value).toBe(3);
      expect(increment().disabled).toBe(true);
      expect(increment().hasAttribute('data-disabled')).toBe(true);
      expect(decrement().disabled).toBe(false);
    });

    it('turn off when read-only', () => {
      mountField({ readOnly: true }, 1);
      expect(increment().disabled).toBe(true);
      expect(decrement().disabled).toBe(true);
    });
  });

  describe('assistive technology and forms', () => {
    it('is a spinbutton announcing its value', () => {
      mountField({ min: 0, max: 100, format: { style: 'percent' } }, 0.25);
      expect(input().getAttribute('role')).toBe('spinbutton');
      expect(input().getAttribute('aria-valuenow')).toBe('0.25');
      expect(input().getAttribute('aria-valuetext')).toBe('25%');
      expect(input().getAttribute('aria-valuemax')).toBe('100');
      expect(input().getAttribute('inputmode')).toBe('decimal');
    });

    it('offers a digit keypad for whole numbers that cannot be negative', () => {
      mountField({ min: 0, format: { maximumFractionDigits: 0 } });
      expect(input().getAttribute('inputmode')).toBe('numeric');
    });

    it('follows a field and submits the plain number', async () => {
      const Host = defineComponent({
        setup: () => () =>
          h(FieldRoot as any, { name: 'qty' }, {
            default: () => [
              h(FieldLabel as any, null, { default: () => 'Quantity' }),
              h(NumberFieldRoot as any, { defaultValue: 1234 }, { default: () => h(NumberFieldInput as any) })
            ]
          })
      });
      wrapper = mount(Host, { attachTo: document.body });
      await nextTick();
      expect(document.querySelector('label')?.getAttribute('for')).toBe(input().id);
      expect(input().value).toBe('1,234');
      expect(input().getAttribute('name')).toBeNull();
      expect(document.querySelector<HTMLInputElement>('input[type="hidden"][name="qty"]')?.value).toBe('1234');
    });
  });
});
