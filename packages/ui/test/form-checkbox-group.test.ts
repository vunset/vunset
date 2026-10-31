import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { FormCheckboxGroup, FormCheckbox } from '../src';

const TOPICS = [
  { value: 'vue', label: 'Vue' },
  { value: 'css', label: 'CSS', help: 'Cascading, still' },
  { value: 'rust', label: 'Rust', disabled: true }
];

const group = () => document.querySelector<HTMLElement>('[role="group"]')!;
const boxes = () => [...document.querySelectorAll<HTMLElement>('[role="checkbox"]')];
const boxLabel = (text: string) =>
  [...document.querySelectorAll<HTMLElement>('.form-checkbox-group .form-label')].find(
    (el) => el.textContent?.trim() === text
  )!;
const checked = () => boxes().map((el) => el.getAttribute('aria-checked'));

let wrapper: VueWrapper | undefined;

function mountGroup(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  wrapper = mount(FormCheckboxGroup as any, {
    props: { label: 'Topics', options: TOPICS, ...props },
    slots,
    attachTo: document.body
  });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('FormCheckboxGroup', () => {
  it('renders a checkbox per option, each toggled by a click on its label', async () => {
    const w = mountGroup();

    expect(boxes()).toHaveLength(3);
    expect((boxLabel('CSS') as HTMLLabelElement).htmlFor).toBe(boxes()[1]!.id);

    boxLabel('CSS').click();
    await nextTick();
    boxLabel('Vue').click();
    await nextTick();

    expect(w.emitted('update:modelValue')).toEqual([[['css']], [['vue', 'css']]]);
    expect(checked()).toEqual(['true', 'true', 'false']);
  });

  it('is a group named by its label and described by its help and error', async () => {
    mountGroup({ help: 'Pick any', error: 'Pick one' });
    await nextTick();

    const label = document.getElementById(group().getAttribute('aria-labelledby')!)!;
    expect(label.textContent!.trim()).toBe('Topics');
    const described = group().getAttribute('aria-describedby')!.split(' ');
    expect(described.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual(['Pick any', 'Pick one']);
    expect(group().getAttribute('aria-invalid')).toBe('true');
  });

  it("describes each box by its own help, not the group's", async () => {
    mountGroup({ help: 'Pick any' });
    await nextTick();

    const css = boxes()[1]!;
    expect(document.getElementById(css.getAttribute('aria-describedby')!)!.textContent!.trim()).toBe(
      'Cascading, still'
    );
    expect(boxes()[0]!.hasAttribute('aria-describedby')).toBe(false);
  });

  it('takes bare values as their own labels', () => {
    mountGroup({ options: ['S', 'M'] });
    expect(boxLabel('S')).toBeTruthy();
    expect(boxLabel('M')).toBeTruthy();
  });

  it('takes FormCheckbox children instead of options', async () => {
    const days = ref<string[]>(['wed']);
    wrapper = mount(
      defineComponent({
        render: () =>
          h(
            FormCheckboxGroup as any,
            { label: 'Days', modelValue: days.value, 'onUpdate:modelValue': (v: string[]) => (days.value = v) },
            {
              default: () => [
                h(FormCheckbox as any, { value: 'mon', label: 'Monday' }),
                h(FormCheckbox as any, { value: 'wed', label: 'Wednesday' })
              ]
            }
          )
      }),
      { attachTo: document.body }
    );

    expect(checked()).toEqual(['false', 'true']);
    boxLabel('Monday').click();
    await nextTick();
    expect(days.value).toEqual(['mon', 'wed']);
  });

  it('submits each checked box under the name', () => {
    mountGroup({ name: 'topics', defaultValue: ['vue'] });

    const inputs = boxes().map((el) => el.nextElementSibling as HTMLInputElement);
    expect(inputs.map((input) => input.name)).toEqual(['topics', 'topics', 'topics']);
    expect(inputs.filter((input) => input.checked).map((input) => input.value)).toEqual(['vue']);
  });

  it('announces required, leaving the check to the app', () => {
    mountGroup({ name: 'topics', required: true });

    expect(group().getAttribute('aria-required')).toBe('true');
    expect((boxes()[0]!.nextElementSibling as HTMLInputElement).required).toBe(false);
  });

  it('disables every box', () => {
    mountGroup({ disabled: true });
    expect(boxes().every((el) => el.getAttribute('aria-disabled') === 'true')).toBe(true);
  });

  it('adds a select-all box that checks and clears the enabled ones', async () => {
    const w = mountGroup({ selectAll: 'All topics' });

    expect(boxes()).toHaveLength(4);
    boxLabel('All topics').click();
    await nextTick();
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([['vue', 'css']]);
    expect(boxes()[0]!.getAttribute('aria-checked')).toBe('true');

    boxLabel('All topics').click();
    await nextTick();
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([[]]);
  });

  it('labels the select-all box "Select all" unless told otherwise', () => {
    mountGroup({ selectAll: true });
    expect(boxLabel('Select all')).toBeTruthy();
  });

  it('renders each label through the option slot', () => {
    mountGroup({}, { option: ({ label, option }: any) => `${label}${option.help ? ' *' : ''}` });
    expect(boxLabel('CSS *')).toBeTruthy();
  });
});

describe('FormCheckboxGroup on the server', () => {
  // The select-all box renders before the options; it counts them from `options`,
  // leaving out a disabled one, as it does once they have mounted.
  const render = (modelValue: string[]) =>
    renderToString(createSSRApp({ render: () => h(FormCheckboxGroup as any, { options: TOPICS, selectAll: true, modelValue }) }));
  const selectAll = (html: string) => html.match(/<[^>]*form-checkbox-all[^>]*>[\s\S]*?aria-checked="(\w+)"/)![1];

  it('draws select-all already checked when every enabled option is', async () => {
    expect(selectAll(await render(['vue', 'css']))).toBe('true');
    expect(selectAll(await render(['vue']))).toBe('mixed');
    expect(selectAll(await render([]))).toBe('false');
  });
});
