import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { ToggleGroup, Toggle, FieldRoot, FieldLabel, FieldDescription } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

const toggles = () =>
  ['left', 'center', 'right'].map((value) =>
    h(Toggle as any, { value, key: value, 'data-value': value }, { default: () => value })
  );

function mountGroup(props: Record<string, unknown> = {}) {
  wrapper = mount(ToggleGroup as any, { props, slots: { default: toggles }, attachTo: document.body });
  return wrapper;
}

function mountInField(fieldProps: Record<string, unknown> = {}, groupProps: Record<string, unknown> = {}) {
  wrapper = mount(FieldRoot as any, {
    props: fieldProps,
    slots: {
      default: () => [
        h(FieldLabel as any, { as: 'div' }, { default: () => 'Alignment' }),
        h(ToggleGroup as any, groupProps, { default: toggles }),
        h(FieldDescription as any, null, { default: () => 'Applies to every paragraph' })
      ]
    },
    attachTo: document.body
  });
  return wrapper;
}

const group = () => document.querySelector<HTMLElement>('[role="group"]')!;
const toggle = (value: string) => document.querySelector<HTMLElement>(`[data-value="${value}"]`)!;
const hidden = () =>
  [...document.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map((el) => [
    el.name,
    el.value,
    el.getAttribute('form')
  ]);

describe('ToggleGroup in a form', () => {
  it('submits each pressed toggle under its name', async () => {
    mountGroup({ name: 'style', form: 'editor', multiple: true, defaultValue: ['left', 'right'] });
    expect(hidden()).toEqual([
      ['style', 'left', 'editor'],
      ['style', 'right', 'editor']
    ]);

    toggle('left').click();
    await nextTick();
    expect(hidden()).toEqual([['style', 'right', 'editor']]);
  });

  it('submits nothing without a name, or with nothing pressed', () => {
    mountGroup({ defaultValue: 'left' });
    expect(hidden()).toEqual([]);
    wrapper!.unmount();

    mountGroup({ name: 'align' });
    expect(hidden()).toEqual([]);
  });

  it('marks the group and every toggle invalid', () => {
    mountGroup({ invalid: true });
    expect(group().getAttribute('aria-invalid')).toBe('true');
    expect(['left', 'center', 'right'].every((value) => toggle(value).hasAttribute('data-invalid'))).toBe(true);
  });

  describe('inside a field', () => {
    it('is the labeled, described group', async () => {
      mountInField();
      await nextTick();

      const label = [...document.querySelectorAll('[id]')].find((el) => el.textContent === 'Alignment')!;
      expect(group().getAttribute('aria-labelledby')).toBe(label.id);
      expect(document.getElementById(group().getAttribute('aria-describedby')!)!.textContent).toBe(
        'Applies to every paragraph'
      );
    });

    it("follows the field's disabled and invalid state, and takes its name", () => {
      mountInField({ disabled: true, invalid: true, name: 'align' }, { defaultValue: 'center' });

      expect(['left', 'center', 'right'].every((value) => (toggle(value) as HTMLButtonElement).disabled)).toBe(true);
      expect(group().getAttribute('aria-invalid')).toBe('true');
      expect(hidden()).toEqual([['align', 'center', null]]);
    });

    it("announces the field's required without pressing anything", () => {
      mountInField({ required: true });

      expect(group().getAttribute('aria-required')).toBe('true');
      expect(group().hasAttribute('data-required')).toBe(true);
      expect(document.querySelector('[aria-pressed="true"]')).toBeNull();
    });

    it("still keeps one on with the group's own required", () => {
      mountInField({}, { required: true });
      expect(toggle('left').getAttribute('aria-pressed')).toBe('true');
    });

    it('reports the field filled and dirty once a toggle is pressed', async () => {
      const w = mountInField();
      const field = () => w.element as HTMLElement;
      expect(field().hasAttribute('data-filled')).toBe(false);

      toggle('right').click();
      await nextTick();
      expect(field().hasAttribute('data-filled')).toBe(true);
      expect(field().hasAttribute('data-dirty')).toBe(true);
    });

    it('marks the field touched once focus leaves the group, not between toggles', async () => {
      const w = mountInField();
      const field = () => w.element as HTMLElement;

      toggle('left').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: toggle('center') }));
      await nextTick();
      expect(field().hasAttribute('data-touched')).toBe(false);

      toggle('center').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
      await nextTick();
      expect(field().hasAttribute('data-touched')).toBe(true);
    });
  });
});
