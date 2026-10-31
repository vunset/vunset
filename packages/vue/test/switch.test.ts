import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, nextTick } from 'vue';
import { SwitchRoot, SwitchThumb, FieldRoot, FieldDescription, FieldError } from '../src';

function mountSwitch(props: Record<string, any> = {}, slots?: any) {
  return mount(SwitchRoot as any, {
    props,
    slots: slots ?? { default: () => h(SwitchThumb, { class: 'thumb' }) },
    attachTo: document.body,
  });
}

const root = (w: any) => w.find('[role="switch"]');
const input = (w: any) => w.find('input[type="checkbox"]');

describe('Switch', () => {
  it('takes a number for default-checked, on unless it is 0', () => {
    expect(root(mountSwitch({ defaultChecked: 1 })).attributes('aria-checked')).toBe('true');
    expect(root(mountSwitch({ defaultChecked: 0 })).attributes('aria-checked')).toBe('false');
  });

  describe('rendering', () => {
    it('renders a button with role="switch" and a hidden checkbox beside it', () => {
      const w = mountSwitch({ name: 'toggle' });
      expect(root(w).element.tagName).toBe('BUTTON');
      expect(root(w).attributes('type')).toBe('button');
      expect(root(w).element.nextElementSibling).toBe(input(w).element);
      expect(input(w).attributes('aria-hidden')).toBe('true');
      expect(input(w).attributes('tabindex')).toBe('-1');
    });

    it('renders any other element given by `as`', () => {
      expect(root(mountSwitch({ as: 'span' })).element.tagName).toBe('SPAN');
    });

    it('mirrors the root state hooks onto the thumb', async () => {
      const w = mountSwitch({ defaultChecked: true, disabled: true });
      const thumb = w.find('[role="switch"] .thumb');
      expect(root(w).attributes('data-part')).toBe('root');
      expect(thumb.attributes('data-part')).toBe('thumb');
      expect(thumb.attributes()).toHaveProperty('data-checked');
      expect(thumb.attributes()).toHaveProperty('data-disabled');
      await w.setProps({ disabled: false });
      await root(w).trigger('click');
      expect(thumb.attributes()).toHaveProperty('data-unchecked');
      expect(thumb.attributes()).not.toHaveProperty('data-checked');
    });

    it('emits data-unchecked rather than omitting the attribute when off', () => {
      const w = mountSwitch();
      expect(root(w).attributes()).toHaveProperty('data-unchecked');
      expect(root(w).attributes()).not.toHaveProperty('data-checked');
    });
  });

  describe('interactions', () => {
    it('toggles when clicked', async () => {
      const w = mountSwitch();
      expect(root(w).attributes('aria-checked')).toBe('false');
      await root(w).trigger('click');
      expect(root(w).attributes('aria-checked')).toBe('true');
      await root(w).trigger('click');
      expect(root(w).attributes('aria-checked')).toBe('false');
    });

    it('updates when the underlying input is toggled directly', async () => {
      const w = mountSwitch({ name: 'toggle' });
      const el = input(w).element as HTMLInputElement;
      el.checked = true;
      await input(w).trigger('change');
      expect(root(w).attributes('aria-checked')).toBe('true');
    });

    // A button gets these keys from the browser; anything else from the switch.
    it.each(['Enter', ' '])('can be activated with the %s key when not a button', async (key) => {
      const w = mountSwitch({ as: 'span' });
      const target = root(w);
      await target.trigger('keydown', { key });
      await target.trigger('keyup', { key });
      expect(target.attributes('aria-checked')).toBe('true');
    });

    it('is focusable via tabindex when not a native button', () => {
      expect(root(mountSwitch({ as: 'span' })).attributes('tabindex')).toBe('0');
      expect(root(mountSwitch()).attributes()).not.toHaveProperty('tabindex');
    });
  });

  describe('controlled state', () => {
    it('follows the model prop and does not self-update', async () => {
      const w = mountSwitch({ modelValue: false });
      await root(w).trigger('click');
      // Controlled: state only moves when the parent says so.
      expect(root(w).attributes('aria-checked')).toBe('false');
      await w.setProps({ modelValue: true });
      expect(root(w).attributes('aria-checked')).toBe('true');
    });

    it('supports v-model', async () => {
      const Host = defineComponent({
        setup() {
          const checked = ref(false);
          return { checked };
        },
        render() {
          return h(SwitchRoot as any, {
            modelValue: this.checked,
            'onUpdate:modelValue': (v: boolean) => {
              this.checked = v;
            },
          });
        },
      });
      const w = mount(Host, { attachTo: document.body });
      await w.find('[role="switch"]').trigger('click');
      await nextTick();
      expect(w.find('[role="switch"]').attributes('aria-checked')).toBe('true');
    });
  });

  describe('trueValue and falseValue', () => {
    it('emits the given strings instead of booleans', async () => {
      const w = mountSwitch({ trueValue: 'on', falseValue: 'off', modelValue: 'off' });
      await root(w).trigger('click');
      expect(w.emitted('update:modelValue')?.[0]).toEqual(['on']);
    });

    it('emits the given numbers on the way back off', async () => {
      const w = mountSwitch({ trueValue: 1, falseValue: 0, modelValue: 1 });
      expect(root(w).attributes('aria-checked')).toBe('true');
      await root(w).trigger('click');
      expect(w.emitted('update:modelValue')?.[0]).toEqual([0]);
    });

    it('stays uncontrolled while the model is undefined', async () => {
      const w = mountSwitch({ trueValue: 'on', falseValue: 'off' });
      await root(w).trigger('click');
      expect(root(w).attributes('aria-checked')).toBe('true');
      expect(w.emitted('update:modelValue')?.[0]).toEqual(['on']);
    });
  });

  describe('events', () => {
    it('emits checkedChange with the new value', async () => {
      const w = mountSwitch();
      await root(w).trigger('click');
      const emitted = w.emitted('change');
      expect(emitted).toHaveLength(1);
      expect(emitted![0][0]).toBe(true);
    });

    it('dispatches exactly one click to ancestors per user click', async () => {
      const onClick = vi.fn();
      const Host = defineComponent({
        render() {
          return h('div', { onClick }, [h(SwitchRoot as any)]);
        },
      });
      const w = mount(Host, { attachTo: document.body });
      await w.find('[role="switch"]').trigger('click');
      // The click forwarded to the hidden input must not bubble a second time.
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not submit a surrounding form', async () => {
      const onSubmit = vi.fn((event: Event) => event.preventDefault());
      const Host = defineComponent({
        render() {
          return h('form', { onSubmit }, [h(SwitchRoot as any)]);
        },
      });
      const w = mount(Host, { attachTo: document.body });
      await w.find('[role="switch"]').trigger('click');
      expect(w.find('[role="switch"]').attributes('aria-checked')).toBe('true');
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('hands focus that lands on the hidden input to the root', () => {
      const w = mountSwitch({ name: 'toggle' });
      (input(w).element as HTMLInputElement).focus();
      expect(document.activeElement).toBe(root(w).element);
    });
  });

  describe('prop: disabled', () => {
    it('disables a button outright, leaving it out of the tab order', () => {
      const w = mountSwitch({ disabled: true });
      expect(root(w).attributes('aria-disabled')).toBe('true');
      expect(root(w).attributes()).toHaveProperty('disabled');
    });

    it('marks any other element aria-disabled, without a tabindex', () => {
      const w = mountSwitch({ disabled: true, as: 'span' });
      expect(root(w).attributes('aria-disabled')).toBe('true');
      expect(root(w).attributes()).not.toHaveProperty('disabled');
      expect(root(w).attributes()).not.toHaveProperty('tabindex');
    });

    it('does not toggle when clicked', async () => {
      const w = mountSwitch({ disabled: true });
      await root(w).trigger('click');
      expect(root(w).attributes('aria-checked')).toBe('false');
    });
  });

  describe('prop: readOnly', () => {
    it('sets aria-readonly only when enabled', () => {
      expect(root(mountSwitch({ readOnly: true })).attributes('aria-readonly')).toBe('true');
      expect(root(mountSwitch()).attributes()).not.toHaveProperty('aria-readonly');
    });

    it('does not toggle when clicked', async () => {
      const w = mountSwitch({ readOnly: true });
      await root(w).trigger('click');
      expect(root(w).attributes('aria-checked')).toBe('false');
    });

    it('does not toggle when a wrapping label clicks the input directly', async () => {
      const w = mountSwitch({ name: 'toggle', readOnly: true });
      (input(w).element as HTMLInputElement).click();
      await nextTick();
      expect(root(w).attributes('aria-checked')).toBe('false');
      // The native input is undone too, so a form would not submit it as on.
      expect((input(w).element as HTMLInputElement).checked).toBe(false);
    });
  });

  describe('form participation', () => {
    it('leaves the input out without a name, and a press still toggles', async () => {
      const w = mountSwitch();
      expect(input(w).exists()).toBe(false);
      await root(w).trigger('click');
      expect(root(w).attributes('aria-checked')).toBe('true');
      expect(w.emitted('update:modelValue')?.[0]).toEqual([true]);
    });

    it('sets the name on the input, not on the root', () => {
      const w = mountSwitch({ name: 'toggle' });
      expect(input(w).attributes('name')).toBe('toggle');
      expect(root(w).attributes()).not.toHaveProperty('name');
    });

    it('does not set a value attribute by default', () => {
      expect(input(mountSwitch({ name: 'toggle' })).attributes()).not.toHaveProperty('value');
    });

    it('exposes a writable checked ref for programmatic control', async () => {
      // `defineExpose` still hands this out, so it is API even without a
      // composable to call.
      const w = mountSwitch();
      (w.vm as any).checked = true;
      await nextTick();

      expect(root(w).attributes('aria-checked')).toBe('true');
      expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('leaves the unchecked-value input submittable', async () => {
      // A disabled input is not submitted, so a stray `disabled` here would
      // silently drop the value the whole feature exists to send.
      const w = mountSwitch({ name: 'alerts', uncheckedValue: 'off' });
      const hidden = document.querySelector('input[type="hidden"]')!;

      expect(hidden.getAttribute('name')).toBe('alerts');
      expect(hidden.hasAttribute('disabled')).toBe(false);

      await w.setProps({ disabled: true });
      expect(document.querySelector('input[type="hidden"]')!.hasAttribute('disabled')).toBe(true);
    });

    it('disables the unchecked-value input with a disabled FieldRoot around it', () => {
      const w = mount(FieldRoot as any, {
        props: { disabled: true },
        slots: { default: () => h(SwitchRoot as any, { name: 'alerts', uncheckedValue: 'off' }) },
      });
      expect(w.find('input[type="hidden"]').attributes()).toHaveProperty('disabled');
    });

    it('renders a hidden input for uncheckedValue only while unchecked', async () => {
      const w = mountSwitch({ name: 'toggle', uncheckedValue: 'off' });
      expect(w.find('input[type="hidden"]').attributes('value')).toBe('off');
      await root(w).trigger('click');
      expect(w.find('input[type="hidden"]').exists()).toBe(false);
    });
  });

  describe('prop merging', () => {
    it('lets external attrs override built-in attributes', () => {
      const w = mountSwitch({ 'aria-label': 'Custom' } as any);
      expect(root(w).attributes('aria-label')).toBe('Custom');
    });

    it('runs the external click handler and still toggles', async () => {
      const onClick = vi.fn();
      const w = mountSwitch({ onClick } as any);
      await root(w).trigger('click');
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(root(w).attributes('aria-checked')).toBe('true');
    });

    it('lets the external handler cancel the internal one', async () => {
      const w = mountSwitch({
        onClick: (e: any) => e.preventInternalHandler(),
      } as any);
      await root(w).trigger('click');
      expect(root(w).attributes('aria-checked')).toBe('false');
    });

    it('concatenates class instead of clobbering it', () => {
      const w = mountSwitch({ class: 'mine' } as any);
      expect(root(w).classes()).toContain('mine');
    });
  });

  describe('inside a field', () => {
    it('is required by the field', () => {
      const w = mount(FieldRoot as any, {
        props: { name: 'toggle', required: true },
        slots: { default: () => h(SwitchRoot as any) },
      });

      expect(w.find('[role="switch"]').attributes('aria-required')).toBe('true');
      // Announced only: the app validates, not the browser.
      expect((w.find('input').element as HTMLInputElement).required).toBe(false);
      w.unmount();
    });

    it('is described by the field description and error', async () => {
      const w = mount(FieldRoot as any, {
        props: { invalid: true },
        slots: {
          default: () => [
            h(SwitchRoot as any),
            h(FieldDescription as any, null, { default: () => 'Sends a weekly digest' }),
            h(FieldError as any, null, { default: () => 'Turn this on to continue' })
          ]
        },
        attachTo: document.body
      });
      await nextTick();

      const ids = w.find('[role="switch"]').attributes('aria-describedby')?.split(' ');
      expect(ids).toContain(w.find('p').attributes('id'));
      expect(ids).toHaveLength(2);
      w.unmount();
    });
  });
});
