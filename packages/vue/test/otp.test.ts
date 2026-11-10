import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { OtpRoot, OtpInput, FieldRoot, FieldLabel, Group } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.documentElement.removeAttribute('dir');
});

function mountOtp(rootProps: Record<string, any> = {}, initial = '') {
  const model = ref(initial);
  const completed: string[] = [];
  const length = rootProps.length ?? 6;
  const Host = defineComponent({
    setup: () => () =>
      h(
        OtpRoot as any,
        {
          modelValue: model.value,
          'onUpdate:modelValue': (next: string) => (model.value = next),
          onComplete: (code: string) => completed.push(code),
          ...rootProps
        },
        { default: () => Array.from({ length }, (_, index) => h(OtpInput as any, { index, key: index })) }
      )
  });
  wrapper = mount(Host, { attachTo: document.body });
  return { model, completed };
}

const boxes = () => Array.from(document.querySelectorAll<HTMLInputElement>('[data-part="input"]'));
const box = (index: number) => boxes()[index];
const shown = () => boxes().map((el) => el.value || '_').join('');

async function type(index: number, data: string, inputType = 'insertText') {
  const event = new InputEvent('beforeinput', { data, inputType, bubbles: true, cancelable: true });
  box(index).dispatchEvent(event);
  await nextTick();
  await nextTick();
  return event;
}

async function press(index: number, key: string) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  box(index).dispatchEvent(event);
  await nextTick();
  await nextTick();
  return event;
}

describe('OtpRoot', () => {
  describe('typing', () => {
    it('writes a character and moves to the next box', async () => {
      const { model } = mountOtp();
      box(0).focus();
      await type(0, '4');
      expect(model.value).toBe('4');
      expect(document.activeElement).toBe(box(1));
      await type(1, '2');
      expect(model.value).toBe('42');
      expect(shown()).toBe('42____');
    });

    it('drops characters its type refuses', async () => {
      const { model } = mountOtp();
      const event = await type(0, 'a');
      expect(event.defaultPrevented).toBe(true);
      expect(model.value).toBe('');
      expect(box(0).value).toBe('');
    });

    it('takes letters with alphanumeric, or what a filter allows', async () => {
      const { model } = mountOtp({ type: 'alphanumeric' });
      await type(0, 'a');
      await type(1, '7');
      await type(2, '-');
      expect(model.value).toBe('a7');
      wrapper!.unmount();

      const second = mountOtp({ filter: '[A-F]' });
      await type(0, 'B');
      await type(1, '7');
      expect(second.model.value).toBe('B');
    });

    it('replaces the character of a filled box', async () => {
      const { model } = mountOtp({}, '123');
      box(1).focus();
      await type(1, '9');
      expect(model.value).toBe('193');
      expect(document.activeElement).toBe(box(2));
    });

    it('stays in the last box and reports the completed code once', async () => {
      const { model, completed } = mountOtp({ length: 4 }, '123');
      box(3).focus();
      await type(3, '4');
      expect(model.value).toBe('1234');
      expect(document.activeElement).toBe(box(3));
      expect(completed).toEqual(['1234']);
    });

    it('fills from the box onward when several characters arrive, cut at the length', async () => {
      const { model, completed } = mountOtp({ length: 4 });
      box(0).focus();
      await type(0, '12 3-456', 'insertFromPaste');
      expect(model.value).toBe('1234');
      expect(document.activeElement).toBe(box(3));
      expect(completed).toEqual(['1234']);
    });

    it('takes a code an autofill writes straight into the box', async () => {
      const { model } = mountOtp();
      box(0).value = '987654';
      box(0).dispatchEvent(new Event('input', { bubbles: true }));
      await nextTick();
      await nextTick();
      expect(model.value).toBe('987654');
      expect(box(0).value).toBe('9');
    });

    it('holds a value set from outside to the same rules', async () => {
      const { model } = mountOtp({ length: 4 });
      model.value = '1a2345';
      await nextTick();
      expect(shown()).toBe('1234');
    });
  });

  describe('focus', () => {
    it('sends focus past the first empty box back to it', async () => {
      mountOtp({}, '12');
      box(5).focus();
      expect(document.activeElement).toBe(box(2));
      box(1).focus();
      expect(document.activeElement).toBe(box(1));
    });

    it('offers only the first box a one-time code', () => {
      mountOtp();
      expect(boxes().map((el) => el.getAttribute('autocomplete'))).toEqual(['one-time-code', 'off', 'off', 'off', 'off', 'off']);
    });
  });

  describe('keys', () => {
    it('Backspace clears a filled box, then steps back through the code', async () => {
      const { model } = mountOtp({ length: 4 }, '1234');
      box(3).focus();
      await press(3, 'Backspace');
      expect(model.value).toBe('123');
      expect(document.activeElement).toBe(box(3));
      await press(3, 'Backspace');
      expect(model.value).toBe('12');
      expect(document.activeElement).toBe(box(2));
    });

    it('Backspace and Delete in the middle move the rest back', async () => {
      const { model } = mountOtp({}, '12345');
      box(1).focus();
      await press(1, 'Backspace');
      expect(model.value).toBe('1345');
      await press(1, 'Delete');
      expect(model.value).toBe('145');
      expect(document.activeElement).toBe(box(1));
    });

    it('deletes on a soft keyboard that sends no Backspace key', async () => {
      const { model } = mountOtp({}, '12');
      box(1).focus();
      await type(1, '', 'deleteContentBackward');
      expect(model.value).toBe('1');
    });

    it('moves with the arrows and Home/End, never past the first empty box', async () => {
      mountOtp({}, '123');
      box(1).focus();
      await press(1, 'ArrowLeft');
      expect(document.activeElement).toBe(box(0));
      await press(0, 'End');
      expect(document.activeElement).toBe(box(3));
      await press(3, 'ArrowRight');
      expect(document.activeElement).toBe(box(3));
      await press(3, 'Home');
      expect(document.activeElement).toBe(box(0));
    });

    it('swaps the arrows in a right-to-left layout', async () => {
      document.documentElement.dir = 'rtl';
      mountOtp({}, '123');
      box(1).focus();
      await press(1, 'ArrowLeft');
      expect(document.activeElement).toBe(box(2));
    });

    it('edits nothing when read-only, but still moves', async () => {
      const { model } = mountOtp({ readOnly: true }, '12');
      box(0).focus();
      await type(0, '9');
      await press(0, 'Backspace');
      expect(model.value).toBe('12');
      await press(0, 'ArrowRight');
      expect(document.activeElement).toBe(box(1));
    });
  });

  describe('assistive technology and forms', () => {
    it('is a group of labeled boxes', () => {
      mountOtp({ length: 4, mask: true });
      expect(document.querySelector('[data-part="otp"]')?.getAttribute('role')).toBe('group');
      expect(box(2).getAttribute('aria-label')).toBe('Character 3 of 4');
      expect(box(0).type).toBe('password');
      expect(box(0).getAttribute('inputmode')).toBe('numeric');
    });

    it('takes its own box labels', () => {
      mountOtp({ length: 2, getInputLabel: (i: number) => `Digit ${i + 1}` });
      expect(box(1).getAttribute('aria-label')).toBe('Digit 2');
    });

    it('submits the whole code under its name', () => {
      mountOtp({ name: 'code' }, '1234');
      expect(document.querySelector<HTMLInputElement>('input[type="hidden"][name="code"]')?.value).toBe('1234');
    });

    it('follows a field: its label focuses the first box, and it is touched only once focus leaves', async () => {
      const Host = defineComponent({
        setup: () => () =>
          h(FieldRoot as any, { name: 'code', disabled: false }, {
            default: ({ touched }: { touched: boolean }) => [
              h(FieldLabel as any, null, { default: () => `Code ${touched ? 'touched' : ''}` }),
              h(OtpRoot as any, { length: 3 }, {
                default: () => h(Group as any, null, {
                  default: () => [0, 1, 2].map((index) => h(OtpInput as any, { index, key: index }))
                })
              }),
              h('button', { id: 'after' })
            ]
          })
      });
      wrapper = mount(Host, { attachTo: document.body });
      await nextTick();

      const label = document.querySelector('label')!;
      expect(label.getAttribute('for')).toBe(box(0).id);
      expect(document.querySelector('[data-part="otp"]')?.getAttribute('aria-labelledby')).toBe(label.id);
      expect(document.querySelector('input[type="hidden"]')?.getAttribute('name')).toBe('code');

      box(0).focus();
      box(0).dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: box(1) }));
      await nextTick();
      expect(label.textContent).toBe('Code ');

      box(0).dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.getElementById('after') }));
      await nextTick();
      expect(label.textContent).toBe('Code touched');
    });
  });
});
