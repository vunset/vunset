import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import {
  MenuRoot,
  MenuTrigger,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuGroupLabel,
  MenuArrow,
  MenuItemIndicator,
  Portal,
  Positioner,
  Popup,
  Separator,
} from '../src';

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

afterEach(() => {
  vi.useRealTimers();
});

const trigger = () => document.querySelector('[aria-haspopup="menu"]') as HTMLElement;
const menu = () => document.querySelector('[role="menu"]');
const items = (role = 'menuitem') =>
  Array.from(document.querySelectorAll(`[role="${role}"]`)) as HTMLElement[];

const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const hover = (el: Element, type: 'pointerenter' | 'pointerleave') =>
  el.dispatchEvent(new PointerEvent(type, { bubbles: false }));

/** A standalone menu — no menubar above it. */
function mountMenu(rootProps: Record<string, any> = {}, body?: () => any) {
  return mount(
    defineComponent({
      render() {
        return h(MenuRoot as any, rootProps, {
          default: () => [
            h(MenuTrigger as any, null, { default: () => 'Open' }),
            h(Portal as any, null, {
              default: () => [
                h(Positioner as any, null, {
                  default: () => [
                    h(Popup as any, null, {
                      default: () =>
                        body?.() ?? [
                          h(MenuItem as any, null, { default: () => 'One' }),
                          h(MenuItem as any, null, { default: () => 'Two' }),
                        ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      },
    }),
    { attachTo: document.body },
  );
}

describe('Menu', () => {
  describe('standalone', () => {
    it('opens and closes on the trigger', async () => {
      mountMenu();
      await settle();
      expect(menu()).toBeNull();

      click(trigger());
      await settle();
      expect(menu()).not.toBeNull();

      click(trigger());
      await settle();
      expect(menu()).toBeNull();
    });

    it('closes after an item is chosen', async () => {
      const onSelect = vi.fn();
      mountMenu({}, () => [
        h(MenuItem as any, { onSelect }, { default: () => 'One' }),
      ]);
      await settle();

      click(trigger());
      await settle();
      click(items()[0]);
      await settle();

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(menu()).toBeNull();
    });

    it('keeps the menu open for an item that says not to close', async () => {
      mountMenu({}, () => [
        h(MenuItem as any, { closeOnClick: false }, { default: () => 'Stay' }),
      ]);
      await settle();

      click(trigger());
      await settle();
      click(items()[0]);
      await settle();

      expect(menu()).not.toBeNull();
    });

    it('keeps it open when the menu itself refuses to close on select', async () => {
      mountMenu({ closeOnSelect: false });
      await settle();

      click(trigger());
      await settle();
      click(items()[0]);
      await settle();

      expect(menu()).not.toBeNull();
    });
  });

  describe('openOnHover', () => {
    it('opens after the delay and not before', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountMenu({ openOnHover: true, delay: 200 });
      await settle();

      hover(trigger(), 'pointerenter');
      vi.advanceTimersByTime(150);
      await settle();
      expect(menu()).toBeNull();

      vi.advanceTimersByTime(100);
      await settle();
      expect(menu()).not.toBeNull();
    });

    it('does not open on hover unless asked', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountMenu();
      await settle();

      hover(trigger(), 'pointerenter');
      vi.advanceTimersByTime(1000);
      await settle();

      expect(menu()).toBeNull();
    });

    it('abandons the open when the pointer leaves first', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountMenu({ openOnHover: true, delay: 200 });
      await settle();

      hover(trigger(), 'pointerenter');
      vi.advanceTimersByTime(100);
      hover(trigger(), 'pointerleave');
      vi.advanceTimersByTime(1000);
      await settle();

      expect(menu()).toBeNull();
    });

    it('survives the gap between the trigger and the popup', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountMenu({ openOnHover: true, delay: 0, closeDelay: 200 });
      await settle();

      hover(trigger(), 'pointerenter');
      await settle();
      expect(menu()).not.toBeNull();

      // Off the trigger, heading for the popup.
      hover(trigger(), 'pointerleave');
      vi.advanceTimersByTime(100);
      // Arrived, which has to call off the pending close.
      hover(menu()!, 'pointerenter');
      vi.advanceTimersByTime(1000);
      await settle();

      expect(menu()).not.toBeNull();
    });

    it('closes once the pointer leaves the popup too', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountMenu({ openOnHover: true, delay: 0, closeDelay: 200 });
      await settle();

      hover(trigger(), 'pointerenter');
      await settle();
      hover(menu()!, 'pointerenter');
      hover(menu()!, 'pointerleave');
      vi.advanceTimersByTime(250);
      await settle();

      expect(menu()).toBeNull();
    });
  });

  describe('a click on a hover-opened menu', () => {
    /**
     * Hovering opens it, so by the time the user clicks — the one thing they
     * are most likely to do next — it is already open. Toggling there would
     * shut the menu the instant they reached for it.
     */
    it('keeps it open rather than toggling it shut', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountMenu({ openOnHover: true, delay: 0 });
      await settle();

      hover(trigger(), 'pointerenter');
      await settle();
      expect(menu()).not.toBeNull();

      click(trigger());
      await settle();
      expect(menu()).not.toBeNull();
      vi.useRealTimers();
    });

    it('closes on the click after that', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountMenu({ openOnHover: true, delay: 0 });
      await settle();

      hover(trigger(), 'pointerenter');
      await settle();
      click(trigger());
      await settle();

      // Pinned now, so it behaves like any click-opened menu.
      click(trigger());
      await settle();
      expect(menu()).toBeNull();
      vi.useRealTimers();
    });

    it('stops following the pointer out once pinned', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountMenu({ openOnHover: true, delay: 0, closeDelay: 100 });
      await settle();

      hover(trigger(), 'pointerenter');
      await settle();
      click(trigger());
      await settle();

      hover(trigger(), 'pointerleave');
      vi.advanceTimersByTime(1000);
      await settle();

      expect(menu()).not.toBeNull();
      vi.useRealTimers();
    });

    it('follows the pointer out again after it has closed and reopened', async () => {
      // The pin belongs to one opening, not to the menu.
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountMenu({ openOnHover: true, delay: 0, closeDelay: 100 });
      await settle();

      hover(trigger(), 'pointerenter');
      await settle();
      click(trigger());
      await settle();
      click(trigger());
      await settle();
      expect(menu()).toBeNull();

      hover(trigger(), 'pointerenter');
      await settle();
      hover(trigger(), 'pointerleave');
      vi.advanceTimersByTime(200);
      await settle();

      expect(menu()).toBeNull();
      vi.useRealTimers();
    });

    it('still toggles when the menu does not open on hover', async () => {
      mountMenu();
      await settle();

      click(trigger());
      await settle();
      expect(menu()).not.toBeNull();

      click(trigger());
      await settle();
      expect(menu()).toBeNull();
    });
  });

  describe('checkbox items', () => {
    it('reports itself as a checkbox row', async () => {
      mountMenu({}, () => [
        h(MenuCheckboxItem as any, null, { default: () => 'Wrap' }),
      ]);
      await settle();
      click(trigger());
      await settle();

      const [item] = items('menuitemcheckbox');
      expect(item.getAttribute('aria-checked')).toBe('false');
      expect(item.hasAttribute('data-unchecked')).toBe(true);
    });

    it('toggles and stays open', async () => {
      mountMenu({}, () => [
        h(MenuCheckboxItem as any, null, { default: () => 'Wrap' }),
      ]);
      await settle();
      click(trigger());
      await settle();

      click(items('menuitemcheckbox')[0]);
      await settle();

      // Open on purpose: setting two of these in a row should not need the
      // menu reopening between them.
      expect(menu()).not.toBeNull();
      expect(items('menuitemcheckbox')[0].getAttribute('aria-checked')).toBe('true');
      expect(items('menuitemcheckbox')[0].hasAttribute('data-checked')).toBe(true);
    });

    it('closes when told to', async () => {
      mountMenu({}, () => [
        h(MenuCheckboxItem as any, { closeOnClick: true }, { default: () => 'Wrap' }),
      ]);
      await settle();
      click(trigger());
      await settle();

      click(items('menuitemcheckbox')[0]);
      await settle();
      expect(menu()).toBeNull();
    });

    it('follows a controlled model prop', async () => {
      const Host = defineComponent({
        setup: () => ({ on: ref(false) }),
        render() {
          return h(MenuRoot as any, { defaultOpen: true }, {
            default: () => [
              h(MenuTrigger as any, null, { default: () => 'Open' }),
              h(Portal as any, null, {
                default: () =>
                  h(Positioner as any, null, {
                    default: () =>
                      h(Popup as any, null, {
                        default: () =>
                          h(MenuCheckboxItem as any, { modelValue: this.on }, { default: () => 'Wrap' }),
                      }),
                  }),
              }),
            ],
          });
        },
      });

      const w = mount(Host, { attachTo: document.body });
      await settle();
      expect(items('menuitemcheckbox')[0].getAttribute('aria-checked')).toBe('false');

      // Clicking must not move it on its own.
      click(items('menuitemcheckbox')[0]);
      await settle();
      expect(items('menuitemcheckbox')[0].getAttribute('aria-checked')).toBe('false');

      w.vm.on = true;
      await settle();
      expect(items('menuitemcheckbox')[0].getAttribute('aria-checked')).toBe('true');
    });

    it('round-trips through v-model', async () => {
      // `v-model` compiles to `:model-value` plus `@update:model-value`, so a
      // mismatched emit name breaks the binding while every other test passes.
      const onUpdate = vi.fn();
      mountMenu({}, () => [
        h(MenuCheckboxItem as any, { 'onUpdate:modelValue': onUpdate }, { default: () => 'Wrap' }),
      ]);
      await settle();
      click(trigger());
      await settle();

      click(items('menuitemcheckbox')[0]);
      expect(onUpdate).toHaveBeenCalledWith(true);
    });

    it('emits the new state', async () => {
      const onChange = vi.fn();
      mountMenu({}, () => [
        h(MenuCheckboxItem as any, { onChange }, { default: () => 'Wrap' }),
      ]);
      await settle();
      click(trigger());
      await settle();

      click(items('menuitemcheckbox')[0]);
      expect(onChange.mock.calls[0][0]).toBe(true);
    });
  });

  describe('radio group', () => {
    function radioBody(groupProps: Record<string, any> = {}) {
      return () => [
        h(MenuRadioGroup as any, groupProps, {
          default: () => [
            h(MenuGroupLabel as any, null, { default: () => 'Sort by' }),
            h(MenuRadioItem as any, { value: 'name' }, { default: () => 'Name' }),
            h(MenuRadioItem as any, { value: 'date' }, { default: () => 'Date' }),
          ],
        }),
      ];
    }

    it('marks only the chosen item', async () => {
      mountMenu({}, radioBody({ defaultValue: 'name' }));
      await settle();
      click(trigger());
      await settle();

      const [name, date] = items('menuitemradio');
      expect(name.getAttribute('aria-checked')).toBe('true');
      expect(date.getAttribute('aria-checked')).toBe('false');
    });

    it('moves the choice and stays open', async () => {
      mountMenu({}, radioBody({ defaultValue: 'name' }));
      await settle();
      click(trigger());
      await settle();

      click(items('menuitemradio')[1]);
      await settle();

      expect(menu()).not.toBeNull();
      expect(items('menuitemradio')[0].getAttribute('aria-checked')).toBe('false');
      expect(items('menuitemradio')[1].getAttribute('aria-checked')).toBe('true');
    });

    it('names the group with its label', async () => {
      mountMenu({}, radioBody());
      await settle();
      click(trigger());
      await settle();

      const group = document.querySelector('[data-part="radio-group"]')!;
      const label = document.querySelector('[data-part="group-label"]')!;
      expect(group.getAttribute('aria-labelledby')).toBe(label.id);
      expect(label.id).toBeTruthy();
    });

    it('disables every item when the group is disabled', async () => {
      mountMenu({}, radioBody({ defaultValue: 'name', disabled: true }));
      await settle();
      click(trigger());
      await settle();

      click(items('menuitemradio')[1]);
      await settle();

      expect(items('menuitemradio')[1].getAttribute('aria-checked')).toBe('false');
      expect(items('menuitemradio')[1].hasAttribute('data-disabled')).toBe(true);
    });

    it('round-trips through v-model', async () => {
      const onUpdate = vi.fn();
      mountMenu({}, radioBody({ defaultValue: 'name', 'onUpdate:modelValue': onUpdate }));
      await settle();
      click(trigger());
      await settle();

      click(items('menuitemradio')[1]);
      expect(onUpdate).toHaveBeenCalledWith('date');
    });

    it('emits the chosen value', async () => {
      const onChange = vi.fn();
      mountMenu({}, radioBody({ defaultValue: 'name', onChange }));
      await settle();
      click(trigger());
      await settle();

      click(items('menuitemradio')[1]);
      expect(onChange.mock.calls[0][0]).toBe('date');
    });
  });

  describe('item indicator', () => {
    const indicators = () => Array.from(document.querySelectorAll<HTMLElement>('[data-part="item-indicator"]'));

    it('shows only while its checkbox item is checked', async () => {
      mountMenu({}, () => [
        h(MenuCheckboxItem as any, null, { default: () => [h(MenuItemIndicator as any, null, () => '✓'), 'Wrap'] }),
      ]);
      await settle();
      click(trigger());
      await settle();
      expect(indicators()).toHaveLength(0);

      click(items('menuitemcheckbox')[0]);
      await settle();
      expect(indicators()).toHaveLength(1);
      expect(indicators()[0].getAttribute('aria-hidden')).toBe('true');
    });

    it('follows the radio choice, kept mounted', async () => {
      const radio = (value: string) =>
        h(MenuRadioItem as any, { value }, { default: () => [h(MenuItemIndicator as any, { keepMounted: true }), value] });
      mountMenu({}, () => [h(MenuRadioGroup as any, { defaultValue: 'name' }, () => [radio('name'), radio('date')])]);
      await settle();
      click(trigger());
      await settle();

      const [name, date] = indicators();
      expect(name.hasAttribute('data-checked')).toBe(true);
      expect(date.hasAttribute('data-unchecked')).toBe(true);

      click(items('menuitemradio')[1]);
      await settle();
      expect(indicators()[1].hasAttribute('data-checked')).toBe(true);
      expect(indicators()[0].hasAttribute('data-unchecked')).toBe(true);
    });
  });

  describe('keyboard', () => {
    it('reaches checkbox and radio rows too, not only plain items', async () => {
      // The roving focus selects on role, so a selector naming only
      // `menuitem` would step straight past both.
      mountMenu({}, () => [
        h(MenuItem as any, null, { default: () => 'Plain' }),
        h(MenuCheckboxItem as any, null, { default: () => 'Toggle' }),
        h(MenuRadioGroup as any, { defaultValue: 'a' }, {
          default: () => [h(MenuRadioItem as any, { value: 'a' }, { default: () => 'Radio' })],
        }),
      ]);
      await settle();

      trigger().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
      );
      await settle();
      expect(document.activeElement?.textContent).toBe('Plain');

      const press = (key: string) =>
        document.activeElement!.dispatchEvent(
          new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
        );

      press('ArrowDown');
      await settle();
      expect(document.activeElement?.getAttribute('role')).toBe('menuitemcheckbox');

      press('ArrowDown');
      await settle();
      expect(document.activeElement?.getAttribute('role')).toBe('menuitemradio');
    });

    it('stops at the ends when looping is off', async () => {
      mountMenu({ loop: false });
      await settle();

      trigger().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
      );
      await settle();
      expect(document.activeElement?.textContent).toBe('One');

      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }),
      );
      await settle();
      // Looping would have wrapped round to the last item.
      expect(document.activeElement?.textContent).toBe('One');
    });
  });

  describe('arrow', () => {
    const positioner = () => menu()!.parentElement as HTMLElement;

    /**
     * The arrow mounts inside the popup, so it can miss the placement the
     * popup itself triggered. The popup waits for it before revealing itself,
     * which is only safe if the wait actually ends.
     */
    it('reveals the popup once the arrow has been placed', async () => {
      mountMenu({ defaultOpen: true }, () => [
        h(MenuItem as any, null, { default: () => 'One' }),
        h(MenuArrow as any, { class: 'arrow' }),
      ]);
      await settle();

      const arrow = document.querySelector('.arrow') as HTMLElement;
      expect(arrow.style.left).not.toBe('');
      expect(positioner().style.visibility).not.toBe('hidden');
    });

    it('does not wait for an arrow that was never rendered', async () => {
      // Waiting unconditionally would leave every arrowless popup — which is
      // most of them — hidden for good.
      mountMenu({ defaultOpen: true });
      await settle();

      expect(positioner().style.visibility).not.toBe('hidden');
    });

    /**
     * Note: that the arrow is placed by the *first* positioning pass rather
     * than a frame later is not asserted here. Both orderings settle within a
     * single frame under jsdom, so a test could not tell them apart — see the
     * comment on the arrow middleware in `usePositioning`.
     */
    it('is given an offset along the popup edge', async () => {
      mountMenu({ defaultOpen: true }, () => [
        h(MenuItem as any, null, { default: () => 'One' }),
        h(MenuArrow as any, { class: 'arrow' }),
      ]);
      await settle();

      const arrow = document.querySelector('.arrow') as HTMLElement;
      expect(arrow).not.toBeNull();
      // A menu on the bottom is offset along x; the middleware has to have run.
      expect(arrow.style.left).not.toBe('');
    });

    it('sits on the edge facing the trigger', async () => {
      mountMenu({ defaultOpen: true }, () => [
        h(MenuItem as any, null, { default: () => 'One' }),
        h(MenuArrow as any, { class: 'arrow' }),
      ]);
      await settle();

      const arrow = document.querySelector('.arrow') as HTMLElement;
      // A menu below its trigger points up, from its own top edge.
      expect(arrow.getAttribute('data-side')).toBe('bottom');
      expect(arrow.style.bottom).toBe('100%');
    });
  });

  describe('grouping', () => {
    it('names a plain group with its label', async () => {
      mountMenu({}, () => [
        h(MenuGroup as any, null, {
          default: () => [
            h(MenuGroupLabel as any, null, { default: () => 'Recent' }),
            h(MenuItem as any, null, { default: () => 'One' }),
          ],
        }),
      ]);
      await settle();
      click(trigger());
      await settle();

      const group = document.querySelector('[data-part="group"]')!;
      expect(group.getAttribute('aria-labelledby')).toBe(
        document.querySelector('[data-part="group-label"]')!.id,
      );
    });

    it('leaves the label out of the arrow-key order', async () => {
      mountMenu({}, () => [
        h(MenuGroup as any, null, {
          default: () => [
            h(MenuGroupLabel as any, null, { default: () => 'Recent' }),
            h(MenuItem as any, null, { default: () => 'One' }),
          ],
        }),
      ]);
      await settle();

      trigger().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
      );
      await settle();

      expect(document.activeElement?.textContent).toBe('One');
    });

    it('renders a separator that is not an item', async () => {
      mountMenu({}, () => [
        h(MenuItem as any, null, { default: () => 'One' }),
        h(Separator as any),
        h(MenuItem as any, null, { default: () => 'Two' }),
      ]);
      await settle();
      click(trigger());
      await settle();

      const rule = document.querySelector('[data-part="separator"]')!;
      expect(rule.getAttribute('role')).toBe('separator');
      expect(rule.getAttribute('aria-orientation')).toBe('horizontal');
      expect(items()).toHaveLength(2);
    });
  });
});
