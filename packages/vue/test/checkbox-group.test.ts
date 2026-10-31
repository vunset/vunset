import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createSSRApp, defineComponent, h, nextTick, ref, type Ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { CheckboxGroup, CheckboxRoot, FieldRoot, FieldLabel, FieldDescription } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

const boxes = () => Array.from(document.querySelectorAll<HTMLElement>('[role="checkbox"]'));
const box = (value: string) => document.querySelector<HTMLElement>(`[data-value="${value}"]`)!;
// The input sits right after its box: a button may hold no interactive content.
const inputOf = (el: HTMLElement) => el.nextElementSibling as HTMLInputElement;
const group = () => document.querySelector<HTMLElement>('[role="group"]')!;

interface BoxSpec {
  value?: string;
  parent?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  [key: string]: unknown;
}

/** A group of boxes; `model` is wired as `v-model` when given. */
function mountGroup(
  groupProps: Record<string, unknown> = {},
  specs: BoxSpec[] = [{ value: 'a' }, { value: 'b' }, { value: 'c' }],
  model?: Ref<string[] | undefined>
) {
  wrapper = mount(
    defineComponent({
      render: () =>
        h(
          CheckboxGroup as any,
          {
            ...groupProps,
            ...(model && {
              modelValue: model.value,
              'onUpdate:modelValue': (next: string[]) => (model.value = next)
            })
          },
          {
            default: () =>
              specs.map((spec) =>
                h(CheckboxRoot as any, {
                  key: spec.value ?? 'parent',
                  'data-value': spec.value ?? 'parent',
                  ...spec
                })
              )
          }
        )
    }),
    { attachTo: document.body }
  );
  return wrapper;
}

async function click(value: string) {
  box(value).click();
  await nextTick();
}

const checked = () => boxes().map((el) => el.getAttribute('aria-checked'));

describe('CheckboxGroup', () => {
  describe('value', () => {
    it('checks the boxes whose values the array holds', () => {
      mountGroup({ defaultValue: ['b'] });
      expect(checked()).toEqual(['false', 'true', 'false']);
    });

    it('adds and removes values with v-model, emitting a new array each time', async () => {
      const model = ref<string[] | undefined>(['a']);
      mountGroup({}, undefined, model);
      const first = model.value;

      await click('c');
      expect(model.value).toEqual(['a', 'c']);
      expect(model.value).not.toBe(first);

      await click('a');
      expect(model.value).toEqual(['c']);
      expect(checked()).toEqual(['false', 'false', 'true']);
    });

    it('keeps its own state without v-model', async () => {
      mountGroup();
      await click('b');
      expect(checked()).toEqual(['false', 'true', 'false']);
    });

    it('orders values by box, with values that have no box first', async () => {
      const model = ref<string[] | undefined>(['z', 'c']);
      mountGroup({}, undefined, model);

      await click('a');
      expect(model.value).toEqual(['z', 'a', 'c']);
    });

    it('emits change with the array and the event', async () => {
      const w = mountGroup();
      await click('a');

      const [value, event] = w.findComponent({ name: 'CheckboxGroup' }).emitted('change')![0] as [string[], Event];
      expect(value).toEqual(['a']);
      expect(event).toBeInstanceOf(Event);
    });

    it("ignores a box's own v-model inside a group", () => {
      mountGroup({ defaultValue: [] }, [{ value: 'a', modelValue: true }]);
      expect(checked()).toEqual(['false']);
    });

    it('warns about a box without a value', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mountGroup({}, [{}]);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs a `value`'));
      warn.mockRestore();
    });
  });

  describe('shared state', () => {
    it('disables every box', async () => {
      const model = ref<string[] | undefined>([]);
      mountGroup({ name: 'topics', disabled: true }, undefined, model);

      expect(boxes().every((el) => el.getAttribute('aria-disabled') === 'true')).toBe(true);
      expect(boxes().every((el) => inputOf(el).disabled)).toBe(true);
      await click('a');
      expect(model.value).toEqual([]);
    });

    it('keeps read-only boxes unchanged', async () => {
      const model = ref<string[] | undefined>(['a']);
      mountGroup({ readOnly: true }, undefined, model);

      await click('a');
      await click('b');
      expect(model.value).toEqual(['a']);
      expect(boxes().every((el) => el.getAttribute('aria-readonly') === 'true')).toBe(true);
    });

    it('marks every box invalid', () => {
      mountGroup({ invalid: true });
      expect(boxes().every((el) => el.hasAttribute('data-invalid'))).toBe(true);
      expect(group().getAttribute('aria-invalid')).toBe('true');
    });

    it("gives every box's input its name and form, each submitting its own value", () => {
      mountGroup({ name: 'topics', form: 'signup', defaultValue: ['b'] });

      const inputs = boxes().map(inputOf);
      expect(inputs.map((input) => input.name)).toEqual(['topics', 'topics', 'topics']);
      expect(inputs.map((input) => input.getAttribute('form'))).toEqual(['signup', 'signup', 'signup']);
      expect(inputs.map((input) => input.value)).toEqual(['a', 'b', 'c']);
      expect(inputs.map((input) => input.checked)).toEqual([false, true, false]);
    });

    it("lets a box's own name win", () => {
      mountGroup({ name: 'topics' }, [{ value: 'a', name: 'own' }]);
      expect(inputOf(box('a')).name).toBe('own');
    });
  });

  describe('required', () => {
    it('announces it without having the browser enforce it on any input', async () => {
      mountGroup({ name: 'topics', required: true });

      expect(group().getAttribute('aria-required')).toBe('true');
      expect(boxes().map((el) => inputOf(el).required)).toEqual([false, false, false]);
      await click('b');
      expect(boxes().map((el) => inputOf(el).required)).toEqual([false, false, false]);
    });

    it('marks the group, not the boxes, as required', () => {
      mountGroup({ required: true });
      expect(group().getAttribute('aria-required')).toBe('true');
      expect(boxes().some((el) => el.hasAttribute('aria-required'))).toBe(false);
    });

    it("announces a box's own required, whatever the group's state", async () => {
      mountGroup({ name: 'topics' }, [{ value: 'terms', required: true }, { value: 'news' }]);

      expect(box('terms').getAttribute('aria-required')).toBe('true');
      await click('news');
      expect(box('terms').getAttribute('aria-required')).toBe('true');
      expect(inputOf(box('terms')).required).toBe(false);
    });

    it('requires nothing unless asked', () => {
      mountGroup({ name: 'topics' });
      expect(boxes().some((el) => inputOf(el).required)).toBe(false);
      expect(group().hasAttribute('aria-required')).toBe(false);
    });
  });

  describe('parent box', () => {
    const withParent = (extra: BoxSpec[] = []) => [{ parent: true }, { value: 'a' }, { value: 'b' }, ...extra];

    it('is already checked or indeterminate on a server render, from allValues', async () => {
      const render = (value: string[], allValues?: string[]) =>
        renderToString(
          createSSRApp({
            render: () =>
              h(CheckboxGroup as any, { modelValue: value, allValues }, () => [
                h(CheckboxRoot as any, { parent: true, class: 'parent' }),
                h(CheckboxRoot as any, { value: 'a' }),
                h(CheckboxRoot as any, { value: 'b' })
              ])
          })
        );
      const parentState = (html: string) => html.match(/class="parent"[^>]*aria-checked="(\w+)"|aria-checked="(\w+)"[^>]*class="parent"/)!.slice(1).find(Boolean);

      expect(parentState(await render(['a', 'b'], ['a', 'b']))).toBe('true');
      expect(parentState(await render(['a'], ['a', 'b']))).toBe('mixed');
      // Without them it can't know the boxes yet.
      expect(parentState(await render(['a', 'b']))).toBe('false');
    });

    it('is unchecked, indeterminate or checked as the others are', async () => {
      mountGroup({}, withParent());
      expect(box('parent').getAttribute('aria-checked')).toBe('false');

      await click('a');
      expect(box('parent').getAttribute('aria-checked')).toBe('mixed');

      await click('b');
      expect(box('parent').getAttribute('aria-checked')).toBe('true');
    });

    it('checks every box from unchecked or indeterminate, and clears them from checked', async () => {
      const model = ref<string[] | undefined>(['a']);
      mountGroup({}, withParent(), model);

      await click('parent');
      expect(model.value).toEqual(['a', 'b']);

      await click('parent');
      expect(model.value).toEqual([]);
    });

    it('leaves disabled boxes as they are, and does not count them', async () => {
      const model = ref<string[] | undefined>(['locked-on']);
      mountGroup(
        {},
        withParent([
          { value: 'locked-on', disabled: true },
          { value: 'locked-off', disabled: true }
        ]),
        model
      );

      await click('parent');
      expect(model.value).toEqual(['a', 'b', 'locked-on']);
      expect(box('parent').getAttribute('aria-checked')).toBe('true');

      await click('parent');
      expect(model.value).toEqual(['locked-on']);
    });

    it('leaves a box disabled through its own field as it is', async () => {
      const model = ref<string[] | undefined>([]);
      wrapper = mount(
        defineComponent({
          render: () =>
            h(
              CheckboxGroup as any,
              { modelValue: model.value, 'onUpdate:modelValue': (next: string[]) => (model.value = next) },
              {
                default: () => [
                  h(CheckboxRoot as any, { parent: true, 'data-value': 'parent' }),
                  h(CheckboxRoot as any, { value: 'a' }),
                  h(FieldRoot as any, { disabled: true }, { default: () => h(CheckboxRoot as any, { value: 'b' }) })
                ]
              }
            )
        }),
        { attachTo: document.body }
      );

      await click('parent');
      expect(model.value).toEqual(['a']);
      expect(box('parent').getAttribute('aria-checked')).toBe('true');
    });

    it('stays checked in a read-only group whose boxes are all checked', async () => {
      mountGroup({ readOnly: true, defaultValue: ['a', 'b'] }, withParent());
      // the boxes register after the parent has rendered
      await nextTick();
      expect(box('parent').getAttribute('aria-checked')).toBe('true');
    });

    it('submits nothing, so it renders no input', () => {
      mountGroup({ name: 'topics', required: true }, withParent());
      expect(box('parent').nextElementSibling?.tagName).not.toBe('INPUT');
    });
  });

  describe('inside a field', () => {
    function mountInField(fieldProps: Record<string, unknown> = {}, groupProps: Record<string, unknown> = {}) {
      wrapper = mount(FieldRoot as any, {
        props: fieldProps,
        slots: {
          default: () => [
            h(FieldLabel as any, { as: 'div' }, { default: () => 'Topics' }),
            h(CheckboxGroup as any, groupProps, {
              default: () =>
                ['a', 'b'].map((value) => h(CheckboxRoot as any, { value, key: value, 'data-value': value }))
            }),
            h(FieldDescription as any, null, { default: () => 'Pick any' })
          ]
        },
        attachTo: document.body
      });
      return wrapper;
    }

    it('is the labeled, described group', async () => {
      mountInField();
      await nextTick();

      const label = [...document.querySelectorAll('[id]')].find((el) => el.textContent === 'Topics')!;
      const description = document.querySelector('p')!;
      expect(group().getAttribute('aria-labelledby')).toBe(label.id);
      expect(group().getAttribute('aria-describedby')).toBe(description.id);
    });

    it("leaves the field's id, name and description off the boxes", async () => {
      mountInField({ name: 'topics' });
      await nextTick();

      const ids = boxes().map((el) => el.id);
      expect(new Set(ids).size).toBe(2);
      expect(boxes().some((el) => el.hasAttribute('aria-describedby'))).toBe(false);
      // the name still reaches the inputs, through the group
      expect(boxes().map((el) => inputOf(el).name)).toEqual(['topics', 'topics']);
    });

    it("follows the field's disabled and required state", () => {
      mountInField({ name: 'topics', disabled: true, required: true });

      expect(group().getAttribute('aria-required')).toBe('true');
      expect(boxes().every((el) => inputOf(el).disabled)).toBe(true);
    });

    it('reports the field filled while the array is non-empty', async () => {
      const w = mountInField();
      const root = () => w.element as HTMLElement;
      expect(root().hasAttribute('data-filled')).toBe(false);

      await click('a');
      expect(root().hasAttribute('data-filled')).toBe(true);
      expect(root().hasAttribute('data-dirty')).toBe(true);
    });

    it('marks the field touched when focus leaves the group, not when it moves within', async () => {
      const w = mountInField();
      const root = () => w.element as HTMLElement;

      box('a').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: box('b') }));
      await nextTick();
      expect(root().hasAttribute('data-touched')).toBe(false);

      box('b').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
      await nextTick();
      expect(root().hasAttribute('data-touched')).toBe(true);
    });

    it("lets a box's own field, inside the group, label and describe it", async () => {
      wrapper = mount(CheckboxGroup as any, {
        slots: {
          default: () =>
            h(FieldRoot as any, null, {
              default: () => [
                h(FieldLabel as any, null, { default: () => 'Vue' }),
                h(CheckboxRoot as any, { value: 'vue' }),
                h(FieldDescription as any, null, { default: () => 'The framework' })
              ]
            })
        },
        attachTo: document.body
      });
      await nextTick();

      const label = document.querySelector('label')!;
      const [only] = boxes();
      expect(label.htmlFor).toBe(only.id);
      expect(only.getAttribute('aria-describedby')).toBe(document.querySelector('p')!.id);
    });
  });
});
