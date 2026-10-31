import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { FormTextarea } from '../src';

const textarea = () => document.querySelector<HTMLTextAreaElement>('.form-textarea-control')!;
const label = () => document.querySelector<HTMLLabelElement>('.form-label')!;

function type(text: string) {
  textarea().value = text;
  textarea().dispatchEvent(new Event('input', { bubbles: true }));
}

let wrapper: VueWrapper | undefined;

function mountTextarea(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  wrapper = mount(FormTextarea as any, { props: { label: 'Bio', ...props }, attrs, attachTo: document.body });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('FormTextarea', () => {
  it('shows a null model as empty, not the text "null"', () => {
    mountTextarea({ modelValue: null });
    expect(textarea().value).toBe('');
  });

  it('labels the textarea', () => {
    mountTextarea();
    expect(textarea().tagName).toBe('TEXTAREA');
    expect(label().htmlFor).toBe(textarea().id);
  });

  it('binds v-model', async () => {
    const value = ref('Hello');
    wrapper = mount(
      defineComponent({
        render: () =>
          h(FormTextarea as any, {
            label: 'Bio',
            modelValue: value.value,
            'onUpdate:modelValue': (v: string) => (value.value = v)
          })
      }),
      { attachTo: document.body }
    );

    expect(textarea().value).toBe('Hello');
    type('Hello\nthere');
    await nextTick();
    expect(value.value).toBe('Hello\nthere');
  });

  it('puts class and style on the field, every other attribute on the textarea', () => {
    mountTextarea({}, { class: 'wide', style: 'margin: 1px', placeholder: 'About you', rows: 5 });

    const field = document.querySelector<HTMLElement>('.form-field')!;
    expect(field.classList.contains('wide')).toBe(true);
    expect(field.style.margin).toBe('1px');
    expect(textarea().placeholder).toBe('About you');
    expect(textarea().rows).toBe(5);
    expect(textarea().classList.contains('wide')).toBe(false);
  });

  it('is described by its help and its error', async () => {
    mountTextarea({ help: 'Shown on your profile', error: 'Too short' });
    await nextTick();

    const ids = textarea().getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual([
      'Shown on your profile',
      'Too short'
    ]);
    expect(textarea().getAttribute('aria-invalid')).toBe('true');
  });

  it('passes the field state to the textarea', () => {
    mountTextarea({ disabled: true, required: true, name: 'bio', maxLength: 10 });

    expect(textarea().disabled).toBe(true);
    expect(textarea().required).toBe(false);
    expect(textarea().getAttribute('aria-required')).toBe('true');
    expect(textarea().name).toBe('bio');
    expect(textarea().maxLength).toBe(10);
  });

  it('puts textarea-class on the textarea, and control-class on the box', () => {
    mountTextarea({ textareaClass: 'mono', controlClass: 'boxed' });

    const box = document.querySelector('.form-textarea')!;
    expect(textarea().classList.contains('mono')).toBe(true);
    expect(box.classList.contains('boxed')).toBe(true);
    expect(box.classList.contains('mono')).toBe(false);
  });

  it('renders the start and end slots as addons in the box, around the textarea', async () => {
    wrapper = mount(FormTextarea as any, {
      props: { label: 'Bio', defaultValue: 'Hi' },
      slots: {
        start: '<i class="lead" />',
        end: ({ filled }: { filled: boolean }) => h('i', { class: filled ? 'full' : 'empty' })
      },
      attachTo: document.body
    });
    await nextTick();

    const [start, end] = document.querySelectorAll('.form-textarea > [data-part="addon"]');
    expect(start.getAttribute('data-side')).toBe('start');
    expect(start.querySelector('.lead')).not.toBeNull();
    expect(start.nextElementSibling).toBe(textarea());
    expect(end.getAttribute('data-side')).toBe('end');
    expect(end.querySelector('.full')).not.toBeNull();
  });

  it('marks autosize for the stylesheet', () => {
    mountTextarea({ autosize: true });
    expect(textarea().hasAttribute('data-autosize')).toBe(true);
  });
});
