import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import {
  DialogRoot,
  DialogTrigger,
  MenuRoot,
  MenuTrigger,
  MenuItem,
  Portal,
  Positioner,
  Popup,
} from '../src';

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

/**
 * `<Portal>`, `<Positioner>` and `<Popup>` are one component each rather than
 * one per surface. What makes that safe is `inject` resolving to the *nearest*
 * provider, so the same `<Popup>` tag means different things in different
 * places — and means the innermost one when they are nested.
 */
describe('shared surface parts', () => {
  it('renders whichever surface encloses it', async () => {
    mount(
      defineComponent({
        setup: () => () =>
          h(DialogRoot as any, { defaultOpen: true }, () => [
            h(Portal as any, null, () => [h(Popup as any, null, () => 'Dialog body')]),
          ]),
      }),
      { attachTo: document.body },
    );
    await settle();

    const popup = document.querySelector('[data-part="popup"], [role="dialog"]')!;
    expect(popup.getAttribute('role')).toBe('dialog');
  });

  it('resolves to the innermost surface when they are nested', async () => {
    mount(
      defineComponent({
        setup: () => () =>
          h(DialogRoot as any, { defaultOpen: true }, () => [
            h(Portal as any, null, () => [
              h(Popup as any, null, () => [
                // Same tag, one level down, and it has to mean the menu.
                h(MenuRoot as any, null, () => [
                  h(MenuTrigger as any, null, () => 'Open'),
                  h(Portal as any, null, () => [
                    h(Positioner as any, null, () => [
                      h(Popup as any, null, () => [h(MenuItem as any, null, () => 'One')]),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );
    await settle();

    click(document.querySelector('[data-part="trigger"], [aria-haspopup]')!);
    await settle();

    const roles = [...document.querySelectorAll('[role="dialog"], [role="menu"]')].map((el) =>
      el.getAttribute('role'),
    );
    expect(roles).toEqual(['dialog', 'menu']);
  });

  it('says so when asked to position a surface with no anchor', async () => {
    // A dialog is centered in the viewport and points at nothing, so it
    // publishes no positioner. A silent no-op box would leave the popup with no
    // positioned ancestor and no clue why.
    expect(() =>
      mount(
        defineComponent({
          setup: () => () =>
            h(DialogRoot as any, { defaultOpen: true }, () => [
              h(Portal as any, null, () => [h(Positioner as any, null, () => [h(Popup as any)])]),
            ]),
        }),
        { attachTo: document.body },
      ),
    ).toThrow(/not anchored to anything/);
  });

  it('says so when used with no surface at all', () => {
    expect(() =>
      mount(defineComponent({ setup: () => () => h(Popup as any) }), { attachTo: document.body }),
    ).toThrow(/Surface context is missing/);
  });

  it('keeps the popup mounted through an exit animation', async () => {
    // `present` is what the parts read, not `open`. The distinction is the
    // whole reason the surface publishes presence rather than openness.
    const Host = defineComponent({
      setup: () => () =>
        h(DialogRoot as any, null, () => [
          h(DialogTrigger as any, null, () => 'Open'),
          h(Portal as any, null, () => [h(Popup as any, null, () => 'Body')]),
        ]),
    });
    mount(Host, { attachTo: document.body });
    await settle();
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    click(document.querySelector('[aria-haspopup], button')!);
    await settle();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  });

  describe('Portal target', () => {
    const openDialog = () =>
      mount(
        defineComponent({
          setup: () => () =>
            h(DialogRoot as any, { defaultOpen: true }, () => [
              h(Portal as any, null, () => [h(Popup as any, null, () => 'Dialog body')]),
            ]),
        }),
        { attachTo: document.body },
      );

    it('goes to the end of body when the page has no #teleports', async () => {
      openDialog();
      await settle();
      expect(document.querySelector('[role="dialog"]')!.parentElement).toBe(document.body);
    });

    it('goes into #teleports when the page has one', async () => {
      const teleports = document.createElement('div');
      teleports.id = 'teleports';
      document.body.append(teleports);

      openDialog();
      await settle();
      expect(document.querySelector('[role="dialog"]')!.parentElement).toBe(teleports);
    });

    it('leaves nothing in the target while closed', async () => {
      const before = document.body.childNodes.length;
      // A table row's worth of closed surfaces.
      const w = mount(
        defineComponent({
          setup: () => () =>
            Array.from({ length: 5 }, () =>
              h(DialogRoot as any, null, () => [
                h(DialogTrigger as any, null, () => 'Open'),
                h(Portal as any, null, () => [h(Popup as any, null, () => 'Dialog body')]),
              ]),
            ),
        }),
        { attachTo: document.createElement('div') },
      );
      await settle();
      expect(document.body.childNodes.length).toBe(before);

      click(w.find('button').element);
      await settle();
      expect(document.querySelector('[role="dialog"]')!.parentElement).toBe(document.body);
    });
  });
});
