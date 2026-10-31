import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Toggle } from '@vunset/vue';
import { FormToggleGroup } from '../src';

const VIEWS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'board', label: 'Board', disabled: true }
];

const group = () => document.querySelector<HTMLElement>('[role="group"]')!;
const toggles = () => [...document.querySelectorAll<HTMLElement>('.form-toggle')];
const toggle = (text: string) => toggles().find((el) => el.textContent?.trim() === text)!;
const pressed = () => toggles().map((el) => el.getAttribute('aria-pressed'));

let wrapper: VueWrapper | undefined;

function mountGroup(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  wrapper = mount(FormToggleGroup as any, {
    props: { label: 'View', options: VIEWS, ...props },
    slots,
    attachTo: document.body
  });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('FormToggleGroup', () => {
  it('renders a toggle per option, in a group named by the label', async () => {
    mountGroup();
    await nextTick();

    expect(toggles().map((el) => el.textContent?.trim())).toEqual(['List', 'Grid', 'Board']);
    const label = document.querySelector('.form-label')!;
    expect(label.tagName).toBe('DIV');
    expect(group().getAttribute('aria-labelledby')).toBe(label.id);
    expect((toggle('Board') as HTMLButtonElement).disabled).toBe(true);
  });

  it('draws start and end inside its box, around the toggles, and keeps arrows to the toggles', async () => {
    mountGroup({}, { start: () => h('i', 'View:'), end: () => h('b', '3') });
    await nextTick();

    const children = [...group().children];
    expect(children[0]!.matches('.form-toggle-group-addon[data-side="start"]')).toBe(true);
    expect(children[0]!.textContent).toBe('View:');
    expect(children.at(-1)!.matches('.form-toggle-group-addon[data-side="end"]')).toBe(true);
    expect(children.at(-1)!.textContent).toBe('3');

    toggle('List').focus();
    toggle('List').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(toggle('Grid'));
  });

  it('draws no addon without a slot for it', async () => {
    mountGroup();
    await nextTick();
    expect(group().querySelector('.form-toggle-group-addon')).toBeNull();
  });

  it('presses one at a time, emitting the value', async () => {
    const w = mountGroup();
    toggle('Grid').click();
    await nextTick();
    toggle('List').click();
    await nextTick();

    expect(w.emitted('update:modelValue')).toEqual([['grid'], ['list']]);
    expect(pressed()).toEqual(['true', 'false', 'false']);
  });

  it('presses several with multiple', async () => {
    const w = mountGroup({ multiple: true, defaultValue: ['list'] });
    toggle('Grid').click();
    await nextTick();
    expect(w.emitted('update:modelValue')).toEqual([[['list', 'grid']]]);
  });

  it('keeps one on with keep-one, and only announces required', async () => {
    const w = mountGroup({ keepOne: true });
    expect(pressed()[0]).toBe('true');
    toggle('List').click();
    await nextTick();
    expect(pressed()[0]).toBe('true');
    w.unmount();

    mountGroup({ required: true });
    expect(group().getAttribute('aria-required')).toBe('true');
    expect(pressed()).toEqual(['false', 'false', 'false']);
    expect(document.querySelector('.form-label')!.hasAttribute('data-required')).toBe(true);
  });

  it('takes bare values as their own labels', () => {
    mountGroup({ options: ['S', 'M', 'L'] });
    expect(toggles().map((el) => el.textContent?.trim())).toEqual(['S', 'M', 'L']);
  });

  it('lowercases option values with v-model.lowercase, keeping their labels', async () => {
    const w = mountGroup({
      options: ['S', 'M', { value: 'XL', label: 'Extra large' }],
      modelValue: 'm',
      modelModifiers: { lowercase: true },
      name: 'size'
    });
    expect(toggles().map((el) => el.textContent?.trim())).toEqual(['S', 'M', 'Extra large']);
    expect(pressed()).toEqual(['false', 'true', 'false']);

    toggle('Extra large').click();
    await nextTick();
    expect(w.emitted('update:modelValue')).toEqual([['xl']]);
    await w.setProps({ modelValue: 'xl' });
    expect(document.querySelector<HTMLInputElement>('input[type="hidden"][name="size"]')!.value).toBe('xl');
  });

  it('reads options through value-key and label-key', async () => {
    const w = mountGroup({
      options: [{ code: 1, name: 'Active' }, { code: 0, name: 'Paused' }, { code: -1 }],
      valueKey: 'code',
      labelKey: 'name'
    });
    expect(toggles().map((el) => el.textContent?.trim())).toEqual(['Active', 'Paused', '-1']);

    toggle('Paused').click();
    await nextTick();
    expect(w.emitted('update:modelValue')).toEqual([[0]]);
  });

  it('takes Toggle children instead of options', async () => {
    const w = mountGroup(
      { options: undefined },
      {
        default: () => [
          h(Toggle as any, { value: 'b', class: 'form-toggle' }, { default: () => 'Bold' }),
          h(Toggle as any, { value: 'i', class: 'form-toggle' }, { default: () => 'Italic' })
        ]
      }
    );
    toggle('Italic').click();
    await nextTick();
    expect(w.emitted('update:modelValue')).toEqual([['i']]);
  });

  it('renders each option through the option slot', () => {
    mountGroup({}, { option: ({ label }: { label: string }) => h('em', label.toUpperCase()) });
    expect(toggles()[0]!.querySelector('em')!.textContent).toBe('LIST');
  });

  it('is described by its help and error, and submits under its name', async () => {
    mountGroup({ help: 'How to show the items', error: 'Pick a view', name: 'view', defaultValue: 'grid' });
    await nextTick();

    const ids = group().getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual([
      'How to show the items',
      'Pick a view'
    ]);
    expect(group().getAttribute('aria-invalid')).toBe('true');
    expect(document.querySelector<HTMLInputElement>('input[type="hidden"][name="view"]')!.value).toBe('grid');
  });

  it('disables every toggle', () => {
    mountGroup({ disabled: true });
    expect(toggles().every((el) => (el as HTMLButtonElement).disabled)).toBe(true);
  });

  it('lines up vertically', () => {
    mountGroup({ orientation: 'vertical' });
    expect(group().getAttribute('data-orientation')).toBe('vertical');
  });
});
