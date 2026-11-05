import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, nextTick } from 'vue';
import { useCollapsible } from '../src/shared/use-collapsible';

describe('headless composables', () => {
  describe('useCollapsible', () => {
    it('wires a trigger to a panel with no components involved', async () => {
      const Host = defineComponent({
        setup() {
          const { triggerProps, panelProps, present } = useCollapsible();
          return () => [
            h('button', triggerProps.value, 'Toggle'),
            present.value ? h('section', panelProps.value, 'Body') : null,
          ];
        },
      });
      const w = mount(Host, { attachTo: document.body });

      const trigger = w.find('button');
      expect(trigger.attributes('aria-expanded')).toBe('false');
      expect(w.text()).not.toContain('Body');

      await trigger.trigger('click');
      expect(trigger.attributes('aria-expanded')).toBe('true');
      expect(w.text()).toContain('Body');
      expect(trigger.attributes('aria-controls')).toBe(w.find('section').attributes('id'));
    });
  });
});
