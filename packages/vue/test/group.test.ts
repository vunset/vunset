import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { Group, Separator, ToggleGroup, Toggle } from '../src';

function mountGroup(props: Record<string, any> = {}, children: any[] = []) {
  const Host = defineComponent({
    setup() {
      return () =>
        h(Group as any, props, {
          default: () =>
            children.length > 0 ? children : [h('button', { class: 'first' }, 'One')],
        });
    },
  });
  return mount(Host, { attachTo: document.body });
}

const root = () => document.querySelector<HTMLElement>('[data-variant]')!;
const separator = () => document.querySelector<HTMLElement>('[data-part="separator"]')!;

describe('Group', () => {
  describe('semantics', () => {
    it('says the controls belong together', () => {
      mountGroup();
      expect(root().getAttribute('role')).toBe('group');
      expect(root().getAttribute('data-variant')).toBe('group');
      expect(root().getAttribute('data-orientation')).toBe('horizontal');
    });

    it('becomes a toolbar when asked, and takes an orientation with it', () => {
      mountGroup({ variant: 'toolbar', orientation: 'vertical' });
      expect(root().getAttribute('role')).toBe('toolbar');
      expect(root().getAttribute('aria-orientation')).toBe('vertical');
      expect(root().getAttribute('data-orientation')).toBe('vertical');
    });

    it('claims no orientation as a plain group', () => {
      // ARIA gives `group` no orientation, so asserting one would be a lie to
      // the accessibility tree rather than a hint to it.
      mountGroup({ orientation: 'vertical' });
      expect(root().getAttribute('aria-orientation')).toBeNull();
      expect(root().getAttribute('data-orientation')).toBe('vertical');
    });

    it('carries a label for the set', () => {
      mountGroup({ variant: 'toolbar', label: 'Formatting' });
      expect(root().getAttribute('aria-label')).toBe('Formatting');
    });

    it('renders a different tag when asked', () => {
      mountGroup({ as: 'section' });
      expect(root().tagName).toBe('SECTION');
    });
  });

  describe('separators inside it', () => {
    it('runs a rule across the row rather than along it', () => {
      // A divider divides: in a row of controls that means a vertical rule,
      // which is the opposite of what a separator defaults to on its own.
      mountGroup({}, [h(Separator as any)]);
      expect(separator().getAttribute('data-orientation')).toBe('vertical');
      expect(separator().getAttribute('aria-orientation')).toBe('vertical');
    });

    it('runs along a vertical group', () => {
      mountGroup({ orientation: 'vertical' }, [h(Separator as any)]);
      expect(separator().getAttribute('data-orientation')).toBe('horizontal');
    });

    it('still lets the caller say', () => {
      mountGroup({}, [h(Separator as any, { orientation: 'horizontal' })]);
      expect(separator().getAttribute('data-orientation')).toBe('horizontal');
    });

    it('is horizontal outside any group, as before', () => {
      mount(Separator as any, { attachTo: document.body });
      expect(separator().getAttribute('data-orientation')).toBe('horizontal');
    });
  });

  describe('the controls inside it', () => {
    it('does not touch them at all', () => {
      mountGroup({}, [h('button', { class: 'first', type: 'button' }, 'One')]);
      const button = document.querySelector('.first')!;
      expect(button.getAttributeNames().sort()).toEqual(['class', 'type']);
    });
  });

  describe('composition', () => {
    it('lets a class and a role of the caller’s own through', () => {
      mountGroup({ class: 'Group', role: 'radiogroup' });
      expect(root().classList.contains('Group')).toBe(true);
      // The caller wins conflicts, as everywhere else.
      expect(root().getAttribute('role')).toBe('radiogroup');
    });
  });

  describe('as a toolbar, from the keyboard', () => {
    const buttons = (...names: string[]) => names.map((name) => h('button', { class: name }, name));
    const el = (name: string) => document.querySelector<HTMLElement>(`.${name}`)!;
    const tabIndexes = (...names: string[]) => names.map((name) => el(name).getAttribute('tabindex'));
    const press = (target: HTMLElement, key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      return event;
    };

    it('is one tab stop, on its first control', () => {
      mountGroup({ variant: 'toolbar' }, buttons('a', 'b', 'c'));
      expect(tabIndexes('a', 'b', 'c')).toEqual(['0', '-1', '-1']);
    });

    it('moves focus with the arrows across it, wrapping', () => {
      mountGroup({ variant: 'toolbar' }, buttons('a', 'b', 'c'));
      el('a').focus();
      press(el('a'), 'ArrowRight');
      expect(document.activeElement).toBe(el('b'));
      press(el('b'), 'ArrowRight');
      press(el('c'), 'ArrowRight');
      expect(document.activeElement).toBe(el('a'));
      press(el('a'), 'ArrowLeft');
      expect(document.activeElement).toBe(el('c'));
    });

    it('jumps to the ends with Home and End', () => {
      mountGroup({ variant: 'toolbar' }, buttons('a', 'b', 'c'));
      el('b').focus();
      press(el('b'), 'End');
      expect(document.activeElement).toBe(el('c'));
      press(el('c'), 'Home');
      expect(document.activeElement).toBe(el('a'));
    });

    it('uses Up and Down when vertical, and leaves Left and Right alone', () => {
      mountGroup({ variant: 'toolbar', orientation: 'vertical' }, buttons('a', 'b'));
      el('a').focus();
      expect(press(el('a'), 'ArrowRight').defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(el('a'));
      press(el('a'), 'ArrowDown');
      expect(document.activeElement).toBe(el('b'));
    });

    it('keeps the tab stop where focus last was', async () => {
      mountGroup({ variant: 'toolbar' }, buttons('a', 'b', 'c'));
      el('c').focus();
      await nextTick();
      expect(tabIndexes('a', 'b', 'c')).toEqual(['-1', '-1', '0']);
    });

    it('skips a disabled control', () => {
      mountGroup({ variant: 'toolbar' }, [h('button', { class: 'a' }, 'a'), h('button', { class: 'b', disabled: true }, 'b'), h('button', { class: 'c' }, 'c')]);
      el('a').focus();
      press(el('a'), 'ArrowRight');
      expect(document.activeElement).toBe(el('c'));
    });

    it('lets a text field keep the arrows, except past either end', () => {
      mountGroup({ variant: 'toolbar' }, [h('button', { class: 'a' }, 'a'), h('input', { class: 'field', value: 'abc' }), h('button', { class: 'c' }, 'c')]);
      const field = el('field') as HTMLInputElement;
      field.focus();
      field.setSelectionRange(1, 1);
      expect(press(field, 'ArrowRight').defaultPrevented).toBe(false);
      expect(press(field, 'Home').defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(field);

      field.setSelectionRange(3, 3);
      press(field, 'ArrowRight');
      expect(document.activeElement).toBe(el('c'));
    });

    it('leaves a key a control inside already handled', () => {
      mountGroup({ variant: 'toolbar' }, buttons('a', 'b'));
      el('a').addEventListener('keydown', (event) => event.preventDefault());
      el('a').focus();
      press(el('a'), 'ArrowRight');
      expect(document.activeElement).toBe(el('a'));
    });

    it('treats a toggle group inside as one control with arrows of its own', async () => {
      mountGroup({ variant: 'toolbar' }, [
        h('button', { class: 'a' }, 'a'),
        h(ToggleGroup as any, null, () => [
          h(Toggle as any, { value: 'x', class: 'x' }, () => 'x'),
          h(Toggle as any, { value: 'y', class: 'y' }, () => 'y'),
        ]),
        h('button', { class: 'c' }, 'c'),
      ]);
      await nextTick();
      // The group keeps its own roving tab stop; the toolbar sets nothing in it.
      expect(tabIndexes('x', 'y')).toEqual(['0', '-1']);

      el('a').focus();
      press(el('a'), 'ArrowRight');
      expect(document.activeElement).toBe(el('x'));
      await nextTick();
      // Focus in the set takes the toolbar's own stop away.
      expect(tabIndexes('a', 'c')).toEqual(['-1', '-1']);

      // Inside the set, its arrows move between its toggles, not out of it.
      press(el('x'), 'ArrowRight');
      expect(document.activeElement).toBe(el('y'));
    });

    it('carries on past either end of a toggle group inside, which does not wrap there', async () => {
      const toolbarWith = (loop?: boolean) =>
        mountGroup({ variant: 'toolbar' }, [
          h('button', { class: 'a' }, 'a'),
          h(ToggleGroup as any, { loop }, () => [
            h(Toggle as any, { value: 'x', class: 'x' }, () => 'x'),
            h(Toggle as any, { value: 'y', class: 'y' }, () => 'y'),
          ]),
          h('button', { class: 'c' }, 'c'),
        ]);

      // A toggle takes its group's tab stop once focused, a render later.
      const wrapper = toolbarWith();
      await nextTick();
      el('y').focus();
      await nextTick();
      press(el('y'), 'ArrowRight');
      expect(document.activeElement).toBe(el('c'));

      el('x').focus();
      await nextTick();
      press(el('x'), 'ArrowLeft');
      expect(document.activeElement).toBe(el('a'));
      wrapper.unmount();

      // Told to loop, it keeps its arrows and wraps.
      toolbarWith(true);
      await nextTick();
      el('y').focus();
      await nextTick();
      press(el('y'), 'ArrowRight');
      expect(document.activeElement).toBe(el('x'));
    });

    it('counts the buttons of a plain group inside as its own', () => {
      mountGroup({ variant: 'toolbar' }, [
        h('button', { class: 'a' }, 'a'),
        h(Group as any, null, () => buttons('b', 'c')),
      ]);
      el('a').focus();
      press(el('a'), 'ArrowRight');
      expect(document.activeElement).toBe(el('b'));
    });

    it('puts back every tabindex once it stops being a toolbar', async () => {
      const variant = ref<'toolbar' | 'group'>('toolbar');
      mount(
        defineComponent(() => () =>
          h(Group as any, { variant: variant.value }, () => [h('button', { class: 'a' }, 'a'), h('button', { class: 'b', tabindex: '2' }, 'b')]),
        ),
        { attachTo: document.body },
      );
      await nextTick();
      expect(tabIndexes('a', 'b')).toEqual(['0', '-1']);

      variant.value = 'group';
      await nextTick();
      await nextTick();
      expect(tabIndexes('a', 'b')).toEqual([null, '2']);
    });
  });
});
