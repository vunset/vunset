import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, nextTick } from 'vue';
import { useCollapsible } from '../src/shared/use-collapsible';

/**
 * Some behavior is worth running with no component around it — that is what
 * earns a composable its own module. These exercise that directly.
 *
 * Only the composables that still exist belong here: `useSwitch` and
 * `useCheckbox` were merged into their components, so their coverage lives in
 * `switch.test.ts` and `checkbox.test.ts` with everything else about them.
 */
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
      // The trigger must point at the panel it controls.
      expect(trigger.attributes('aria-controls')).toBe(w.find('section').attributes('id'));
    });
  });
});
