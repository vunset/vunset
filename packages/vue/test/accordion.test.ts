import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel } from '../src';

interface ItemSpec {
  value?: string;
  disabled?: boolean;
  nested?: ItemSpec[];
}

const ITEMS: ItemSpec[] = [{ value: 'a' }, { value: 'b' }, { value: 'c' }];

function renderAccordion(rootProps: Record<string, any>, items: ItemSpec[]): any {
  return h(AccordionRoot as any, rootProps, {
    default: () =>
      items.map((item, index) =>
        h(AccordionItem as any, { value: item.value, disabled: item.disabled, key: index }, {
          default: () => [
            h(AccordionHeader as any, null, {
              default: () => h(AccordionTrigger as any, null, { default: () => `Trigger ${item.value ?? index}` })
            }),
            h(AccordionPanel as any, null, {
              default: () => [`Panel ${item.value ?? index}`, item.nested ? renderAccordion({}, item.nested) : null]
            })
          ]
        })
      )
  });
}

function mountAccordion(props: Record<string, any> = {}, items = ITEMS) {
  const Host = defineComponent({
    props: { rootProps: { type: Object, default: () => ({}) } },
    setup: (p) => () => renderAccordion(p.rootProps, items)
  });
  return mount(Host, { props: { rootProps: props }, attachTo: document.body });
}

const triggers = () => Array.from(document.querySelectorAll<HTMLButtonElement>('h3 > button'));
const trigger = (name: string) => triggers().find((el) => el.textContent === `Trigger ${name}`)!;
const panel = (name: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="region"]')).find((el) =>
    el.textContent!.startsWith(`Panel ${name}`)
  );
const openPanels = () => Array.from(document.querySelectorAll('[role="region"]')).map((el) => el.textContent);

async function settle() {
  for (let i = 0; i < 6; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const key = (el: HTMLElement, name: string) => {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
};

describe('Accordion', () => {
  describe('structure', () => {
    it('puts each trigger in a heading', () => {
      mountAccordion();
      expect(triggers()).toHaveLength(3);
      expect(triggers()[0].parentElement!.tagName).toBe('H3');
      expect(triggers()[0].getAttribute('type')).toBe('button');
    });

    it('links trigger and panel both ways', async () => {
      mountAccordion({ defaultValue: ['a'] });
      await settle();
      const a = trigger('a');
      expect(a.getAttribute('aria-expanded')).toBe('true');
      expect(a.getAttribute('aria-controls')).toBe(panel('a')!.id);
      expect(panel('a')!.getAttribute('aria-labelledby')).toBe(a.id);
      expect(trigger('b').getAttribute('aria-expanded')).toBe('false');
    });

    it('renders only open panels', async () => {
      mountAccordion({ defaultValue: ['b'] });
      await settle();
      expect(openPanels()).toEqual(['Panel b']);
    });

    it('marks the item and header open', async () => {
      mountAccordion({ defaultValue: ['a'] });
      await settle();
      const header = trigger('a').parentElement!;
      expect(header.hasAttribute('data-open')).toBe(true);
      expect(header.parentElement!.hasAttribute('data-open')).toBe(true);
      expect(trigger('b').parentElement!.hasAttribute('data-closed')).toBe(true);
    });

    it('marks the root with its orientation', () => {
      const w = mountAccordion({ orientation: 'horizontal' });
      expect(w.element.getAttribute('data-orientation')).toBe('horizontal');
    });
  });

  describe('single', () => {
    it('opening one item closes the other', async () => {
      mountAccordion();
      trigger('a').click();
      await settle();
      trigger('b').click();
      await settle();
      expect(openPanels()).toEqual(['Panel b']);
    });

    it('closes the open item when its trigger is pressed again', async () => {
      mountAccordion({ defaultValue: ['a'] });
      await settle();
      trigger('a').click();
      await settle();
      expect(openPanels()).toEqual([]);
    });
  });

  describe('multiple', () => {
    it('keeps several items open', async () => {
      mountAccordion({ multiple: true });
      trigger('a').click();
      trigger('c').click();
      await settle();
      expect(openPanels()).toEqual(['Panel a', 'Panel c']);
    });

    it('closes one without touching the others', async () => {
      mountAccordion({ multiple: true, defaultValue: ['a', 'b'] });
      await settle();
      trigger('a').click();
      await settle();
      expect(openPanels()).toEqual(['Panel b']);
    });
  });

  describe('value', () => {
    it('emits the open values', async () => {
      const w = mountAccordion({ multiple: true });
      trigger('a').click();
      trigger('b').click();
      await nextTick();
      const root = w.findComponent(AccordionRoot);
      expect(root.emitted('update:modelValue')).toEqual([[['a']], [['a', 'b']]]);
      expect(root.emitted('change')).toEqual([[['a']], [['a', 'b']]]);
    });

    it('follows a controlled value and does not drift from it', async () => {
      const w = mountAccordion({ modelValue: ['a'] });
      await settle();
      trigger('b').click();
      await settle();
      expect(openPanels()).toEqual(['Panel a']);

      await w.setProps({ rootProps: { modelValue: ['b'] } });
      await settle();
      expect(openPanels()).toEqual(['Panel b']);
    });

    it('works without item values', async () => {
      mountAccordion({}, [{}, {}]);
      triggers()[1].click();
      await settle();
      expect(openPanels()).toEqual(['Panel 1']);
    });
  });

  describe('disabled', () => {
    it('ignores a disabled item', async () => {
      mountAccordion({}, [{ value: 'a' }, { value: 'b', disabled: true }]);
      expect(trigger('b').disabled).toBe(true);
      trigger('b').click();
      await settle();
      expect(openPanels()).toEqual([]);
    });

    it('disables every item from the root', async () => {
      const w = mountAccordion({ disabled: true });
      expect(triggers().every((el) => el.disabled)).toBe(true);
      expect(w.element.hasAttribute('data-disabled')).toBe(true);
    });
  });

  describe('keyboard', () => {
    it('moves between triggers with the arrow keys', () => {
      mountAccordion();
      trigger('a').focus();
      expect(key(trigger('a'), 'ArrowDown').defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(trigger('b'));
      key(trigger('b'), 'ArrowUp');
      expect(document.activeElement).toBe(trigger('a'));
    });

    it('jumps to the ends with Home and End', () => {
      mountAccordion();
      trigger('b').focus();
      key(trigger('b'), 'End');
      expect(document.activeElement).toBe(trigger('c'));
      key(trigger('c'), 'Home');
      expect(document.activeElement).toBe(trigger('a'));
    });

    it('wraps around by default', () => {
      mountAccordion();
      trigger('c').focus();
      key(trigger('c'), 'ArrowDown');
      expect(document.activeElement).toBe(trigger('a'));
    });

    it('stops at the ends without loop', () => {
      mountAccordion({ loop: false });
      trigger('c').focus();
      key(trigger('c'), 'ArrowDown');
      expect(document.activeElement).toBe(trigger('c'));
    });

    it('skips disabled items', () => {
      mountAccordion({}, [{ value: 'a' }, { value: 'b', disabled: true }, { value: 'c' }]);
      trigger('a').focus();
      key(trigger('a'), 'ArrowDown');
      expect(document.activeElement).toBe(trigger('c'));
    });

    it('uses left and right when horizontal', () => {
      mountAccordion({ orientation: 'horizontal' });
      trigger('a').focus();
      expect(key(trigger('a'), 'ArrowDown').defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(trigger('a'));
      key(trigger('a'), 'ArrowRight');
      expect(document.activeElement).toBe(trigger('b'));
    });

    it('keeps a nested accordion out of the outer one', async () => {
      mountAccordion({ defaultValue: ['a'] }, [{ value: 'a', nested: [{ value: 'x' }, { value: 'y' }] }, { value: 'b' }]);
      await settle();
      trigger('a').focus();
      key(trigger('a'), 'ArrowDown');
      expect(document.activeElement).toBe(trigger('b'));

      trigger('x').focus();
      key(trigger('x'), 'ArrowDown');
      expect(document.activeElement).toBe(trigger('y'));
    });
  });
});
