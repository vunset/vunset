import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { Textarea, FieldRoot, FieldLabel } from '../src';

const LINE = 20;
const PADDING = 4;

let wrapper: VueWrapper | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

function mountTextarea(props: Record<string, unknown> = {}) {
  const model = ref<string>((props.modelValue as string) ?? '');
  wrapper = mount(
    defineComponent(
      () => () =>
        h(Textarea as any, {
          style: `box-sizing: border-box; line-height: ${LINE}px; padding: ${PADDING}px 0;`,
          ...props,
          modelValue: model.value,
          'onUpdate:modelValue': (value: string) => (model.value = value)
        })
    ),
    { attachTo: document.body }
  );
  return { model, el: wrapper.find('textarea').element as HTMLTextAreaElement };
}

/** jsdom lays nothing out: the content is its lines, plus the padding. */
function measureByLines(el: HTMLTextAreaElement, rows = 2) {
  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    get: () => Math.max(el.value.split('\n').length, rows) * LINE + PADDING * 2
  });
}

async function type(el: HTMLTextAreaElement, text: string) {
  el.value = text;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  await nextTick();
  await nextTick();
}

describe('Textarea', () => {
  it('renders a textarea bound with v-model', async () => {
    const { model, el } = mountTextarea({ modelValue: 'hello' });
    expect(el.tagName).toBe('TEXTAREA');
    expect(el.value).toBe('hello');
    await type(el, 'one\ntwo');
    expect(model.value).toBe('one\ntwo');
    expect(el.hasAttribute('data-filled')).toBe(true);
  });

  it('is labeled by the field around it', async () => {
    wrapper = mount(
      defineComponent(
        () => () =>
          h(FieldRoot as any, { name: 'bio', disabled: true }, () => [
            h(FieldLabel as any, null, () => 'Bio'),
            h(Textarea as any)
          ])
      ),
      { attachTo: document.body }
    );
    await nextTick();
    const el = wrapper.find('textarea').element as HTMLTextAreaElement;
    expect(wrapper.find('label').attributes('for')).toBe(el.id);
    expect(el.name).toBe('bio');
    expect(el.disabled).toBe(true);
  });

  it('refuses an insertion past maxLength', () => {
    const { el } = mountTextarea({ modelValue: 'abc', maxLength: 3 });
    el.setSelectionRange(3, 3);
    const event = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: 'd',
      inputType: 'insertText'
    });
    el.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('leaves the height to the stylesheet without autosize', async () => {
    const { el } = mountTextarea();
    measureByLines(el);
    await type(el, 'a\nb\nc\nd');
    expect(el.style.height).toBe('');
    expect(el.hasAttribute('data-autosize')).toBe(false);
  });

  describe('autosize', () => {
    it('grows and shrinks with its lines', async () => {
      const { el } = mountTextarea({ autosize: true });
      measureByLines(el);
      await type(el, 'a\nb\nc\nd');
      expect(el.style.height).toBe(`${4 * LINE + PADDING * 2}px`);
      expect(el.style.overflowY).toBe('hidden');
      expect(el.hasAttribute('data-autosize')).toBe(true);

      await type(el, 'a');
      // `rows` (2 by default) is the floor.
      expect(el.style.height).toBe(`${2 * LINE + PADDING * 2}px`);
    });

    it('stops at maxRows and scrolls from there', async () => {
      const { el } = mountTextarea({ autosize: true, maxRows: 3 });
      measureByLines(el);
      await type(el, 'a\nb\nc\nd\ne');
      expect(el.style.height).toBe(`${3 * LINE + PADDING * 2}px`);
      expect(el.style.overflowY).toBe('auto');
    });

    it('follows a value set from outside', async () => {
      const { model, el } = mountTextarea({ autosize: true });
      measureByLines(el);
      model.value = 'a\nb\nc';
      await nextTick();
      await nextTick();
      expect(el.style.height).toBe(`${3 * LINE + PADDING * 2}px`);
    });
  });
});

describe('transform', () => {
  it('rewrites the text once it is committed', async () => {
    const { model, el } = mountTextarea({ transform: (value: string) => value.toUpperCase() });
    el.value = 'ab';
    el.dispatchEvent(new Event('input'));
    await nextTick();
    expect(model.value).toBe('ab');

    el.dispatchEvent(new Event('change'));
    await nextTick();
    expect(model.value).toBe('AB');
    expect(el.value).toBe('AB');
  });
});
