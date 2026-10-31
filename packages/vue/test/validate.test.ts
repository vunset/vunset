import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import {
  FieldRoot,
  Input,
  FieldError,
  CheckboxRoot,
  useValidate,
  createValidationStore,
  defaultValidationStore,
  provideValidation,
} from '../src';

afterEach(() => defaultValidationStore.clearErrors());

function mountField(fieldProps: Record<string, any> = { name: 'email' }, control = () => h(Input as any)) {
  return mount(
    defineComponent({
      setup: () => () => h(FieldRoot as any, { class: 'field', ...fieldProps }, () => [control(), h(FieldError as any)]),
    }),
    { attachTo: document.body },
  );
}

const root = () => document.querySelector<HTMLElement>('.field')!;
const input = () => document.querySelector<HTMLInputElement>('input')!;
const errorEl = () => document.querySelector<HTMLElement>('.field > div:last-child');

describe('validation errors', () => {
  it('takes a bag, keeping the first of several messages and dropping empty ones', () => {
    const { errors, setErrors } = createValidationStore();
    setErrors({ email: 'Wrong email', name: ['Too short', 'Too plain'], phone: null });
    expect(errors.value).toEqual({ email: 'Wrong email', name: 'Too short' });
  });

  it('takes a list of issues, joining a path given as an array', () => {
    const { errors, setErrors } = createValidationStore();
    setErrors([
      { path: 'email', message: 'Wrong email' },
      { path: ['address', 'city'], message: 'Required' },
    ]);
    expect(errors.value).toEqual({ email: 'Wrong email', 'address.city': 'Required' });
  });

  it('replaces what was there, and clears one or all', () => {
    const { errors, setErrors, clearErrors } = createValidationStore();
    setErrors({ email: 'Wrong email' });
    setErrors({ name: 'Required', city: 'Required' });
    expect(errors.value).toEqual({ name: 'Required', city: 'Required' });

    clearErrors('name');
    expect(errors.value).toEqual({ city: 'Required' });
    clearErrors();
    expect(errors.value).toEqual({});
  });

  it('can be reached outside setup, where there is nothing to inject', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(useValidate()).toBe(defaultValidationStore);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('a named field', () => {
  it('turns invalid and shows the message while the bag holds one for it', async () => {
    mountField();
    expect(root().hasAttribute('data-invalid')).toBe(false);
    expect(errorEl()).toBeNull();

    useValidate().setErrors({ email: 'Wrong email' });
    await nextTick();

    expect(root().hasAttribute('data-invalid')).toBe(true);
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(errorEl()!.textContent).toBe('Wrong email');
    expect(input().getAttribute('aria-describedby')).toContain(errorEl()!.id);
  });

  it('ignores errors for other names', async () => {
    mountField();
    useValidate().setErrors({ name: 'Required' });
    await nextTick();
    expect(root().hasAttribute('data-invalid')).toBe(false);
  });

  it('lets the slot render the message its own way', async () => {
    mount(
      defineComponent({
        setup: () => () =>
          h(FieldRoot as any, { name: 'email' }, () => [
            h(Input as any),
            h(FieldError as any, null, { default: ({ message }: { message: string }) => `! ${message}` }),
          ]),
      }),
      { attachTo: document.body },
    );
    useValidate().setErrors({ email: 'Wrong email' });
    await nextTick();
    expect(document.body.textContent).toContain('! Wrong email');
  });

  it('clears its error once the user edits the value', async () => {
    mountField();
    useValidate().setErrors({ email: 'Wrong email', name: 'Required' });
    await nextTick();

    input().value = 'ada@example.com';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();

    expect(useValidate().errors.value).toEqual({ name: 'Required' });
    expect(root().hasAttribute('data-invalid')).toBe(false);
  });

  it('clears on a toggle too', async () => {
    mountField({ name: 'terms' }, () => h(CheckboxRoot as any, { class: 'box' }));
    useValidate().setErrors({ terms: 'Accept the terms' });
    await nextTick();

    document.querySelector<HTMLElement>('.box')!.click();
    await nextTick();
    expect(useValidate().errors.value).toEqual({});
  });

  it('names the control inside, unless the control names itself', () => {
    mountField();
    expect(input().name).toBe('email');

    document.body.innerHTML = '';
    mountField({ name: 'email' }, () => h(Input as any, { name: 'contact' }));
    expect(input().name).toBe('contact');
  });

  it('reads a provided store rather than the default one', async () => {
    const scoped = createValidationStore();
    mount(
      defineComponent({
        setup() {
          provideValidation(scoped);
          const value = ref('');
          return () => h(FieldRoot as any, { class: 'field', name: 'email' }, () => [h(Input as any, { modelValue: value.value })]);
        },
      }),
      { attachTo: document.body },
    );

    useValidate().setErrors({ email: 'From the default store' });
    await nextTick();
    expect(root().hasAttribute('data-invalid')).toBe(false);

    scoped.setErrors({ email: 'From this form' });
    await nextTick();
    expect(root().hasAttribute('data-invalid')).toBe(true);
  });
});

describe('a named FieldError', () => {
  it('works on its own, outside any Field', async () => {
    mount(
      defineComponent({ setup: () => () => h('div', { class: 'custom' }, [h(FieldError as any, { name: 'email', class: 'error' })]) }),
      { attachTo: document.body },
    );
    const error = () => document.querySelector<HTMLElement>('.error');
    expect(error()).toBeNull();

    useValidate().setErrors({ email: 'Wrong email' });
    await nextTick();
    expect(error()!.textContent).toBe('Wrong email');
    expect(error()!.hasAttribute('data-invalid')).toBe(true);

    useValidate().clearErrors('email');
    // It stays for its exit animation, which settles over a couple of frames.
    for (let i = 0; i < 4; i += 1) {
      await new Promise((r) => requestAnimationFrame(r));
      await nextTick();
    }
    expect(error()).toBeNull();
  });

  it('inside a FieldRoot, shows the error it names and still describes the control', async () => {
    mount(
      defineComponent({
        setup: () => () => h(FieldRoot as any, null, () => [h(Input as any), h(FieldError as any, { name: 'password', class: 'error' })]),
      }),
      { attachTo: document.body },
    );
    useValidate().setErrors({ password: 'Too short' });
    await nextTick();

    const error = document.querySelector<HTMLElement>('.error')!;
    expect(error.textContent).toBe('Too short');
    expect(input().getAttribute('aria-describedby')).toContain(error.id);
  });
});
