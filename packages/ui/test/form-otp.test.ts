import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { FormOtp } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

const boxes = () => Array.from(document.querySelectorAll<HTMLInputElement>('.form-otp-input'));

function render(props: Record<string, unknown> = {}) {
  const model = ref('');
  const completed: string[] = [];
  const Host = defineComponent({
    setup: () => () =>
      h(FormOtp as any, {
        modelValue: model.value,
        'onUpdate:modelValue': (next: string) => (model.value = next),
        onComplete: (code: string) => completed.push(code),
        ...props
      })
  });
  wrapper = mount(Host, { attachTo: document.body });
  return { model, completed };
}

describe('FormOtp', () => {
  it('draws a box per character, apart, each a form control', () => {
    render({ label: 'Code' });
    expect(boxes()).toHaveLength(6);
    expect(boxes().every((box) => box.classList.contains('form-control'))).toBe(true);
    expect(document.querySelector('.app-group')).toBeNull();
    expect(document.querySelector('label')?.getAttribute('for')).toBe(boxes()[0].id);
  });

  it('joins the boxes into groups with a separator between them', () => {
    render({ groups: [3, 3] });
    const groups = Array.from(document.querySelectorAll('.app-group'));
    expect(groups.map((group) => group.querySelectorAll('.form-otp-input').length)).toEqual([3, 3]);
    expect(document.querySelectorAll('.form-otp-separator')).toHaveLength(1);
    expect(boxes().map((box) => box.dataset.index)).toEqual(['0', '1', '2', '3', '4', '5']);
  });

  it('puts boxes the groups leave out in one more, and drops sizes past the length', () => {
    render({ length: 5, groups: [2, 1] });
    expect(Array.from(document.querySelectorAll('.app-group')).map((g) => g.children.length)).toEqual([2, 1, 2]);
    wrapper!.unmount();

    render({ length: 4, groups: [3, 3] });
    expect(Array.from(document.querySelectorAll('.app-group')).map((g) => g.children.length)).toEqual([3, 1]);
  });

  it('takes a paste and reports the completed code', async () => {
    const { model, completed } = render({ length: 4 });
    boxes()[0].focus();
    boxes()[0].dispatchEvent(new InputEvent('beforeinput', { data: '1234', inputType: 'insertFromPaste', bubbles: true, cancelable: true }));
    await nextTick();
    expect(model.value).toBe('1234');
    expect(completed).toEqual(['1234']);
  });

  it('marks every box invalid with an error, and takes control-class on each', () => {
    render({ length: 2, error: 'Wrong code', controlClass: 'mine' });
    expect(boxes().every((box) => box.getAttribute('aria-invalid') === 'true' && box.classList.contains('mine'))).toBe(true);
  });
});
