import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import {
  CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel,
} from '../src';

function mountCollapsible(props: Record<string, any> = {}, panelProps: Record<string, any> = {}) {
  const Host = defineComponent({
    props: { rootProps: { type: Object, default: () => ({}) } },
    setup(p) {
      return () =>
        h(CollapsibleRoot as any, p.rootProps, {
          default: () => [
            h(CollapsibleTrigger as any, null, { default: () => 'Toggle' }),
            h(CollapsiblePanel as any, panelProps, { default: () => 'Panel content' }),
          ],
        });
    },
  });
  return mount(Host, { props: { rootProps: props }, attachTo: document.body });
}

const trigger = (w: any) => w.find('button');
const panel = (w: any) => w.find('button + div, [id]:not(button)');

/** The exit path unmounts only after animations settle, which spans rAF ticks. */
async function settle() {
  for (let i = 0; i < 6; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

describe('Collapsible', () => {
  describe('rendering', () => {
    it('does not render the panel while closed', () => {
      const w = mountCollapsible();
      expect(w.text()).not.toContain('Panel content');
    });

    it('renders the panel when defaultOpen', () => {
      const w = mountCollapsible({ defaultOpen: true });
      expect(w.text()).toContain('Panel content');
    });

    it('renders a native button trigger', () => {
      const w = mountCollapsible();
      expect(trigger(w).element.tagName).toBe('BUTTON');
      expect(trigger(w).attributes('type')).toBe('button');
    });
  });

  describe('accessibility', () => {
    it('reflects state in aria-expanded', async () => {
      const w = mountCollapsible();
      expect(trigger(w).attributes('aria-expanded')).toBe('false');
      await trigger(w).trigger('click');
      expect(trigger(w).attributes('aria-expanded')).toBe('true');
    });

    it('points aria-controls at the panel id', async () => {
      const w = mountCollapsible({ defaultOpen: true });
      await nextTick();
      const controls = trigger(w).attributes('aria-controls');
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls!)).not.toBeNull();
    });

    it('marks a kept-mounted closed panel as hidden', async () => {
      const w = mountCollapsible({}, { keepMounted: true });
      await nextTick();
      const el = w.find('[hidden]');
      expect(el.exists()).toBe(true);
      expect(el.text()).toContain('Panel content');
    });
  });

  describe('style hooks', () => {
    it('exposes data-closed then data-open on the root', async () => {
      const w = mountCollapsible();
      const root = w.find('div');
      expect(root.attributes()).toHaveProperty('data-closed');
      await trigger(w).trigger('click');
      expect(w.find('div').attributes()).toHaveProperty('data-open');
    });

    it('publishes the measured height as a custom property', async () => {
      const w = mountCollapsible({ defaultOpen: true });
      await settle();
      const el = document.querySelector('[id]:not(button)') as HTMLElement;
      expect(el.style.getPropertyValue('--collapsible-panel-height')).toMatch(/px$/);
    });

    it('re-measures when content grows inside the capped panel', async () => {
      const observers: { targets: Set<Element>; fire: () => void }[] = [];
      vi.stubGlobal(
        'ResizeObserver',
        class {
          targets = new Set<Element>();
          constructor(private callback: () => void) {
            observers.push(this);
          }
          observe(el: Element) {
            this.targets.add(el);
          }
          unobserve(el: Element) {
            this.targets.delete(el);
          }
          disconnect() {
            this.targets.clear();
          }
          fire() {
            this.callback();
          }
        }
      );

      try {
        const show = ref(false);
        const Host = defineComponent({
          setup: () => () =>
            h(CollapsibleRoot as any, { defaultOpen: true }, {
              default: () => [
                h(CollapsibleTrigger as any, null, { default: () => 'Toggle' }),
                h(CollapsiblePanel as any, null, {
                  default: () => [h('div', { class: 'content' }, 'Content'), show.value ? h('div', { class: 'more' }) : null]
                })
              ]
            })
        });
        mount(Host, { attachTo: document.body });
        await settle();

        const el = document.querySelector<HTMLElement>('[data-part="collapsible-panel"]')!;
        const observer = observers.find((o) => o.targets.has(el))!;
        // The panel's own box can't grow past the height it was given; its content can.
        expect(observer.targets.has(el.querySelector('.content')!)).toBe(true);

        Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 200 });
        observer.fire();
        expect(el.style.getPropertyValue('--collapsible-panel-height')).toBe('200px');

        show.value = true;
        await settle();
        expect(observer.targets.has(el.querySelector('.more')!)).toBe(true);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('applies data-enter-from while opening', async () => {
      const w = mountCollapsible();
      await trigger(w).trigger('click');
      await nextTick();
      expect(w.find('div').attributes()).toHaveProperty('data-enter-from');
    });
  });

  describe('interactions', () => {
    it('toggles open and closed', async () => {
      const w = mountCollapsible();
      await trigger(w).trigger('click');
      expect(w.text()).toContain('Panel content');
      await trigger(w).trigger('click');
      await settle();
      expect(w.text()).not.toContain('Panel content');
    });

    it('does not toggle when disabled', async () => {
      const w = mountCollapsible({ disabled: true });
      await trigger(w).trigger('click');
      expect(trigger(w).attributes('aria-expanded')).toBe('false');
      expect(trigger(w).attributes('disabled')).toBeDefined();
    });

    it('emits openChange with the new value', async () => {
      const onChange = vi.fn();
      const w = mountCollapsible({ onChange });
      await trigger(w).trigger('click');
      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('controlled state', () => {
    it('follows the open prop and does not self-update', async () => {
      const w = mountCollapsible({ open: false });
      await trigger(w).trigger('click');
      expect(trigger(w).attributes('aria-expanded')).toBe('false');
      await w.setProps({ rootProps: { open: true } });
      expect(trigger(w).attributes('aria-expanded')).toBe('true');
    });

    it('supports v-model:open', async () => {
      const Host = defineComponent({
        data: () => ({ open: false }),
        render() {
          return h(
            CollapsibleRoot as any,
            {
              open: this.open,
              'onUpdate:open': (v: boolean) => {
                this.open = v;
              },
            },
            {
              default: () => [
                h(CollapsibleTrigger as any, null, { default: () => 'Toggle' }),
                h(CollapsiblePanel as any, null, { default: () => 'Panel content' }),
              ],
            },
          );
        },
      });
      const w = mount(Host, { attachTo: document.body });
      await w.find('button').trigger('click');
      await nextTick();
      expect(w.text()).toContain('Panel content');
    });
  });
});
