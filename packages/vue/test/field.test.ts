import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { useField, provideFieldContext } from '../src/shared/use-field';
import { useInput } from '../src/shared/use-input';
import {
  FieldRoot,
  FieldLabel,
  FieldGroup,
  Addon,
  Input,
  FieldDescription,
  FieldError,
  CheckboxRoot,
  SwitchRoot,
  RadioGroup,
  RadioRoot,
} from '../src';

/**
 * What the field itself owns, now that it holds no value. Anything else in a
 * test's props configures the control inside it.
 */
const FIELD_PROPS = new Set([
  'disabled',
  'readOnly',
  'required',
  'invalid',
  'touched',
  'dirty',
  'id',
  'as',
  'class',
]);

/** Mounts a field containing a labeled input, or whatever `render` produces. */
function mountField(props: Record<string, any> = {}, render?: () => any) {
  const fieldProps: Record<string, any> = {};
  const inputProps: Record<string, any> = {};
  for (const [key, value] of Object.entries(props)) {
    (FIELD_PROPS.has(key) ? fieldProps : inputProps)[key] = value;
  }

  const Host = defineComponent({
    setup() {
      return () =>
        h(FieldRoot as any, { class: 'field', ...fieldProps }, () =>
          render ? render() : [h(FieldLabel as any, () => 'Email'), h(Input as any, inputProps)],
        );
    },
  });
  return mount(Host, { attachTo: document.body });
}

const root = () => document.querySelector<HTMLElement>('.field')!;
const input = () => document.querySelector<HTMLInputElement>('input')!;
const label = () => document.querySelector<HTMLLabelElement>('label')!;

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

/** Types `text` the way a browser would: DOM value first, then the event. */
async function type(text: string) {
  const el = input();
  el.value = text;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  await nextTick();
}

/** Fires the event a browser fires before it changes the value. */
function beforeInput(data: string, inputType = 'insertText') {
  const el = input();
  try {
    el.setSelectionRange(el.value.length, el.value.length);
  } catch {
    // `number` and friends expose no selection.
  }
  const event = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    data,
    inputType,
  });
  el.dispatchEvent(event);
  return event;
}

/** Types one character at a time the way a browser does: gate first, then commit. */
async function typeChars(text: string) {
  for (const character of text) {
    if (beforeInput(character).defaultPrevented) {
      continue;
    }
    const el = input();
    el.value += character;
    el.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: character }),
    );
    await nextTick();
  }
  return input().value;
}

/** Fires the event a browser fires after it has already changed the value. */
async function inputEvent(value: string, inputType = 'insertText') {
  const el = input();
  el.value = value;
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType, data: value.at(-1) }));
  await nextTick();
}

describe('Field', () => {
  describe('association', () => {
    it('points the label at the control', () => {
      mountField();
      expect(label().getAttribute('for')).toBe(input().id);
      expect(input().id).toBeTruthy();
    });

    it('also names the control through aria-labelledby, so a non-label tag still works', () => {
      mountField({}, () => [
        h(FieldLabel as any, { as: 'span' }, () => 'Email'),
        h(Input as any),
      ]);
      const span = document.querySelector<HTMLElement>('span')!;
      expect(input().getAttribute('aria-labelledby')).toBe(span.id);
      expect(span.hasAttribute('for')).toBe(false);
    });

    it('leaves aria-labelledby off when there is no label', () => {
      mountField({}, () => [h(Input as any)]);
      expect(input().hasAttribute('aria-labelledby')).toBe(false);
    });

    it('describes the control with its description', async () => {
      mountField({}, () => [h(Input as any), h(FieldDescription as any, () => 'A hint')]);
      await nextTick();
      const description = document.querySelector<HTMLElement>('p')!;
      expect(input().getAttribute('aria-describedby')).toBe(description.id);
    });

    it('joins several describing messages', async () => {
      mountField({ invalid: true }, () => [
        h(Input as any),
        h(FieldDescription as any, () => 'A hint'),
        h(FieldError as any, () => 'Required'),
      ]);
      await nextTick();
      const ids = input().getAttribute('aria-describedby')!.split(' ');
      expect(ids).toHaveLength(2);
      expect(ids).toContain(document.querySelector('p')!.id);
      expect(ids).toContain(document.querySelector('div[id]')!.id);
    });

    it('drops the reference when the description goes away', async () => {
      const show = ref(true);
      const Host = defineComponent({
        setup: () => () =>
          h(FieldRoot as any, null, () => [
            h(Input as any),
            show.value ? h(FieldDescription as any, () => 'A hint') : null,
          ]),
      });
      mount(Host, { attachTo: document.body });
      await nextTick();
      expect(input().hasAttribute('aria-describedby')).toBe(true);

      show.value = false;
      await nextTick();
      expect(input().hasAttribute('aria-describedby')).toBe(false);
    });
  });

  describe('value', () => {
    it('reports the typed value and marks the field filled and dirty', async () => {
      const onUpdate = vi.fn();
      mountField({ 'onUpdate:modelValue': onUpdate });
      expect(root().hasAttribute('data-filled')).toBe(false);

      await type('hello');

      expect(onUpdate).toHaveBeenCalledWith('hello');
      expect(root().hasAttribute('data-filled')).toBe(true);
      expect(root().hasAttribute('data-dirty')).toBe(true);
    });

    it('is not dirty once the value returns to where it started', async () => {
      mountField({ defaultValue: 'start' });
      await type('changed');
      expect(root().hasAttribute('data-dirty')).toBe(true);
      await type('start');
      expect(root().hasAttribute('data-dirty')).toBe(false);
    });

    it('starts filled when a default value is supplied', async () => {
      mountField({ defaultValue: 'start' });
      expect(input().value).toBe('start');
      // The control reports emptiness upward as it mounts, so the field learns
      // of it a tick after its own first render.
      await nextTick();
      expect(root().hasAttribute('data-filled')).toBe(true);
    });

    it('snaps a controlled value back when the owner does not accept the change', async () => {
      mountField({ modelValue: 'fixed' });
      await type('typed');
      // The owner never wrote the value back, so the control must not keep it.
      expect(input().value).toBe('fixed');
    });

    it('follows a controlled value that the owner does accept', async () => {
      const value = ref('one');
      const Host = defineComponent({
        setup: () => () =>
          h(FieldRoot as any, null, () => [
            h(Input as any, {
              modelValue: value.value,
              'onUpdate:modelValue': (next: string) => (value.value = next),
            }),
          ]),
      });
      mount(Host, { attachTo: document.body });
      await type('two');
      expect(value.value).toBe('two');
      await nextTick();
      expect(input().value).toBe('two');
    });

    it('ignores input while an IME composition is in flight', async () => {
      const onUpdate = vi.fn();
      mountField({ 'onUpdate:modelValue': onUpdate });
      const el = input();

      el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      el.value = 'に';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await nextTick();
      expect(onUpdate).not.toHaveBeenCalled();

      el.value = '日本';
      el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
      await nextTick();
      expect(onUpdate.mock.calls).toEqual([['日本']]);
    });
  });

  describe('state hooks', () => {
    it('tracks focus and marks the field touched once it is left', async () => {
      mountField();
      input().focus();
      await nextTick();
      expect(root().hasAttribute('data-focused')).toBe(true);
      expect(root().hasAttribute('data-touched')).toBe(false);

      input().blur();
      await nextTick();
      expect(root().hasAttribute('data-focused')).toBe(false);
      expect(root().hasAttribute('data-touched')).toBe(true);
    });

    it('puts the same hooks on every part', () => {
      mountField({ invalid: true, disabled: true }, () => [
        h(FieldLabel as any, () => 'Email'),
        h(Input as any),
        h(FieldDescription as any, () => 'A hint'),
      ]);
      for (const el of [root(), label(), input(), document.querySelector<HTMLElement>('p')!]) {
        expect(el.hasAttribute('data-invalid')).toBe(true);
        expect(el.hasAttribute('data-disabled')).toBe(true);
      }
    });

    it('forwards the native control attributes, announcing required rather than enforcing it', () => {
      mountField({ disabled: true, readOnly: true, required: true, name: 'email' });
      expect(input().disabled).toBe(true);
      expect(input().readOnly).toBe(true);
      expect(input().required).toBe(false);
      expect(input().getAttribute('aria-required')).toBe('true');
      expect(input().name).toBe('email');
      expect(input().getAttribute('aria-invalid')).toBeNull();
    });

    it('marks the control invalid for assistive technology', () => {
      mountField({ invalid: true });
      expect(input().getAttribute('aria-invalid')).toBe('true');
    });

    it('lets a form library own touched and dirty', async () => {
      mountField({ touched: true, dirty: true });
      expect(root().hasAttribute('data-touched')).toBe(true);
      expect(root().hasAttribute('data-dirty')).toBe(true);

      // The field must not overwrite what the owner supplied.
      input().focus();
      input().blur();
      await nextTick();
      expect(root().hasAttribute('data-touched')).toBe(true);
    });
  });

  describe('error message', () => {
    const errorEl = () => document.querySelector<HTMLElement>('div[id]');

    it('stays out of the DOM while the field is valid', () => {
      mountField({}, () => [h(Input as any), h(FieldError as any, () => 'Required')]);
      expect(document.body.textContent).not.toContain('Required');
    });

    it('appears when the field turns invalid and describes the control', async () => {
      const invalid = ref(false);
      const Host = defineComponent({
        setup: () => () =>
          h(FieldRoot as any, { invalid: invalid.value }, () => [
            h(Input as any),
            h(FieldError as any, () => 'Required'),
          ]),
      });
      mount(Host, { attachTo: document.body });
      expect(document.body.textContent).not.toContain('Required');

      invalid.value = true;
      await settle();
      expect(document.body.textContent).toContain('Required');
      expect(input().getAttribute('aria-describedby')).toBe(errorEl()!.id);

      invalid.value = false;
      await settle();
      expect(document.body.textContent).not.toContain('Required');
      expect(input().hasAttribute('aria-describedby')).toBe(false);
    });

    it('can be forced on regardless of validity', () => {
      mountField({}, () => [
        h(Input as any),
        h(FieldError as any, { match: true }, () => 'Always'),
      ]);
      expect(document.body.textContent).toContain('Always');
    });

    it('can be forced off while the field is invalid', () => {
      mountField({ invalid: true }, () => [
        h(Input as any),
        h(FieldError as any, { match: false }, () => 'Never'),
      ]);
      expect(document.body.textContent).not.toContain('Never');
    });

    it('carries the enter phase hook so it can animate in', async () => {
      const invalid = ref(false);
      const Host = defineComponent({
        setup: () => () =>
          h(FieldRoot as any, { invalid: invalid.value }, () => [
            h(Input as any),
            h(FieldError as any, () => 'Required'),
          ]),
      });
      mount(Host, { attachTo: document.body });

      invalid.value = true;
      await nextTick();
      expect(errorEl()!.hasAttribute('data-enter-from')).toBe(true);

      await settle();
      expect(errorEl()!.hasAttribute('data-enter-from')).toBe(false);
    });
  });

  describe('group', () => {
    /**
     * An `<input>` is a void element, so anything beside it is a sibling inside
     * the group. `<Addon>` is that sibling — the same part a select or
     * combobox trigger takes directly.
     */
    const mountGroup = (props: Record<string, any> = {}, end?: () => any) =>
      mountField(props, () => [
        h(FieldGroup as any, null, () => [
          h(Addon as any, { side: 'start' }, () => h('span', { class: 'icon' }, '@')),
          h(Input as any),
          end ? h(Addon as any, { side: 'end' }, end) : null,
        ]),
      ]);

    it('marks which end each slot sits at', () => {
      mountGroup({}, () => h('span', 'x'));
      const sides = [...document.querySelectorAll('[data-part="addon"]')].map((el) =>
        el.getAttribute('data-side'),
      );
      expect(sides).toEqual(['start', 'end']);
    });

    it('leaves the side off when none was given', () => {
      mountField({}, () => [
        h(FieldGroup as any, null, () => [
          h(Addon as any, null, () => '@'),
          h(Input as any),
        ]),
      ]);
      const slot = document.querySelector('[data-part="addon"]')!;
      expect(slot.hasAttribute('data-side')).toBe(false);
    });

    it('hands a press on the surrounding box to the control', async () => {
      mountGroup();
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      document.querySelector('.icon')!.dispatchEvent(event);
      await nextTick();

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(input());
    });

    it('leaves a press on an interactive adornment alone', async () => {
      mountGroup({}, () => h('button', { class: 'clear' }, 'x'));
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      document.querySelector('.clear')!.dispatchEvent(event);
      await nextTick();

      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).not.toBe(input());
    });

    it('does not steal focus for a disabled field', async () => {
      mountGroup({ disabled: true });
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      document.querySelector('.icon')!.dispatchEvent(event);
      await nextTick();
      expect(document.activeElement).not.toBe(input());
    });

    it('turns invalid with a number outside its limits, leaving the field alone', async () => {
      let slotInvalid: boolean | undefined;
      mountField({}, () => [
        h(FieldGroup as any, { class: 'group' }, (state: any) => {
          slotInvalid = state.invalid;
          return [h(Input as any, { type: 'number', min: 0, max: 99 })];
        }),
      ]);
      const group = () => document.querySelector('.group')!;

      await inputEvent('150');
      expect(group().hasAttribute('data-invalid')).toBe(true);
      expect(slotInvalid).toBe(true);
      expect(root().hasAttribute('data-invalid')).toBe(false);

      await inputEvent('15');
      expect(group().hasAttribute('data-invalid')).toBe(false);
      expect(slotInvalid).toBe(false);
    });
  });

  describe('constraints', () => {
    it('forwards every constraint attribute to the control', () => {
      mountField({
        type: 'number',
        minLength: 2,
        maxLength: 8,
        min: 1,
        max: 99,
        step: 0.5,
        pattern: '[0-9]+',
      });
      const el = input();
      expect(el.getAttribute('type')).toBe('text');
      expect(el.getAttribute('minlength')).toBe('2');
      expect(el.getAttribute('maxlength')).toBe('8');
      expect(el.getAttribute('min')).toBe('1');
      expect(el.getAttribute('max')).toBe('99');
      expect(el.getAttribute('step')).toBe('0.5');
      expect(el.getAttribute('pattern')).toBe('[0-9]+');
    });

    describe('maxLength', () => {
      it('refuses an insertion that would overrun it', () => {
        mountField({ maxLength: 3, defaultValue: 'abc' });
        expect(beforeInput('d').defaultPrevented).toBe(true);
      });

      it('allows an insertion that still fits', () => {
        mountField({ maxLength: 3, defaultValue: 'ab' });
        expect(beforeInput('c').defaultPrevented).toBe(false);
      });
    });

    describe('type="number"', () => {
      it('refuses letters', () => {
        mountField({ type: 'number' });
        expect(beforeInput('a').defaultPrevented).toBe(true);
      });

      it('accepts digits, a leading minus and one decimal point', () => {
        mountField({ type: 'number' });
        expect(beforeInput('5').defaultPrevented).toBe(false);
        expect(beforeInput('-').defaultPrevented).toBe(false);
        input().value = '1';
        expect(beforeInput('.').defaultPrevented).toBe(false);
      });

      it('refuses a second decimal point', () => {
        mountField({ type: 'number' });
        input().value = '1.5';
        expect(beforeInput('.').defaultPrevented).toBe(true);
      });

      it('renders a filtered text input, not a native number one', () => {
        // A native number input reports "10." and "-" as "" and exposes no
        // selection, so nothing typed on the way to a number survives it.
        mountField({ type: 'number' });
        expect(input().getAttribute('type')).toBe('text');
        expect(input().getAttribute('inputmode')).toBe('decimal');
      });

      it('types a decimal through to the end', async () => {
        const onUpdate = vi.fn();
        mountField({ type: 'number', 'onUpdate:modelValue': onUpdate });
        expect(await typeChars('10.50')).toBe('10.50');
        expect(onUpdate).toHaveBeenLastCalledWith('10.50');
      });

      it('types a negative through to the end', async () => {
        const onUpdate = vi.fn();
        mountField({ type: 'number', 'onUpdate:modelValue': onUpdate });
        expect(await typeChars('-20')).toBe('-20');
        expect(onUpdate).toHaveBeenLastCalledWith('-20');
      });

      it('holds the half-typed value rather than dropping it', async () => {
        mountField({ type: 'number' });
        expect(await typeChars('10.')).toBe('10.');
        expect(await typeChars('5')).toBe('10.5');
      });

      it('drops letters mid-word without disturbing the digits', async () => {
        mountField({ type: 'number' });
        expect(await typeChars('1a2')).toBe('12');
      });

      it('refuses a leading minus when the minimum rules negatives out', () => {
        mountField({ type: 'number', min: 0 });
        expect(beforeInput('-').defaultPrevented).toBe(true);
      });

      it('still allows a minus when negatives are in range', () => {
        mountField({ type: 'number', min: -10 });
        expect(beforeInput('-').defaultPrevented).toBe(false);
      });

      it('marks a number outside min and max invalid', async () => {
        mountField({ type: 'number', min: 1, max: 10, defaultValue: '5' });
        expect(input().hasAttribute('data-invalid')).toBe(false);
        expect(await typeChars('0')).toBe('50');
        expect(input().hasAttribute('data-invalid')).toBe(true);
        expect(input().getAttribute('aria-invalid')).toBe('true');
      });

      it('marks a number below min invalid', () => {
        mountField({ type: 'number', min: 1, defaultValue: '0' });
        expect(input().hasAttribute('data-invalid')).toBe(true);
      });

      it('marks a number off its step invalid, counting from min', () => {
        const valid = mountField({ type: 'number', min: 1, step: 2, defaultValue: '5' });
        expect(input().hasAttribute('data-invalid')).toBe(false);
        valid.unmount();
        mountField({ type: 'number', min: 1, step: 2, defaultValue: '4' });
        expect(input().hasAttribute('data-invalid')).toBe(true);
      });

      it('takes a decimal step without rounding errors', () => {
        mountField({ type: 'number', step: 0.1, defaultValue: '0.3' });
        expect(input().hasAttribute('data-invalid')).toBe(false);
      });

      it('leaves an empty or half-typed number valid', () => {
        const empty = mountField({ type: 'number', min: 1 });
        expect(input().hasAttribute('data-invalid')).toBe(false);
        empty.unmount();
        mountField({ type: 'number', min: -5, max: -1, defaultValue: '-' });
        expect(input().hasAttribute('data-invalid')).toBe(false);
      });

      it('leaves min and max to a text input', () => {
        mountField({ min: 1, defaultValue: '0' });
        expect(input().hasAttribute('data-invalid')).toBe(false);
      });
    });

    describe('filter', () => {
      it('takes a pattern source and anchors it', () => {
        mountField({ filter: '[0-9]*' });
        expect(beforeInput('4').defaultPrevented).toBe(false);
        expect(beforeInput('x').defaultPrevented).toBe(true);
      });

      it('takes a regular expression', () => {
        mountField({ filter: /^[a-z]*$/ });
        expect(beforeInput('q').defaultPrevented).toBe(false);
        expect(beforeInput('Q').defaultPrevented).toBe(true);
      });

      it('takes a predicate, and passes it the value it would produce', () => {
        const filter = vi.fn((next: string) => next.length < 2);
        mountField({ filter });
        expect(beforeInput('a').defaultPrevented).toBe(false);
        expect(filter).toHaveBeenCalledWith('a', '');
        input().value = 'ab';
        expect(beforeInput('c').defaultPrevented).toBe(true);
      });

      it('never blocks a deletion, even to a value it would reject', () => {
        mountField({ filter: '[0-9]+', defaultValue: '5' });
        expect(beforeInput('', 'deleteContentBackward').defaultPrevented).toBe(false);
      });

      it('overrides the filter a number type would supply', () => {
        mountField({ type: 'number', filter: '.*' });
        expect(beforeInput('a').defaultPrevented).toBe(false);
      });

      it('fails open when the source does not compile', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        mountField({ filter: '[unterminated' });
        expect(beforeInput('a').defaultPrevented).toBe(false);
        warn.mockRestore();
      });
    });

    describe('transform', () => {
      const commit = () => input().dispatchEvent(new Event('change', { bubbles: true }));
      const commas = (value: string) => value.replace(/\s+/g, ',');

      it('leaves the typed text alone until it is committed', async () => {
        const onUpdate = vi.fn();
        mountField({ transform: commas, 'onUpdate:modelValue': onUpdate });
        await type('a b');
        expect(onUpdate).toHaveBeenLastCalledWith('a b');
        expect(input().value).toBe('a b');

        commit();
        await nextTick();
        expect(onUpdate).toHaveBeenLastCalledWith('a,b');
        expect(input().value).toBe('a,b');
      });

      it('is not applied to a value the app sets', async () => {
        mountField({ transform: commas, defaultValue: 'a b' });
        await nextTick();
        expect(input().value).toBe('a b');
      });

      it('is skipped when the caller prevents the internal handler', async () => {
        const onUpdate = vi.fn();
        mountField({
          transform: commas,
          'onUpdate:modelValue': onUpdate,
          onChange: (event: any) => event.preventInternalHandler()
        });
        await type('a b');
        commit();
        await nextTick();
        expect(onUpdate).toHaveBeenLastCalledWith('a b');
      });
    });

    describe('pattern', () => {
      it('does not restrict typing, so a half-typed value can still be reached', () => {
        // The finished value needs three digits, a dash and four more. Blocking
        // on the pattern would refuse the first digit and jam the control.
        mountField({ pattern: '\\d{3}-\\d{4}' });
        expect(beforeInput('5').defaultPrevented).toBe(false);
      });
    });

    describe('when beforeinput is not honored', () => {
      it('puts back a value that got through anyway', async () => {
        const onUpdate = vi.fn();
        mountField({ filter: '[0-9]*', 'onUpdate:modelValue': onUpdate });

        await inputEvent('abc');

        expect(input().value).toBe('');
        expect(onUpdate).not.toHaveBeenCalled();
      });

      it('commits a value that passes', async () => {
        const onUpdate = vi.fn();
        mountField({ filter: '[0-9]*', 'onUpdate:modelValue': onUpdate });

        await inputEvent('123');

        expect(input().value).toBe('123');
        expect(onUpdate).toHaveBeenCalledWith('123');
      });

      it('leaves deletions alone, even to a value the filter rejects', async () => {
        const onUpdate = vi.fn();
        mountField({ filter: '[0-9]+', defaultValue: '5', 'onUpdate:modelValue': onUpdate });

        await inputEvent('', 'deleteContentBackward');

        expect(onUpdate).toHaveBeenCalledWith('');
      });
    });
  });

  describe('headless use', () => {
    it('works without any of the components', async () => {
      const onChange = vi.fn();
      // Two composables now, because the split is the point: the field
      // coordinates, the input holds the value.
      const Control = defineComponent({
        setup() {
          const input = useInput({ name: 'email', onChange });
          return () => h('input', input.controlProps.value);
        },
      });
      const Headless = defineComponent({
        setup() {
          const field = useField();
          provideFieldContext(field);
          return () =>
            h('div', field.rootProps.value, [
              h('label', field.labelProps.value, 'Email'),
              h(Control),
            ]);
        },
      });
      mount(Headless, { attachTo: document.body });

      expect(label().getAttribute('for')).toBe(input().id);
      await type('typed');
      expect(onChange).toHaveBeenCalledWith('typed');
    });
  });
});

describe('touched, filled and dirty on toggle controls', () => {
  const control = (selector: string) => document.querySelector<HTMLElement>(selector)!;

  it.each([
    ['checkbox', () => h(CheckboxRoot as any, { class: 'control' })],
    ['switch', () => h(SwitchRoot as any, { class: 'control' })],
  ])('%s is dirty once toggled and touched once left', async (_, render) => {
    mountField({}, render);
    const el = control('.control');

    el.focus();
    expect(root().hasAttribute('data-filled')).toBe(false);

    el.click();
    await nextTick();
    expect(root().hasAttribute('data-dirty')).toBe(true);
    expect(root().hasAttribute('data-filled')).toBe(true);
    expect(root().hasAttribute('data-touched')).toBe(false);

    el.blur();
    await nextTick();
    expect(root().hasAttribute('data-touched')).toBe(true);

    el.click();
    await nextTick();
    expect(root().hasAttribute('data-dirty')).toBe(false);
  });

  it('radio group is touched only once focus leaves the group', async () => {
    mountField({}, () =>
      h(RadioGroup as any, null, () => [
        h(RadioRoot as any, { value: 'a', class: 'a' }),
        h(RadioRoot as any, { value: 'b', class: 'b' }),
      ]),
    );

    control('.a').focus();
    control('.b').focus();
    await nextTick();
    expect(root().hasAttribute('data-touched')).toBe(false);

    expect(root().hasAttribute('data-filled')).toBe(false);

    control('.b').click();
    await nextTick();
    expect(root().hasAttribute('data-dirty')).toBe(true);
    expect(root().hasAttribute('data-filled')).toBe(true);

    control('.b').blur();
    await nextTick();
    expect(root().hasAttribute('data-touched')).toBe(true);
  });
});
