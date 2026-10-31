import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { FormSwitch } from '../src';

const switchEl = () => document.querySelector<HTMLElement>('[role="switch"]')!;
const label = () => document.querySelector<HTMLLabelElement>('.form-label')!;

function mountSwitch(props: Record<string, unknown> = {}) {
  return mount(FormSwitch as any, { props: { label: 'Notifications', ...props }, attachTo: document.body });
}

describe('FormSwitch', () => {
  it('puts attrs on the switch, and class and style on the field', () => {
    const w = mountSwitch({ label: undefined, 'aria-label': 'Dark mode', class: 'theme-switch', style: 'margin: 1px' });

    expect(switchEl().getAttribute('aria-label')).toBe('Dark mode');
    expect(switchEl().classList.contains('theme-switch')).toBe(false);
    const field = document.querySelector<HTMLElement>('.theme-switch')!;
    expect(field.contains(switchEl())).toBe(true);
    expect(field.style.margin).toBe('1px');
    w.unmount();
  });

  it('reads a null model, an empty database field, as off', () => {
    mountSwitch({ modelValue: null, trueValue: 1, falseValue: 0 });
    expect(switchEl().getAttribute('aria-checked')).toBe('false');
  });

  it('labels the switch, and a click on the label toggles it', async () => {
    const w = mountSwitch();

    expect(label().htmlFor).toBe(switchEl().id);
    label().click();
    await nextTick();

    expect(switchEl().getAttribute('aria-checked')).toBe('true');
    expect(w.emitted('update:modelValue')).toEqual([[true]]);
    w.unmount();
  });

  it('binds v-model through true-value and false-value', async () => {
    const theme = ref<'dark' | 'light'>('light');
    const w = mount(
      defineComponent({
        render: () =>
          h(FormSwitch as any, {
            label: 'Dark mode',
            modelValue: theme.value,
            trueValue: 'dark',
            falseValue: 'light',
            'onUpdate:modelValue': (next: 'dark' | 'light') => (theme.value = next)
          })
      }),
      { attachTo: document.body }
    );

    switchEl().click();
    await nextTick();
    expect(theme.value).toBe('dark');

    theme.value = 'light';
    await nextTick();
    expect(switchEl().getAttribute('aria-checked')).toBe('false');
    w.unmount();
  });

  it('is described by its help and its error', async () => {
    const w = mountSwitch({ help: 'A weekly digest', error: 'Required to continue' });
    await nextTick();

    const ids = switchEl().getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual([
      'A weekly digest',
      'Required to continue'
    ]);
    expect(switchEl().hasAttribute('data-invalid')).toBe(true);
    w.unmount();
  });

  it('marks itself invalid without an error element when given no message', async () => {
    const w = mountSwitch({ invalid: true });
    await nextTick();

    expect(switchEl().hasAttribute('data-invalid')).toBe(true);
    expect(document.querySelector('.form-error')).toBeNull();
    w.unmount();
  });

  it('ignores the label while disabled', async () => {
    const w = mountSwitch({ disabled: true });

    label().click();
    await nextTick();

    expect(switchEl().getAttribute('aria-checked')).toBe('false');
    expect(w.emitted('update:modelValue')).toBeUndefined();
    w.unmount();
  });

  it('submits its value, or its unchecked value, under its name', async () => {
    const w = mountSwitch({ name: 'digest', value: 'on', uncheckedValue: 'off' });
    const submitted = () => {
      const form = document.createElement('form');
      document.querySelectorAll('input').forEach((input) => form.append(input.cloneNode()));
      return new FormData(form).get('digest');
    };

    expect(submitted()).toBe('off');
    switchEl().click();
    await nextTick();
    expect(submitted()).toBe('on');
    w.unmount();
  });

  it('is announced required, without the browser holding the form back', () => {
    const w = mountSwitch({ required: true, name: 'digest' });

    expect(switchEl().getAttribute('aria-required')).toBe('true');
    expect(document.querySelector<HTMLInputElement>('input[name="digest"]')!.required).toBe(false);
    w.unmount();
  });

  it('takes an id for the switch, which the label still points at', () => {
    const w = mountSwitch({ id: 'digest-switch' });

    expect(switchEl().id).toBe('digest-switch');
    expect(label().htmlFor).toBe('digest-switch');
    w.unmount();
  });
});
