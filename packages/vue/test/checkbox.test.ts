import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import {
  CheckboxRoot,
  CheckboxIndicator,
  RadioGroup,
  RadioRoot,
  RadioIndicator,
  FieldRoot,
  FieldLabel,
  FieldDescription,
} from '../src';

const mountCheckbox = (props: Record<string, any> = {}, slot?: any) =>
  mount(CheckboxRoot as any, {
    props,
    slots: slot ? { default: slot } : undefined,
    attachTo: document.body,
  });

/** Long enough for an exit animation to finish and the indicator to unmount. */
async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await nextTick();
  }
}

const box = (w: any) => w.find('[role="checkbox"]');
const input = (w: any) => w.find('input[type="checkbox"]');

describe('Checkbox', () => {
  describe('rendering', () => {
    it('is a button with a hidden input right after it', () => {
      const w = mountCheckbox({ name: 'terms' });
      expect(box(w).element.tagName).toBe('BUTTON');
      expect(box(w).attributes('type')).toBe('button');
      expect(box(w).element.querySelector('input')).toBeNull();
      expect(box(w).element.nextElementSibling).toBe(input(w).element);
      expect(input(w).attributes('aria-hidden')).toBe('true');
      expect(input(w).attributes('aria-hidden')).toBe('true');
      expect(input(w).attributes('tabindex')).toBe('-1');
    });

    it('carries data-part="root"', () => {
      expect(box(mountCheckbox()).attributes('data-part')).toBe('root');
    });

    it('emits data-unchecked rather than dropping the attribute', () => {
      const w = mountCheckbox();
      expect(box(w).attributes()).toHaveProperty('data-unchecked');
      expect(box(w).attributes()).not.toHaveProperty('data-checked');
    });

    it('renders any other element given by `as`, focusable by tabindex', () => {
      const w = mountCheckbox({ as: 'span' });
      expect(box(w).element.tagName).toBe('SPAN');
      expect(box(w).attributes('tabindex')).toBe('0');
      expect(box(w).attributes()).not.toHaveProperty('type');
    });
  });

  it('takes a number for default-checked, checked unless it is 0', () => {
    expect(box(mountCheckbox({ defaultChecked: 1 })).attributes('aria-checked')).toBe('true');
    expect(box(mountCheckbox({ defaultChecked: 0 })).attributes('aria-checked')).toBe('false');
  });

  describe('the hidden input', () => {
    it('is left out without a name or a label, and a press still toggles', async () => {
      // A table of unnamed row checkboxes would otherwise carry an input per row.
      const w = mountCheckbox();
      expect(input(w).exists()).toBe(false);
      await box(w).trigger('click');
      expect(w.emitted('update:modelValue')?.[0]).toEqual([true]);
      expect(w.emitted('change')?.[0]?.[0]).toBe(true);
    });

    it('is rendered by the server when named', async () => {
      const named = await renderToString(createSSRApp(() => h(CheckboxRoot as any, { name: 'terms' })));
      const unnamed = await renderToString(createSSRApp(() => h(CheckboxRoot as any)));
      expect(named).toContain('<input');
      expect(unnamed).not.toContain('<input');
    });

    it('is added inside a wrapping label, which then toggles it', async () => {
      const w = mount(
        defineComponent({ render: () => h('label', [h(CheckboxRoot as any), 'Accept']) }),
        { attachTo: document.body },
      );
      await nextTick();
      expect(input(w).exists()).toBe(true);
      (w.find('label').element as HTMLLabelElement).click();
      await nextTick();
      expect(box(w).attributes('aria-checked')).toBe('true');
      w.unmount();
    });

    it('is never displaced from the control', () => {
      // `position: absolute` with a `left`/`top` resolves against the nearest
      // positioned ancestor — usually the page. The input would then sit at the
      // center of the document, and anything that focuses it (a wrapping
      // `<label>`, most obviously) would scroll the page there.
      const w = mountCheckbox({ name: 'terms' });
      const style = input(w).attributes('style') ?? '';

      expect(style).toContain('position: absolute');
      expect(style).not.toMatch(/(^|;)\s*left:/);
      expect(style).not.toMatch(/(^|;)\s*top:/);
      expect(style).not.toContain('translate');
    });

    it('stays put for a named radio too, which is where it bit', () => {
      mountRadios({ name: 'plan' });
      const style =
        document.querySelector<HTMLInputElement>('input[type="radio"]')!.getAttribute('style') ?? '';
      expect(style).not.toMatch(/(^|;)\s*left:/);
      expect(style).not.toMatch(/(^|;)\s*top:/);
    });
  });

  describe('toggling', () => {
    it('toggles on click', async () => {
      const w = mountCheckbox();
      expect(box(w).attributes('aria-checked')).toBe('false');
      await box(w).trigger('click');
      expect(box(w).attributes('aria-checked')).toBe('true');
      await box(w).trigger('click');
      expect(box(w).attributes('aria-checked')).toBe('false');
    });

    // A button gets these keys from the browser; anything else from the checkbox.
    it.each(['Enter', ' '])('activates with the %s key when not a button', async (key) => {
      const w = mountCheckbox({ as: 'span' });
      await box(w).trigger('keydown', { key });
      await box(w).trigger('keyup', { key });
      expect(box(w).attributes('aria-checked')).toBe('true');
    });

    it('does not move while read-only', async () => {
      const w = mountCheckbox({ readOnly: true });
      await box(w).trigger('click');
      expect(box(w).attributes('aria-checked')).toBe('false');
    });

    it('does not move while disabled', async () => {
      const w = mountCheckbox({ disabled: true });
      await box(w).trigger('click');
      expect(box(w).attributes('aria-checked')).toBe('false');
    });

    it('round-trips through v-model', async () => {
      const onUpdate = vi.fn();
      const w = mountCheckbox({ 'onUpdate:modelValue': onUpdate });
      await box(w).trigger('click');
      expect(onUpdate).toHaveBeenCalledWith(true);
    });

    it('follows a controlled value and does not self-update', async () => {
      const w = mountCheckbox({ modelValue: false });
      await box(w).trigger('click');
      expect(box(w).attributes('aria-checked')).toBe('false');
      await w.setProps({ modelValue: true });
      expect(box(w).attributes('aria-checked')).toBe('true');
    });
  });

  describe('trueValue and falseValue', () => {
    it('emits the given values instead of booleans', async () => {
      const w = mountCheckbox({ trueValue: 'yes', falseValue: 'no', modelValue: 'no' });
      await box(w).trigger('click');
      expect(w.emitted('update:modelValue')?.[0]).toEqual(['yes']);
    });

    it('reads as checked when the model matches trueValue', () => {
      const w = mountCheckbox({ trueValue: 'yes', falseValue: 'no', modelValue: 'yes' });
      expect(box(w).attributes('aria-checked')).toBe('true');
    });

    it('reads as unchecked for anything else', () => {
      const w = mountCheckbox({ trueValue: 'yes', falseValue: 'no', modelValue: 'no' });
      expect(box(w).attributes('aria-checked')).toBe('false');
    });

    it('emits falseValue on the way back off', async () => {
      const w = mountCheckbox({ trueValue: 1, falseValue: 0, modelValue: 1 });
      await box(w).trigger('click');
      expect(w.emitted('update:modelValue')?.[0]).toEqual([0]);
    });

    it('still emits booleans when neither is given', async () => {
      const w = mountCheckbox();
      await box(w).trigger('click');
      expect(w.emitted('update:modelValue')?.[0]).toEqual([true]);
    });

    it('stays uncontrolled while the model is undefined', async () => {
      // The comparison against `trueValue` must not turn "no value yet" into a
      // controlled `false`, or the box would never move on its own.
      const w = mountCheckbox({ trueValue: 'yes', falseValue: 'no' });
      await box(w).trigger('click');
      expect(box(w).attributes('aria-checked')).toBe('true');
    });

    it('leaves the submitted form value alone', () => {
      // `value` is what a form sends; `trueValue` never leaves the model.
      const w = mountCheckbox({
        name: 'terms',
        value: 'accepted',
        trueValue: 'yes',
        modelValue: 'yes',
      });
      expect((input(w).element as HTMLInputElement).value).toBe('accepted');
    });
  });

  describe('array v-model', () => {
    it('reads as checked while the array holds its value', () => {
      expect(box(mountCheckbox({ modelValue: ['a', 'b'], value: 'b' })).attributes('aria-checked')).toBe('true');
      expect(box(mountCheckbox({ modelValue: ['a'], value: 'b' })).attributes('aria-checked')).toBe('false');
    });

    it('adds its value when checked', async () => {
      const w = mountCheckbox({ modelValue: ['a'], value: 'b' });
      await box(w).trigger('click');
      expect(w.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']]);
    });

    it('removes its value when unchecked, leaving the rest in order', async () => {
      const w = mountCheckbox({ modelValue: [1, 2, 3], value: 2 });
      await box(w).trigger('click');
      expect(w.emitted('update:modelValue')?.[0]).toEqual([[1, 3]]);
    });

    it('keeps several boxes on one array in step', async () => {
      const Host = defineComponent({
        setup() {
          const picked = ref<string[]>([]);
          return { picked };
        },
        render() {
          return ['x', 'y'].map((v) =>
            h(CheckboxRoot as any, {
              value: v,
              modelValue: this.picked,
              'onUpdate:modelValue': (next: string[]) => (this.picked = next),
            }),
          );
        },
      });
      const w = mount(Host, { attachTo: document.body });
      const boxes = w.findAll('[role="checkbox"]');
      await boxes[1].trigger('click');
      await boxes[0].trigger('click');
      expect((w.vm as any).picked).toEqual(['y', 'x']);
      await boxes[1].trigger('click');
      expect((w.vm as any).picked).toEqual(['x']);
      expect(boxes.map((b) => b.attributes('aria-checked'))).toEqual(['true', 'false']);
    });

    it('submits its value as a string', () => {
      const w = mountCheckbox({ name: 'n', value: 7, modelValue: [7] });
      expect((input(w).element as HTMLInputElement).value).toBe('7');
    });
  });

  describe('indeterminate', () => {
    it('announces the third state', () => {
      const w = mountCheckbox({ name: 'all', indeterminate: true });
      expect(box(w).attributes('aria-checked')).toBe('mixed');
      expect(box(w).attributes()).toHaveProperty('data-indeterminate');
      // A DOM property, not an attribute — there is no HTML to write it as.
      expect((input(w).element as HTMLInputElement).indeterminate).toBe(true);
    });

    it('resolves to checked when pressed', async () => {
      // It is a presentation state, not a value to cycle back through.
      const w = mountCheckbox({ indeterminate: true });
      await box(w).trigger('click');
      expect(w.emitted('update:modelValue')?.[0]).toEqual([true]);
    });
  });

  describe('CheckboxIndicator', () => {
    const indicator = (w: any) => w.find('[data-part="indicator"]');
    const withIndicator = (props: Record<string, any> = {}, indicatorProps: Record<string, any> = {}) =>
      mountCheckbox(props, () => h(CheckboxIndicator as any, indicatorProps, { default: () => '✓' }));

    it('renders only while checked', async () => {
      const w = withIndicator();
      expect(indicator(w).exists()).toBe(false);
      await box(w).trigger('click');
      expect(indicator(w).exists()).toBe(true);
      expect(indicator(w).attributes()).toHaveProperty('data-checked');
    });

    it('renders while indeterminate', () => {
      const w = withIndicator({ indeterminate: true });
      expect(indicator(w).attributes()).toHaveProperty('data-indeterminate');
    });

    it('plays an exit phase before unmounting', async () => {
      const w = withIndicator({ defaultChecked: true });
      await box(w).trigger('click');
      await nextTick();
      expect(indicator(w).attributes()).toHaveProperty('data-leave-to');
      await settle();
      expect(indicator(w).exists()).toBe(false);
    });

    it('stays in the DOM with keepMounted', async () => {
      const w = withIndicator({}, { keepMounted: true });
      expect(indicator(w).attributes()).toHaveProperty('data-unchecked');
      await box(w).trigger('click');
      expect(indicator(w).attributes()).toHaveProperty('data-checked');
    });
  });

  describe('forms', () => {
    it('submits under its name when checked', () => {
      const w = mountCheckbox({ name: 'terms', value: 'yes', defaultChecked: true });
      const el = input(w).element as HTMLInputElement;
      expect(el.name).toBe('terms');
      expect(el.value).toBe('yes');
      expect(el.checked).toBe(true);
    });
  });

  describe('inside a field', () => {
    it('is required by the field', () => {
      const w = mount(FieldRoot as any, {
        props: { name: 'terms', required: true },
        slots: { default: () => h(CheckboxRoot as any) },
      });

      expect(w.find('[role="checkbox"]').attributes('aria-required')).toBe('true');
      // Announced only: the app validates, not the browser.
      expect((w.find('input').element as HTMLInputElement).required).toBe(false);
      w.unmount();
    });

    it('takes the field label and its disabled state', async () => {
      const w = mount(FieldRoot as any, {
        props: { name: 'terms', disabled: true },
        slots: {
          default: () => [
            h(FieldLabel as any, null, { default: () => 'Accept' }),
            h(CheckboxRoot as any),
          ],
        },
        attachTo: document.body,
      });

      expect(w.find('label').attributes('for')).toBe(w.find('[role="checkbox"]').attributes('id'));
      expect((w.find('input').element as HTMLInputElement).disabled).toBe(true);
    });

    it('is described by the field description', async () => {
      const w = mount(FieldRoot as any, {
        slots: {
          default: () => [h(CheckboxRoot as any), h(FieldDescription as any, null, { default: () => 'Required to continue' })],
        },
        attachTo: document.body,
      });
      await nextTick();

      const description = w.find('p');
      expect(description.attributes('id')).toBeTruthy();
      expect(w.find('[role="checkbox"]').attributes('aria-describedby')).toBe(description.attributes('id'));
    });
  });
});

const radios = () => Array.from(document.querySelectorAll<HTMLElement>('[role="radio"]'));
const checkedValues = () =>
  radios()
    .filter((el) => el.getAttribute('aria-checked') === 'true')
    .map((el) => el.dataset.value);

function mountRadios(groupProps: Record<string, any> = {}, values = ['a', 'b', 'c'], radioProps: Record<string, any> = {}) {
  return mount(
    defineComponent({
      render() {
        return h(RadioGroup as any, groupProps, {
          default: () =>
            values.map((v) =>
              h(RadioRoot as any, { value: v, key: v, ...radioProps }, { default: () => h(RadioIndicator as any, { class: 'dot' }) }),
            ),
        });
      },
    }),
    { attachTo: document.body },
  );
}

const press = (el: Element, key: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('RadioGroup', () => {
  it('is named and described by a surrounding field', async () => {
    const w = mount(FieldRoot as any, {
      slots: {
        default: () => [
          h(FieldLabel as any, { as: 'div' }, () => 'Plan'),
          h(RadioGroup as any, null, () => h(RadioRoot as any, { value: 'a' })),
          h(FieldDescription as any, () => 'Change it any time'),
        ],
      },
      attachTo: document.body,
    });
    await nextTick();

    const group = w.find('[role="radiogroup"]');
    const label = w.findAll('div').find((el) => el.text() === 'Plan')!;
    expect(group.attributes('aria-labelledby')).toBe(label.attributes('id'));
    expect(group.attributes('aria-describedby')).toBe(w.find('p').attributes('id'));
    w.unmount();
  });

  it('is required by a surrounding field', () => {
    const w = mount(FieldRoot as any, {
      props: { required: true },
      slots: { default: () => h(RadioGroup as any, null, () => h(RadioRoot as any, { value: 'a' })) },
    });

    expect(w.find('[role="radiogroup"]').attributes('aria-required')).toBe('true');
    w.unmount();
  });

  describe('RadioIndicator', () => {
    it('renders inside the chosen radio only, and follows the choice', async () => {
      const w = mountRadios({ defaultValue: 'a' });
      const dots = () => radios().map((el) => el.querySelector('.dot') !== null);
      expect(dots()).toEqual([true, false, false]);
      radios()[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
      expect(dots()).toEqual([false, true, false]);
      expect(w.find('.dot').attributes('data-part')).toBe('indicator');
    });
  });

  describe('ownership', () => {
    it('marks only the chosen radio', () => {
      mountRadios({ defaultValue: 'b' });
      expect(checkedValues()).toEqual(['b']);
    });

    it('choosing one unchooses its sibling', async () => {
      const w = mountRadios({ defaultValue: 'a' });
      radios()[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['c']);
    });

    it('never unchooses itself when pressed again', async () => {
      const w = mountRadios({ defaultValue: 'a' });
      radios()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['a']);
    });

    it('shares one name so the browser groups them natively', () => {
      mountRadios();
      const names = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
        .map((el) => el.name);
      expect(new Set(names).size).toBe(1);
      expect(names[0]).toBeTruthy();
    });

    it('reports itself as a radiogroup', () => {
      mountRadios();
      expect(document.querySelector('[role="radiogroup"]')).not.toBeNull();
    });
  });

  describe('as a button', () => {
    function mountLabeled() {
      return mount(
        defineComponent({
          render() {
            return h(RadioGroup as any, { defaultValue: 'a' }, {
              default: () =>
                ['a', 'b'].map((v) =>
                  h('label', { key: v }, [h(RadioRoot as any, { value: v }), `Option ${v}`]),
                ),
            });
          },
        }),
        { attachTo: document.body },
      );
    }

    it('renders each radio as a real button, its input right after it', () => {
      mountRadios({}, ['a', 'b']);
      expect(radios().map((el) => el.tagName)).toEqual(['BUTTON', 'BUTTON']);
      expect(radios().map((el) => el.nextElementSibling?.tagName)).toEqual(['INPUT', 'INPUT']);
    });

    it('lets a wrapping label name the radio', () => {
      mountLabeled();
      const labels = radios().map((el) => (el as HTMLButtonElement).labels?.[0]?.textContent);
      expect(labels).toEqual(['Option a', 'Option b']);
    });

    it('chooses the radio when its label is clicked', async () => {
      const w = mountLabeled();
      (radios()[1].closest('label') as HTMLLabelElement).click();
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['b']);
    });

    it('moves the choice with arrow keys on any other element too', async () => {
      const w = mountRadios({ defaultValue: 'a' }, ['a', 'b'], { as: 'span' });
      press(radios()[0], 'ArrowDown');
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['b']);
      expect(document.activeElement).toBe(radios()[1]);
    });
  });

  describe('one tab stop', () => {
    it('gives the tab stop to the chosen radio', () => {
      mountRadios({ defaultValue: 'b' });
      expect(radios().map((el) => el.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    });

    it('gives it to the first radio while nothing is chosen', () => {
      mountRadios();
      expect(radios().map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    });
  });

  describe('arrow keys', () => {
    it('move and choose in one step', async () => {
      const w = mountRadios({ defaultValue: 'a' });
      press(radios()[0], 'ArrowDown');
      await w.vm.$nextTick();

      // Moving *is* choosing in a radio group.
      expect(checkedValues()).toEqual(['b']);
      expect(document.activeElement).toBe(radios()[1]);
    });

    it('wrap past the end by default', async () => {
      const w = mountRadios({ defaultValue: 'c' });
      press(radios()[2], 'ArrowRight');
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['a']);
    });

    it('stop at the end when looping is off', async () => {
      const w = mountRadios({ defaultValue: 'c', loop: false });
      press(radios()[2], 'ArrowRight');
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['c']);
    });

    it('go backwards too', async () => {
      const w = mountRadios({ defaultValue: 'b' });
      press(radios()[1], 'ArrowUp');
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['a']);
    });

    it('Home and End reach the ends', async () => {
      const w = mountRadios({ defaultValue: 'b' });
      press(radios()[1], 'End');
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['c']);

      press(radios()[2], 'Home');
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['a']);
    });
  });

  describe('disabled', () => {
    it('disables every radio when the group is', () => {
      mountRadios({ disabled: true });
      const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
      expect(inputs.every((el) => el.disabled)).toBe(true);
    });

    it('ignores a press while the group is read-only', async () => {
      const w = mountRadios({ defaultValue: 'a', readOnly: true });
      radios()[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['a']);
    });

    it('skips a disabled radio when arrowing past it', async () => {
      const w = mount(
        defineComponent({
          render() {
            return h(RadioGroup as any, { defaultValue: 'a' }, {
              default: () => [
                h(RadioRoot as any, { value: 'a' }),
                h(RadioRoot as any, { value: 'b', disabled: true }),
                h(RadioRoot as any, { value: 'c' }),
              ],
            });
          },
        }),
        { attachTo: document.body },
      );

      press(radios()[0], 'ArrowDown');
      await w.vm.$nextTick();

      expect(checkedValues()).toEqual(['c']);
    });
  });

  describe('v-model', () => {
    it('round-trips', async () => {
      const onUpdate = vi.fn();
      const w = mountRadios({ defaultValue: 'a', 'onUpdate:modelValue': onUpdate });
      radios()[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await w.vm.$nextTick();
      expect(onUpdate).toHaveBeenCalledWith('b');
    });

    it('follows a controlled value', async () => {
      const Host = defineComponent({
        setup: () => ({ picked: ref('a') }),
        render() {
          return h(RadioGroup as any, { modelValue: this.picked }, {
            default: () => ['a', 'b'].map((v) => h(RadioRoot as any, { value: v, key: v })),
          });
        },
      });

      const w = mount(Host, { attachTo: document.body });
      radios()[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['a']);

      w.vm.picked = 'b';
      await w.vm.$nextTick();
      expect(checkedValues()).toEqual(['b']);
    });
  });
});
