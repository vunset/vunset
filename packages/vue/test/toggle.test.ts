import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { Toggle, ToggleGroup } from '../src';

function mountToggle(props: Record<string, any> = {}) {
  return mount(Toggle as any, {
    props,
    slots: { default: () => 'Bold' },
    attachTo: document.body,
  });
}

interface GroupOptions {
  groupProps?: Record<string, any>;
  values?: string[];
  disabled?: string[];
}

function mountGroup(options: GroupOptions = {}) {
  const values = options.values ?? ['left', 'center', 'right'];

  const Host = defineComponent({
    setup() {
      return () =>
        h(ToggleGroup as any, options.groupProps ?? null, {
          default: () =>
            values.map((value) =>
              h(
                Toggle as any,
                {
                  value,
                  class: `toggle-${value}`,
                  disabled: options.disabled?.includes(value),
                },
                { default: () => value },
              ),
            ),
        });
    },
  });

  return mount(Host, { attachTo: document.body });
}

const toggle = (value: string) => document.querySelector<HTMLElement>(`.toggle-${value}`)!;
const group = () => document.querySelector<HTMLElement>('[role="group"]')!;
/** The group component itself, for its emits and its exposed API. */
const groupWrapper = (w: any) => w.findComponent(ToggleGroup as any) as any;
const pressed = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[aria-pressed="true"]')).map(
    (element) => element.textContent,
  );

async function press(element: HTMLElement) {
  element.focus();
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await nextTick();
}

function key(name: string, target: HTMLElement = document.activeElement as HTMLElement) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
}

describe('Toggle', () => {
  describe('on its own', () => {
    it('renders a button that reports its pressed state', () => {
      const w = mountToggle();
      expect(w.element.tagName).toBe('BUTTON');
      expect(w.attributes('type')).toBe('button');
      expect(w.attributes('aria-pressed')).toBe('false');
    });

    it('publishes both positions as hooks, so CSS needs no :not()', async () => {
      const w = mountToggle();
      expect(w.attributes()).toHaveProperty('data-unpressed');

      await press(w.element as HTMLElement);
      expect(w.attributes()).toHaveProperty('data-pressed');
      expect(w.attributes()).not.toHaveProperty('data-unpressed');
    });

    it('toggles on click and emits both events', async () => {
      const w = mountToggle();

      await press(w.element as HTMLElement);
      expect(w.attributes('aria-pressed')).toBe('true');
      expect(w.emitted('update:modelValue')).toEqual([[true]]);

      await press(w.element as HTMLElement);
      expect(w.attributes('aria-pressed')).toBe('false');
      expect(w.emitted('update:modelValue')).toEqual([[true], [false]]);
    });

    it('starts pressed when asked to', () => {
      const w = mountToggle({ defaultPressed: true });
      expect(w.attributes('aria-pressed')).toBe('true');
    });

    it('stays put while controlled until the owner moves it', async () => {
      const w = mountToggle({ modelValue: false });

      await press(w.element as HTMLElement);
      expect(w.attributes('aria-pressed')).toBe('false');
      expect(w.emitted('update:modelValue')).toEqual([[true]]);

      await w.setProps({ modelValue: true });
      expect(w.attributes('aria-pressed')).toBe('true');
    });

    it('ignores a press while disabled', async () => {
      const w = mountToggle({ disabled: true });
      expect(w.attributes('disabled')).toBeDefined();

      await press(w.element as HTMLElement);
      expect(w.attributes('aria-pressed')).toBe('false');
      expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('holds the guard even when rendered as something with no disabled attribute', async () => {
      const w = mountToggle({ disabled: true, as: 'span' });
      expect(w.element.tagName).toBe('SPAN');

      await press(w.element as HTMLElement);
      expect(w.attributes('aria-pressed')).toBe('false');
    });

    it('leaves the tab order to the button', () => {
      // A lone toggle is already reachable; pinning tabindex would only fight
      // whatever the page has around it.
      const w = mountToggle();
      expect(w.attributes('tabindex')).toBeUndefined();
    });
  });

  describe('in a group', () => {
    it('wraps the toggles in a group with its orientation published', async () => {
      mountGroup();
      await nextTick();
      expect(group().getAttribute('role')).toBe('group');
      expect(group().getAttribute('data-orientation')).toBe('horizontal');
    });

    it('presses one at a time, holding a single value', async () => {
      const w = mountGroup();
      await nextTick();

      await press(toggle('center'));
      expect(pressed()).toEqual(['center']);
      expect(groupWrapper(w).emitted('update:modelValue')).toEqual([['center']]);

      // The one that was down comes up: that is the whole point of single.
      await press(toggle('right'));
      expect(pressed()).toEqual(['right']);
    });

    it('lets go of the pressed one when it is pressed again', async () => {
      const w = mountGroup({ groupProps: { defaultValue: 'center' } });
      await nextTick();
      expect(pressed()).toEqual(['center']);

      await press(toggle('center'));
      expect(pressed()).toEqual([]);
      expect(groupWrapper(w).emitted('update:modelValue')).toEqual([[null]]);
    });

    it('holds an array while multiple, in press order', async () => {
      const w = mountGroup({ groupProps: { multiple: true } });
      await nextTick();

      await press(toggle('left'));
      await press(toggle('right'));
      expect(pressed()).toEqual(['left', 'right']);

      const emitted = groupWrapper(w).emitted('update:modelValue');
      expect(emitted?.at(-1)).toEqual([['left', 'right']]);

      await press(toggle('left'));
      expect(pressed()).toEqual(['right']);
    });

    it('starts from defaultValue in either shape', async () => {
      mountGroup({ groupProps: { defaultValue: 'right' } });
      await nextTick();
      expect(pressed()).toEqual(['right']);

      document.body.innerHTML = '';
      mountGroup({ groupProps: { multiple: true, defaultValue: ['left', 'right'] } });
      await nextTick();
      expect(pressed()).toEqual(['left', 'right']);
    });

    it('follows a controlled value moved from outside', async () => {
      const value = ref<string | null>('left');
      const Host = defineComponent({
        setup() {
          return () =>
            h(ToggleGroup as any, { modelValue: value.value }, {
              default: () =>
                ['left', 'center'].map((entry) =>
                  h(Toggle as any, { value: entry, class: `toggle-${entry}` }, { default: () => entry }),
                ),
            });
        },
      });
      mount(Host, { attachTo: document.body });
      await nextTick();
      expect(pressed()).toEqual(['left']);

      value.value = 'center';
      await nextTick();
      expect(pressed()).toEqual(['center']);
    });

    it('disables every toggle in it', async () => {
      mountGroup({ groupProps: { disabled: true } });
      await nextTick();

      expect(toggle('left').hasAttribute('disabled')).toBe(true);
      await press(toggle('left'));
      expect(pressed()).toEqual([]);
    });

    it('refuses a programmatic press while the group is disabled', async () => {
      // `setPressed` is public API on the group, so the guard has to sit there
      // too — the one on each toggle only covers what a user can reach.
      const w = mountGroup({ groupProps: { disabled: true } });
      await nextTick();

      groupWrapper(w).vm.setPressed('left', true);
      await nextTick();
      expect(pressed()).toEqual([]);
    });

    it('takes the group value over a toggle’s own pressed prop', async () => {
      // The group owns the state here; a stray `v-model` on a child would
      // otherwise disagree with its siblings.
      const Host = defineComponent({
        setup() {
          return () =>
            h(ToggleGroup as any, { defaultValue: 'left' }, {
              default: () =>
                ['left', 'center'].map((entry) =>
                  h(Toggle as any, {
                    value: entry,
                    modelValue: true,
                    class: `toggle-${entry}`,
                  }, { default: () => entry }),
                ),
            });
        },
      });
      mount(Host, { attachTo: document.body });
      await nextTick();

      expect(pressed()).toEqual(['left']);
    });

    it('warns when a toggle in a group has no value', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const Host = defineComponent({
        setup() {
          return () => h(ToggleGroup as any, null, { default: () => h(Toggle as any) });
        },
      });
      mount(Host, { attachTo: document.body });
      await nextTick();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs a `value`'));
      warn.mockRestore();
    });
  });

  describe('required', () => {
    it('refuses to let the last pressed toggle come up', async () => {
      const w = mountGroup({ groupProps: { required: true, defaultValue: 'center' } });
      await nextTick();

      await press(toggle('center'));
      expect(pressed()).toEqual(['center']);
      // Nothing changed, so nothing is announced either.
      expect(groupWrapper(w).emitted('update:modelValue')).toBeUndefined();
    });

    it('still lets another one take over', async () => {
      mountGroup({ groupProps: { required: true, defaultValue: 'center' } });
      await nextTick();

      await press(toggle('right'));
      expect(pressed()).toEqual(['right']);
    });

    it('holds the last one in a multiple group too', async () => {
      mountGroup({ groupProps: { required: true, multiple: true, defaultValue: ['left', 'right'] } });
      await nextTick();

      // Down to one is fine; below one is not.
      await press(toggle('left'));
      expect(pressed()).toEqual(['right']);

      await press(toggle('right'));
      expect(pressed()).toEqual(['right']);
    });

    it('presses the first enabled toggle rather than starting empty', async () => {
      mountGroup({ groupProps: { required: true }, disabled: ['left'] });
      await nextTick();

      expect(pressed()).toEqual(['center']);
    });

    it('seeds an array when the value is an array', async () => {
      const w = mountGroup({ groupProps: { required: true, multiple: true } });
      await nextTick();

      expect(pressed()).toEqual(['left']);
      expect(groupWrapper(w).emitted('update:modelValue')).toEqual([[['left']]]);
    });

    it('leaves a controlled empty value alone', async () => {
      // The owner holds the value; pressing one for them would be the group
      // overruling its own controlled prop.
      const Host = defineComponent({
        setup() {
          return () =>
            h(ToggleGroup as any, { modelValue: null, required: true }, {
              default: () =>
                ['left', 'center'].map((entry) =>
                  h(Toggle as any, { value: entry, class: `toggle-${entry}` }, { default: () => entry }),
                ),
            });
        },
      });
      const w = mount(Host, { attachTo: document.body });
      await nextTick();

      expect(pressed()).toEqual([]);
      // A controlled write shows up as an emission even though nothing moved,
      // so an owner ignoring it would see a change it never made.
      expect(groupWrapper(w).emitted('update:modelValue')).toBeUndefined();
    });

    it('says so when it cannot press one, because the value is controlled', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const Host = defineComponent({
        setup() {
          return () =>
            h(ToggleGroup as any, { modelValue: null, required: true }, {
              default: () =>
                ['left', 'center'].map((entry) =>
                  h(Toggle as any, { value: entry, class: `toggle-${entry}` }, { default: () => entry }),
                ),
            });
        },
      });
      mount(Host, { attachTo: document.body });
      await nextTick();

      // Once, not once per toggle.
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('controlled and empty'));
      warn.mockRestore();
    });

    it('stays quiet when the controlled value is not empty', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const Host = defineComponent({
        setup() {
          return () =>
            h(ToggleGroup as any, { modelValue: 'left', required: true }, {
              default: () =>
                ['left', 'center'].map((entry) =>
                  h(Toggle as any, { value: entry, class: `toggle-${entry}` }, { default: () => entry }),
                ),
            });
        },
      });
      mount(Host, { attachTo: document.body });
      await nextTick();

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('does not press anything when it is not required', async () => {
      mountGroup();
      await nextTick();
      expect(pressed()).toEqual([]);
    });

    it('refuses a programmatic unpress of the last one', async () => {
      const w = mountGroup({ groupProps: { required: true, defaultValue: 'center' } });
      await nextTick();

      groupWrapper(w).vm.setPressed('center', false);
      await nextTick();
      expect(pressed()).toEqual(['center']);
    });

    it('publishes the constraint as a hook', async () => {
      mountGroup({ groupProps: { required: true } });
      await nextTick();
      expect(group().hasAttribute('data-required')).toBe(true);
    });
  });

  describe('keyboard', () => {
    it('keeps one tab stop for the whole group', async () => {
      mountGroup();
      await nextTick();

      expect(toggle('left').getAttribute('tabindex')).toBe('0');
      expect(toggle('center').getAttribute('tabindex')).toBe('-1');
    });

    it('puts the tab stop on the pressed toggle', async () => {
      mountGroup({ groupProps: { defaultValue: 'right' } });
      await nextTick();

      expect(toggle('right').getAttribute('tabindex')).toBe('0');
      expect(toggle('left').getAttribute('tabindex')).toBe('-1');
    });

    it('moves focus with the arrow keys and takes the tab stop along', async () => {
      mountGroup();
      await nextTick();
      toggle('left').focus();

      key('ArrowRight');
      await nextTick();
      expect(document.activeElement).toBe(toggle('center'));
      expect(toggle('center').getAttribute('tabindex')).toBe('0');
      // Moving through them presses nothing: a toggle is pressed, not selected.
      expect(pressed()).toEqual([]);
    });

    it('uses the axis it was given', async () => {
      mountGroup({ groupProps: { orientation: 'vertical' } });
      await nextTick();
      toggle('left').focus();

      key('ArrowRight');
      await nextTick();
      expect(document.activeElement).toBe(toggle('left'));

      key('ArrowDown');
      await nextTick();
      expect(document.activeElement).toBe(toggle('center'));
    });

    it('wraps at the ends unless told not to', async () => {
      mountGroup();
      await nextTick();
      toggle('right').focus();
      key('ArrowRight');
      await nextTick();
      expect(document.activeElement).toBe(toggle('left'));

      document.body.innerHTML = '';
      mountGroup({ groupProps: { loop: false } });
      await nextTick();
      toggle('right').focus();
      key('ArrowRight');
      await nextTick();
      expect(document.activeElement).toBe(toggle('right'));
    });

    it('steps over a disabled toggle and never gives it the tab stop', async () => {
      mountGroup({ disabled: ['left'] });
      await nextTick();

      expect(toggle('left').getAttribute('tabindex')).toBe('-1');
      expect(toggle('center').getAttribute('tabindex')).toBe('0');

      toggle('center').focus();
      key('ArrowLeft');
      await nextTick();
      expect(document.activeElement).toBe(toggle('right'));
    });
  });

  describe('composition', () => {
    it('runs the caller’s click handler first and can be vetoed', async () => {
      let clicks = 0;
      const w = mount(Toggle as any, {
        attrs: {
          onClick: (event: any) => {
            clicks += 1;
            event.preventInternalHandler();
          },
        },
        attachTo: document.body,
      });

      await press(w.element as HTMLElement);
      expect(clicks).toBe(1);
      expect(w.attributes('aria-pressed')).toBe('false');
    });
  });
});
