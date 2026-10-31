import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { TooltipGroup } from '@vunset/vue';
import { AppDialog, AppDrawer, AppPopover, AppTooltip, AppButton } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

// See app-button.test.ts: a click in the millisecond of the mount can be dropped.
const later = () => new Promise((resolve) => setTimeout(resolve, 2));

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"], [role="alertdialog"]');
const trigger = () => document.querySelector<HTMLElement>('[aria-haspopup="dialog"]')!;
const closeButton = () => document.querySelector<HTMLElement>('.app-overlay-close');

function mountOverlay(component: unknown, props: Record<string, unknown>, slots: Record<string, any>) {
  wrapper = mount(component as any, { props, slots, attachTo: document.body });
  return wrapper;
}

describe('AppDialog', () => {
  it('opens from a text trigger, named by its title and described', async () => {
    mountOverlay(
      AppDialog,
      { title: 'Delete project?', description: 'It can’t be undone.', trigger: 'Delete' },
      { default: () => h('p', 'Body') }
    );

    expect(trigger().tagName).toBe('BUTTON');
    expect(trigger().classList.contains('app-dialog-trigger')).toBe(true);
    expect(trigger().textContent!.trim()).toBe('Delete');
    await later();
    trigger().click();
    await settle();

    expect(dialog()).not.toBeNull();
    expect(document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!.textContent!.trim()).toBe(
      'Delete project?'
    );
    expect(document.getElementById(dialog()!.getAttribute('aria-describedby')!)!.textContent!.trim()).toBe(
      'It can’t be undone.'
    );
    expect(dialog()!.dataset.size).toBe('md');
  });

  it('closes from its close button, named by close-label', async () => {
    const open = ref(true);
    wrapper = mount(
      defineComponent({
        render: () =>
          h(
            AppDialog as any,
            { open: open.value, 'onUpdate:open': (v: boolean) => (open.value = v), title: 'T', closeLabel: 'Shut' },
            { default: () => 'Body' }
          )
      }),
      { attachTo: document.body }
    );
    await settle();

    expect(closeButton()!.getAttribute('aria-label')).toBe('Shut');
    await later();
    closeButton()!.click();
    await settle();
    expect(open.value).toBe(false);
  });

  it('hands its footer a close function', async () => {
    mountOverlay(
      AppDialog,
      { defaultOpen: true, title: 'T', closable: false },
      {
        footer: ({ close }: { close: () => void }) =>
          h(AppButton as any, { class: 'cancel', onClick: close }, () => 'Cancel')
      }
    );
    await settle();
    expect(closeButton()).toBeNull();

    await later();
    document.querySelector<HTMLElement>('.cancel')!.click();
    await settle();
    expect(dialog()).toBeNull();
  });

  it('renders its trigger as the given component, with its attributes and trigger-class', async () => {
    wrapper = mount(AppDialog as any, {
      props: { title: 'T', trigger: 'Delete', as: AppButton, triggerClass: 'w-full' },
      attrs: { variant: 'outline', 'aria-label': 'Delete the project' },
      attachTo: document.body
    });

    expect(trigger().classList.contains('app-button')).toBe(true);
    expect(trigger().classList.contains('app-dialog-trigger')).toBe(false);
    expect(trigger().classList.contains('w-full')).toBe(true);
    expect(trigger().dataset.variant).toBe('outline');
    expect(trigger().getAttribute('aria-label')).toBe('Delete the project');
    await later();
    trigger().click();
    await settle();
    expect(dialog()).not.toBeNull();
  });

  it('renders no trigger without one, for v-model:open', () => {
    mountOverlay(AppDialog, { title: 'T' }, {});
    expect(document.querySelector('[aria-haspopup="dialog"]')).toBeNull();
  });

  it('emits closed once it has closed, to unmount it', async () => {
    const onClosed = vi.fn();
    mountOverlay(AppDialog, { defaultOpen: true, title: 'T', onClosed }, {});
    await settle();
    expect(onClosed).not.toHaveBeenCalled();

    await later();
    closeButton()!.click();
    await settle();
    expect(dialog()).toBeNull();
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it('lets a footer button submit a form in the body, through its form attribute', async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    mountOverlay(
      AppDialog,
      { defaultOpen: true, title: 'Edit' },
      {
        default: () => h('form', { id: 'profile', onSubmit }, h('input', { name: 'name' })),
        footer: () => h(AppButton as any, { type: 'submit', form: 'profile', class: 'save' }, () => 'Save')
      }
    );
    await settle();

    const save = document.querySelector<HTMLButtonElement>('.save')!;
    expect(save.form).toBe(document.getElementById('profile'));
    await later();
    save.click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('becomes an alertdialog when asked', async () => {
    mountOverlay(AppDialog, { defaultOpen: true, title: 'Sure?', role: 'alertdialog' }, {});
    await settle();
    expect(dialog()!.getAttribute('role')).toBe('alertdialog');
  });
});

describe('AppDrawer', () => {
  it('enters from its side, with no handle and no swipe unless asked', async () => {
    mountOverlay(AppDrawer, { defaultOpen: true, title: 'Filters' }, { default: () => 'Body' });
    await settle();

    expect(dialog()!.dataset.side).toBe('bottom');
    expect(document.querySelector('.app-drawer-handle')).toBeNull();
    expect(dialog()!.style.touchAction).toBe('');
  });

  it('draws a handle that closes it on a swipe, with handle', async () => {
    mountOverlay(AppDrawer, { defaultOpen: true, handle: true, title: 'Filters' }, {});
    await settle();

    // The handle takes the drag; the panel itself still scrolls.
    expect(document.querySelector<HTMLElement>('.app-drawer-handle')!.style.touchAction).toBe('none');
    expect(dialog()!.style.touchAction).toBe('');
  });

  it('closes on a swipe from anywhere with swipeable, a handle only if asked', async () => {
    mountOverlay(AppDrawer, { defaultOpen: true, side: 'right', swipeable: true, title: 'Settings' }, {});
    await settle();

    expect(dialog()!.dataset.side).toBe('right');
    expect(dialog()!.style.touchAction).toBe('pan-y');
    expect(document.querySelector('.app-drawer-handle')).toBeNull();
    wrapper!.unmount();

    mountOverlay(AppDrawer, { defaultOpen: true, swipeable: true, handle: true, title: 'Filters' }, {});
    await settle();
    expect(dialog()!.style.touchAction).toBe('pan-x');
    expect(document.querySelector<HTMLElement>('.app-drawer-handle')!.style.touchAction).toBe('none');
  });

  it('keeps its close button with no title or description', async () => {
    mountOverlay(AppDrawer, { defaultOpen: true, closable: true }, { default: () => 'Body' });
    await settle();
    expect(closeButton()).not.toBeNull();
  });

  it('has no close button unless closable', async () => {
    mountOverlay(AppDrawer, { defaultOpen: true, title: 'T' }, {});
    await settle();
    expect(closeButton()).toBeNull();
  });

  it('opens from its trigger, as the given component, with trigger-class', async () => {
    wrapper = mount(AppDrawer as any, {
      props: { title: 'Filters', trigger: 'Filters', as: AppButton, triggerClass: 'ml-auto' },
      attrs: { variant: 'outline' },
      attachTo: document.body
    });

    expect(trigger().textContent!.trim()).toBe('Filters');
    expect(trigger().dataset.variant).toBe('outline');
    expect(trigger().classList.contains('ml-auto')).toBe(true);
    await later();
    trigger().click();
    await settle();
    expect(dialog()).not.toBeNull();
    wrapper.unmount();

    mountOverlay(AppDrawer, { title: 'Filters', trigger: 'Filters' }, {});
    expect(trigger().classList.contains('app-drawer-trigger')).toBe(true);
  });

  it('emits closed once it has closed', async () => {
    const onClosed = vi.fn();
    mountOverlay(AppDrawer, { defaultOpen: true, closable: true, title: 'T', onClosed }, {});
    await settle();

    await later();
    closeButton()!.click();
    await settle();
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it('hands its body a close function', async () => {
    mountOverlay(
      AppDrawer,
      { defaultOpen: true, title: 'T' },
      { default: ({ close }: { close: () => void }) => h('button', { class: 'done', onClick: close }, 'Done') }
    );
    await settle();

    await later();
    document.querySelector<HTMLElement>('.done')!.click();
    await settle();
    expect(dialog()).toBeNull();
  });
});

// Stands in for an app's icon: a plain element with its attributes passed on.
const FakeIcon = defineComponent({
  props: { name: String },
  render() {
    return h('svg', { 'data-icon': this.name });
  }
});

describe('AppPopover', () => {
  const popoverTrigger = () => document.querySelector<HTMLElement>('[aria-haspopup="dialog"]')!;

  it('opens from a text trigger, named by its title, with an arrow when asked', async () => {
    mountOverlay(AppPopover, { title: 'Share', arrow: true, trigger: 'Share link' }, { default: () => 'Link' });

    expect(popoverTrigger().tagName).toBe('BUTTON');
    expect(popoverTrigger().textContent!.trim()).toBe('Share link');
    expect(popoverTrigger().classList.contains('app-popover-trigger')).toBe(true);
    await later();
    popoverTrigger().click();
    await settle();

    expect(dialog()).not.toBeNull();
    expect(document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!.textContent!.trim()).toBe('Share');
    expect(document.querySelector('.app-popover-arrow')).not.toBeNull();
  });

  it('renders its trigger as the given component, with its attributes', async () => {
    wrapper = mount(AppPopover as any, {
      props: { as: AppButton, trigger: 'Share' },
      attrs: { variant: 'outline', class: 'mine' },
      attachTo: document.body
    });

    expect(popoverTrigger().classList.contains('app-button')).toBe(true);
    expect(popoverTrigger().classList.contains('mine')).toBe(true);
    expect(popoverTrigger().classList.contains('app-popover-trigger')).toBe(false);
    expect(popoverTrigger().dataset.variant).toBe('outline');
  });

  it('adds trigger-class to a component trigger too', () => {
    mountOverlay(AppPopover, { trigger: 'Share', as: AppButton, triggerClass: 'w-full' }, {});
    expect([...popoverTrigger().classList]).toEqual(expect.arrayContaining(['app-button', 'w-full']));
  });

  describe('lazy', () => {
    const mountLazy = () =>
      mountOverlay(
        AppPopover,
        { lazy: true, as: AppButton, trigger: 'Edit', title: 'Edit' },
        { default: () => h('input', { class: 'field' }) }
      );

    it('renders the same trigger, and no popover until it is reached', () => {
      const w = mountLazy();

      expect(popoverTrigger().classList.contains('app-button')).toBe(true);
      expect(popoverTrigger().getAttribute('aria-expanded')).toBe('false');
      expect(w.findComponent({ name: 'PopoverRoot' }).exists()).toBe(false);
    });

    it('swaps in the popover when a pointer arrives, so the press opens it', async () => {
      const w = mountLazy();

      popoverTrigger().dispatchEvent(new PointerEvent('pointerenter'));
      await nextTick();
      expect(w.findComponent({ name: 'PopoverRoot' }).exists()).toBe(true);
      expect(dialog()).toBeNull();

      await later();
      popoverTrigger().click();
      await settle();
      expect(dialog()).not.toBeNull();
    });

    it('opens at once from a key, and gives focus back to the trigger it swapped in', async () => {
      mountLazy();

      await later();
      popoverTrigger().focus();
      popoverTrigger().click();
      await settle();
      expect(dialog()!.contains(document.activeElement)).toBe(true);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(popoverTrigger());
    });
  });

  it('renders no trigger without one, for v-model:open', () => {
    mountOverlay(AppPopover, { title: 'T' }, {});
    expect(document.querySelector('[aria-haspopup="dialog"]')).toBeNull();
  });

  it.each([
    [true, true],
    [false, false]
  ])('with inline=%s, renders the popup inside its parent: %s', async (inline, inside) => {
    const Host = defineComponent(() => () => h('div', { id: 'host' }, [h(AppPopover, { trigger: 'Open', inline })]));
    wrapper = mount(Host, { attachTo: document.body });
    await later();
    popoverTrigger().click();
    await settle();

    expect(dialog()).not.toBeNull();
    expect(document.getElementById('host')!.contains(dialog())).toBe(inside);
  });
});

describe('AppTooltip', () => {
  const tip = () => document.querySelector<HTMLElement>('[role="tooltip"]')!;

  it('describes a text trigger, a plain button', async () => {
    mountOverlay(AppTooltip, { trigger: 'SLA', content: 'Service level agreement', open: true }, {});
    await settle();

    const button = document.querySelector<HTMLElement>('.app-tooltip-trigger')!;
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.textContent!.trim()).toBe('SLA');
    expect(tip().textContent!.trim()).toBe('Service level agreement');
    expect(button.getAttribute('aria-describedby')).toBe(tip().id);
  });

  it('makes the one component in its slot the trigger, not a button around it', async () => {
    const onClick = vi.fn();
    wrapper = mount(AppTooltip as any, {
      props: { content: 'Longer session', open: true },
      slots: { default: () => h(AppButton as any, { type: 'submit', class: 'group', onClick }, () => 'Go') },
      attachTo: document.body
    });
    await settle();

    const buttons = document.querySelectorAll<HTMLElement>('button');
    expect(buttons).toHaveLength(1);
    const button = buttons[0]!;
    expect([...button.classList]).toEqual(expect.arrayContaining(['app-button', 'group']));
    expect(button.classList.contains('app-tooltip-trigger')).toBe(false);
    expect(button.getAttribute('type')).toBe('submit');
    expect(button.getAttribute('aria-describedby')).toBe(tip().id);
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('wraps a popover: its trigger gets the tooltip, and both open', async () => {
    wrapper = mount(AppTooltip as any, {
      props: { content: 'Bid floor', open: true },
      slots: {
        default: () =>
          h(AppPopover as any, { trigger: 'Bid', as: AppButton }, { default: () => h('p', 'Edit the bid') })
      },
      attachTo: document.body
    });
    await settle();

    const button = document.querySelector<HTMLElement>('button[aria-haspopup="dialog"]')!;
    expect(button.getAttribute('aria-describedby')).toBe(tip().id);
    // Placed against the button: measured, where an unresolved anchor leaves it hidden.
    expect(tip().closest<HTMLElement>('[data-part="positioner"]')!.style.getPropertyValue('--anchor-width')).toBe(
      '120px'
    );

    await later();
    button.click();
    await settle();
    expect(document.querySelector('.app-popover')!.textContent).toContain('Edit the bid');
  });

  it('keeps the text button for text in its slot', async () => {
    mountOverlay(AppTooltip, { content: 'Service level agreement', open: true }, { default: () => 'SLA' });
    await settle();
    const button = document.querySelector<HTMLElement>('.app-tooltip-trigger')!;
    expect(button.tagName).toBe('BUTTON');
    expect(button.textContent).toBe('SLA');
  });

  it('renders its trigger as an AppButton, with its attributes', async () => {
    wrapper = mount(AppTooltip as any, {
      props: { content: 'Copy to clipboard', open: true, as: AppButton },
      attrs: { square: true, 'aria-label': 'Copy' },
      slots: { default: () => 'C' },
      attachTo: document.body
    });
    await settle();

    const button = document.querySelector<HTMLElement>('.app-button')!;
    expect(button.getAttribute('aria-label')).toBe('Copy');
    expect(button.hasAttribute('data-square')).toBe(true);
    expect(button.classList.contains('app-tooltip-trigger')).toBe(false);
    expect(button.getAttribute('aria-describedby')).toBe(tip().id);
  });

  it('makes an icon trigger focusable, unless told otherwise', async () => {
    wrapper = mount(AppTooltip as any, {
      props: { content: 'Notifications', open: true, as: FakeIcon },
      attrs: { name: 'bell', 'aria-label': 'Notifications' },
      attachTo: document.body
    });
    await settle();

    const icon = document.querySelector<HTMLElement>('[data-icon="bell"]')!;
    expect(icon.getAttribute('tabindex')).toBe('0');
    expect(icon.getAttribute('aria-label')).toBe('Notifications');
    expect(icon.getAttribute('aria-describedby')).toBe(tip().id);
    wrapper.unmount();

    wrapper = mount(AppTooltip as any, {
      props: { content: 'Notifications', as: FakeIcon },
      attrs: { name: 'bell', tabindex: -1 },
      attachTo: document.body
    });
    expect(document.querySelector('[data-icon="bell"]')!.getAttribute('tabindex')).toBe('-1');
  });

  it('adds trigger-class to the trigger, beside its own', () => {
    mountOverlay(AppTooltip, { trigger: 'SLA', content: 'x', triggerClass: ['font-bold', { 'text-red': true }] }, {});

    const trigger = document.querySelector<HTMLElement>('[data-part="trigger"], .app-tooltip-trigger')!;
    expect([...trigger.classList]).toEqual(expect.arrayContaining(['app-tooltip-trigger', 'font-bold', 'text-red']));
  });

  it('takes rich content from the #content slot', async () => {
    mountOverlay(AppTooltip, { open: true, trigger: 'T' }, { content: () => h('b', 'Bold tip') });
    await settle();
    expect(document.querySelector('[role="tooltip"] b')!.textContent).toBe('Bold tip');
  });

  it('opens a neighbor at once inside a TooltipGroup, once one is showing', async () => {
    wrapper = mount(
      defineComponent({
        render: () =>
          h(TooltipGroup as any, { delay: 200, timeout: 500 }, () =>
            ['Bold', 'Italic'].map((label) => h(AppTooltip as any, { trigger: label, content: `${label} tip` }))
          )
      }),
      { attachTo: document.body }
    );
    const [bold, italic] = document.querySelectorAll<HTMLElement>('.app-tooltip-trigger');
    const hover = (el: Element, type: string) =>
      el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'mouse' }));

    hover(bold!, 'pointerenter');
    await settle();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 400));
    await settle();
    expect(tip().textContent!.trim()).toBe('Bold tip');

    hover(bold!, 'pointerleave');
    hover(italic!, 'pointerenter');
    await nextTick();
    await nextTick();
    expect([...document.querySelectorAll('[role="tooltip"]')].map((el) => el.textContent!.trim())).toContain(
      'Italic tip'
    );
  });
});
