import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { FormRadioGroup, FormRadio } from '../src';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro', help: '$12 a month' },
  { value: 'team', label: 'Team', disabled: true }
];

const group = () => document.querySelector<HTMLElement>('[role="radiogroup"]')!;
const radios = () => [...document.querySelectorAll<HTMLElement>('[role="radio"]')];
const radioLabel = (text: string) =>
  [...document.querySelectorAll<HTMLLabelElement>('.form-radio .form-label')].find((el) => el.textContent?.trim() === text)!;
const checked = () => radios().map((el) => el.getAttribute('aria-checked'));

let wrapper: VueWrapper | undefined;

function mountGroup(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  wrapper = mount(FormRadioGroup as any, { props: { label: 'Plan', options: PLANS, ...props }, slots, attachTo: document.body });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('FormRadioGroup', () => {
  it('renders a radio per option, each chosen by a click on its label', async () => {
    const w = mountGroup();

    expect(radios()).toHaveLength(3);
    expect(radioLabel('Pro').htmlFor).toBe(radios()[1]!.id);

    radioLabel('Pro').click();
    await nextTick();

    expect(w.emitted('update:modelValue')).toEqual([['pro']]);
    expect(checked()).toEqual(['false', 'true', 'false']);
  });

  it('takes FormRadio children instead of options', async () => {
    const plan = ref('b');
    wrapper = mount(
      defineComponent({
        render: () =>
          h(
            FormRadioGroup as any,
            { label: 'Plan', modelValue: plan.value, 'onUpdate:modelValue': (v: string) => (plan.value = v) },
            () => [h(FormRadio as any, { value: 'a', label: 'A' }), h(FormRadio as any, { value: 'b', label: 'B' })]
          )
      }),
      { attachTo: document.body }
    );

    expect(checked()).toEqual(['false', 'true']);
    radioLabel('A').click();
    await nextTick();
    expect(plan.value).toBe('a');
  });

  it('names the group with its label, which is no <label for>', async () => {
    mountGroup({ help: 'Change it any time', error: 'Pick a plan' });
    await nextTick();

    const label = document.getElementById(group().getAttribute('aria-labelledby')!)!;
    expect(label.textContent!.trim()).toBe('Plan');
    expect(label.tagName).toBe('DIV');
    expect(label.hasAttribute('for')).toBe(false);

    const described = group().getAttribute('aria-describedby')!.split(' ');
    expect(described.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual([
      'Change it any time',
      'Pick a plan'
    ]);
    expect(group().getAttribute('aria-invalid')).toBe('true');
  });

  it("describes a radio by its option's help", () => {
    mountGroup();
    const help = document.getElementById(radios()[1]!.getAttribute('aria-describedby')!)!;
    expect(help.textContent!.trim()).toBe('$12 a month');
    expect(radios()[0]!.hasAttribute('aria-describedby')).toBe(false);
  });

  it('is one tab stop, and the arrow keys choose, skipping a disabled radio', async () => {
    const w = mountGroup({ modelValue: 'free' });

    expect(radios().map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', null]);

    radios()[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    await nextTick();
    expect(w.emitted('update:modelValue')).toEqual([['pro']]);
  });

  it('passes the field state to the group, and the name to every radio', () => {
    mountGroup({ required: true, readOnly: true, name: 'plan' });

    expect(group().getAttribute('aria-required')).toBe('true');
    expect(group().getAttribute('aria-readonly')).toBe('true');
    const inputs = [...document.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(inputs.map((input) => input.name)).toEqual(['plan', 'plan', 'plan']);
  });

  it('accepts bare values, lined up horizontally', () => {
    mountGroup({ options: ['S', 'M', 'L'], orientation: 'horizontal' });

    expect([...document.querySelectorAll('.form-radio .form-label')].map((el) => el.textContent!.trim())).toEqual([
      'S',
      'M',
      'L'
    ]);
    expect(group().getAttribute('data-orientation')).toBe('horizontal');
  });

  it("renders each option's label through the option slot", () => {
    mountGroup({}, { option: ({ label, option }: any) => h('strong', `${label}${option.help ? '*' : ''}`) });

    expect([...document.querySelectorAll('.form-radio .form-label strong')].map((el) => el.textContent)).toEqual([
      'Free',
      'Pro*',
      'Team'
    ]);
  });
});

describe('FormRadio', () => {
  it('puts attrs on the radio, and class and style on its row', () => {
    wrapper = mount(
      defineComponent({
        render: () =>
          h(FormRadioGroup as any, { label: 'Plan' }, () => [
            h(FormRadio as any, { value: 'free', 'aria-label': 'Free plan', class: 'plan-row', style: 'margin: 1px' })
          ])
      }),
      { attachTo: document.body }
    );

    expect(radios()[0]!.getAttribute('aria-label')).toBe('Free plan');
    const row = document.querySelector<HTMLElement>('.plan-row')!;
    expect(row.classList.contains('form-radio')).toBe(true);
    expect(row.style.margin).toBe('1px');
  });

  it('warns, and renders nothing, outside a FormRadioGroup', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    wrapper = mount(FormRadio as any, { props: { value: 'a', label: 'A' }, attachTo: document.body });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[FormRadio]'));
    expect(document.querySelector('.form-radio')).toBeNull();
    warn.mockRestore();
  });
});
