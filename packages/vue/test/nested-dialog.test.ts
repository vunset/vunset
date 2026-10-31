import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import {
  DialogRoot, DialogTrigger, Portal, DialogBackdrop, Popup, DialogTitle, DialogClose,
} from '../src';

/**
 * The confirm-on-cancel pattern: an outer dialog whose Cancel opens a second
 * dialog, rendered inside the first.
 */
function mountNested() {
  const Host = defineComponent({
    setup() {
      return () =>
        h(DialogRoot as any, { outsidePress: true }, {
          default: () => [
            h(DialogTrigger as any, { class: 'outer-trigger' }, { default: () => 'Edit' }),
            h(Portal as any, null, {
              default: () => [
                h(DialogBackdrop as any, { class: 'outer-backdrop' }),
                h(Popup as any, { class: 'outer' }, {
                  default: () => [
                    h(DialogTitle as any, null, { default: () => 'Edit' }),
                    h('button', { class: 'outer-field' }, 'Field'),
                    h(DialogRoot as any, { outsidePress: true }, {
                      default: () => [
                        h(DialogTrigger as any, { class: 'inner-trigger' }, { default: () => 'Cancel' }),
                        h(Portal as any, null, {
                          default: () => [
                            h(DialogBackdrop as any, { class: 'inner-backdrop' }),
                            h(Popup as any, { class: 'inner' }, {
                              default: () => [
                                h(DialogTitle as any, null, { default: () => 'Discard?' }),
                                h(DialogClose as any, { class: 'inner-close' }, { default: () => 'Keep' }),
                                h(DialogClose as any, { class: 'discard', closeAll: true }, {
                                  default: () => 'Discard',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
    },
  });
  return mount(Host, { attachTo: document.body });
}

const outer = () => document.querySelector<HTMLElement>('.outer');
const inner = () => document.querySelector<HTMLElement>('.inner');
const q = (sel: string) => document.querySelector<HTMLElement>(sel)!;

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const escape = () =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

async function openBoth() {
  mountNested();
  q('.outer-trigger').click();
  await settle();
  q('.inner-trigger').click();
  await settle();
}

describe('Nested dialogs', () => {
  it('opens the second inside the first, with both present', async () => {
    await openBoth();
    expect(outer()).not.toBeNull();
    expect(inner()).not.toBeNull();
  });

  it('Escape closes only the innermost', async () => {
    await openBoth();
    escape();
    await settle();
    expect(inner()).toBeNull();
    expect(outer()).not.toBeNull();

    escape();
    await settle();
    expect(outer()).toBeNull();
  });

  it('keeps the page locked until the outermost closes', async () => {
    await openBoth();
    expect(document.body.style.overflow).toBe('clip');

    escape();
    await settle();
    // The inner one closing must not release a lock the outer still holds.
    expect(document.body.style.overflow).toBe('clip');

    escape();
    await settle();
    expect(document.body.style.overflow).not.toBe('clip');
  });

  it('inerts the outer dialog while the inner is open, then restores it', async () => {
    await openBoth();
    // Teleported content lands as a direct child of <body>, so the popup itself
    // is what gets inerted — there is no wrapper element around it.
    expect(outer()!.hasAttribute('inert')).toBe(true);
    expect(inner()!.hasAttribute('inert')).toBe(false);

    escape();
    await settle();
    // Restored, or the outer dialog would be left unusable behind nothing.
    expect(outer()!.hasAttribute('inert')).toBe(false);
  });

  it('returns focus to the control that opened the inner dialog', async () => {
    mountNested();
    q('.outer-trigger').click();
    await settle();
    q('.inner-trigger').focus();
    q('.inner-trigger').click();
    await settle();
    expect(inner()!.contains(document.activeElement)).toBe(true);

    escape();
    await settle();
    expect(document.activeElement).toBe(q('.inner-trigger'));
  });

  it('closing the inner leaves the outer usable', async () => {
    await openBoth();
    escape();
    await settle();
    // The outer dialog must still dismiss on its own backdrop afterwards.
    q('.outer-backdrop').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle();
    expect(outer()).toBeNull();
  });
});

describe('Nested dialog stacking state', () => {
  it('marks the outer dialog while a nested one is open', async () => {
    await openBoth();
    // The signal a stylesheet needs to push the outer dialog back.
    expect(outer()!.hasAttribute('data-nested')).toBe(true);
    expect(inner()!.hasAttribute('data-nested')).toBe(false);
  });

  it('clears the mark once the nested dialog has gone', async () => {
    await openBoth();
    escape();
    await settle();
    expect(outer()!.hasAttribute('data-nested')).toBe(false);
  });

  it('counts how many dialogs are stacked on top of each one', async () => {
    await openBoth();
    // Not each dialog's own place in the markup, which never moves, but how
    // far back the stack has pushed it — which is what a stylesheet has to
    // scale against. The one in front is `0`, and 0 is left out as noise.
    expect(inner()!.hasAttribute('data-level')).toBe(false);
    expect(outer()!.getAttribute('data-level')).toBe('1');
  });

  it('publishes the level as a number a stylesheet can compute with', async () => {
    await openBoth();
    // `data-level` cannot be read by `calc()`; stepping a dialog back per
    // level is arithmetic, so the same value goes out as a custom property.
    expect(outer()!.getAttribute('style')).toContain('--dialog-level: 1');
    expect(inner()!.getAttribute('style')).toContain('--dialog-level: 0');
  });

  it('counts back up again as the stack unwinds', async () => {
    await openBoth();
    expect(outer()!.getAttribute('data-level')).toBe('1');

    escape();
    await settle();
    expect(outer()!.hasAttribute('data-level')).toBe(false);
  });

  it('keeps the outer dialog pushed back until the inner has finished leaving', async () => {
    await openBoth();
    escape();
    await nextTick();
    await nextTick();
    // The inner is still animating out, so releasing the outer now would make it
    // jump forward from underneath it.
    expect(inner()).not.toBeNull();
    expect(outer()!.hasAttribute('data-nested')).toBe(true);
  });
});

describe('Nested dialog dismissal', () => {
  const pressOutside = (sel: string) =>
    document.querySelector(sel)!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

  it('an outside press closes only the innermost dialog', async () => {
    await openBoth();
    pressOutside('.inner-backdrop');
    await settle();

    // The inner dialog's backdrop physically covers the outer one, so the press
    // never reached it and must not be treated as outside the outer dialog too.
    expect(inner()).toBeNull();
    expect(outer()).not.toBeNull();
  });

  it('a second outside press then closes the outer one', async () => {
    await openBoth();
    pressOutside('.inner-backdrop');
    await settle();
    pressOutside('.outer-backdrop');
    await settle();
    expect(outer()).toBeNull();
  });

  it('closeAll dismisses the whole stack', async () => {
    await openBoth();
    q('.discard').click();
    await settle();

    // Choosing "discard" answers the question and abandons the task behind it,
    // so leaving the form open would be wrong.
    expect(inner()).toBeNull();
    expect(outer()).toBeNull();
  });

  it('a plain Close still dismisses only its own dialog', async () => {
    await openBoth();
    q('.inner-close').click();
    await settle();
    expect(inner()).toBeNull();
    expect(outer()).not.toBeNull();
  });
});

describe('a stack more than two deep', () => {
  /** Three dialogs, each opened from inside the one before it. */
  function mountTriple() {
    const leaf = () =>
      h(DialogRoot as any, { defaultOpen: true }, {
        default: () =>
          h(Portal as any, null, {
            default: () => h(Popup as any, { class: 'third' }, { default: () => 'Third' }),
          }),
      });

    const middle = () =>
      h(DialogRoot as any, { defaultOpen: true }, {
        default: () =>
          h(Portal as any, null, {
            default: () => h(Popup as any, { class: 'second' }, { default: () => [leaf()] }),
          }),
      });

    const Host = defineComponent({
      setup: () => () =>
        h(DialogRoot as any, { defaultOpen: true }, {
          default: () =>
            h(Portal as any, null, {
              default: () => h(Popup as any, { class: 'first' }, { default: () => [middle()] }),
            }),
        }),
    });
    return mount(Host, { attachTo: document.body });
  }

  const at = (cls: string) => document.querySelector<HTMLElement>(`.${cls}`);

  it('steps every dialog back by how far it actually is from the front', async () => {
    // The old flag was a boolean, so a third dialog could not push the first
    // any further back than the second already had.
    mountTriple();
    await settle();

    expect(at('third')!.hasAttribute('data-level')).toBe(false);
    expect(at('second')!.getAttribute('data-level')).toBe('1');
    expect(at('first')!.getAttribute('data-level')).toBe('2');
  });

  it('gives the outermost a level to compute with', async () => {
    mountTriple();
    await settle();
    expect(at('first')!.getAttribute('style')).toContain('--dialog-level: 2');
  });
});
