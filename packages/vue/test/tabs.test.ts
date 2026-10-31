import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import { TabsRoot, TabsList, TabsTab, TabsPanel, TabsIndicator } from '../src';

interface Options {
  rootProps?: Record<string, any>;
  listProps?: Record<string, any>;
  tabs?: { value: string; disabled?: boolean }[];
  panels?: { value: string; keepMounted?: boolean }[];
  indicator?: boolean;
}

const DEFAULT_TABS: NonNullable<Options['tabs']> = [{ value: 'overview' }, { value: 'usage' }, { value: 'api' }];

function mountTabs(options: Options = {}) {
  const tabs = options.tabs ?? DEFAULT_TABS;
  const panels: NonNullable<Options['panels']> = options.panels ?? tabs.map((tab) => ({ value: tab.value }));

  const Host = defineComponent({
    setup() {
      return () =>
        h(TabsRoot as any, options.rootProps ?? null, {
          default: () => [
            h(TabsList as any, options.listProps ?? null, {
              default: () => [
                ...tabs.map((tab) =>
                  h(
                    TabsTab as any,
                    { value: tab.value, disabled: tab.disabled, class: `tab-${tab.value}` },
                    { default: () => tab.value }
                  )
                ),
                options.indicator ? h(TabsIndicator as any, { class: 'indicator' }) : null
              ]
            }),
            ...panels.map((panel) =>
              h(
                TabsPanel as any,
                { value: panel.value, keepMounted: panel.keepMounted, class: `panel-${panel.value}` },
                { default: () => `${panel.value} content` }
              )
            )
          ]
        });
    }
  });

  return mount(Host, { attachTo: document.body });
}

const tab = (value: string) => document.querySelector<HTMLElement>(`.tab-${value}`)!;
const panel = (value: string) => document.querySelector<HTMLElement>(`.panel-${value}`);
const list = () => document.querySelector<HTMLElement>('[role="tablist"]')!;
const selectedTab = () => document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');

function key(name: string, target: HTMLElement = document.activeElement as HTMLElement) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
}

/** Long enough for a leaving panel to finish and unmount. */
async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await nextTick();
  }
}

/** Clicking a real tab focuses it first, as a browser would. */
async function press(element: HTMLElement) {
  element.focus();
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await nextTick();
}

describe('Tabs', () => {
  describe('rendering', () => {
    it('wires the roles and the tab/panel pair by value', async () => {
      mountTabs();
      await nextTick();

      expect(list().getAttribute('role')).toBe('tablist');
      expect(tab('overview').getAttribute('role')).toBe('tab');
      expect(panel('overview')!.getAttribute('role')).toBe('tabpanel');

      // Neither knows where the other is rendered; both are found by value.
      expect(tab('overview').getAttribute('aria-controls')).toBe(panel('overview')!.id);
      expect(panel('overview')!.getAttribute('aria-labelledby')).toBe(tab('overview').id);
    });

    it('selects the first tab when nothing was asked for', async () => {
      mountTabs();
      await nextTick();

      expect(selectedTab()).toBe(tab('overview'));
      expect(panel('usage')).toBeNull();
    });

    it('honors defaultValue instead', async () => {
      mountTabs({ rootProps: { defaultValue: 'api' } });
      await nextTick();

      expect(selectedTab()).toBe(tab('api'));
      expect(panel('api')).not.toBeNull();
    });

    it('writes the first tab to a v-model that starts empty, and follows the model after', async () => {
      // Reactive, so the host re-renders with the model as `v-model` would.
      const rootProps = reactive<Record<string, any>>({ modelValue: undefined });
      rootProps['onUpdate:modelValue'] = (value: string) => (rootProps.modelValue = value);
      mountTabs({ rootProps });
      await nextTick();
      expect(rootProps.modelValue).toBe('overview');
      expect(selectedTab()).toBe(tab('overview'));

      rootProps.modelValue = 'api';
      await nextTick();
      expect(selectedTab()).toBe(tab('api'));
    });

    it('leaves a bound value alone while its owner keeps it empty', async () => {
      // Bound is controlled: the owner said what it wanted, and "nothing" is an answer.
      mountTabs({ rootProps: { modelValue: undefined } });
      await nextTick();

      expect(selectedTab()).toBeNull();
    });

    it('skips a disabled first tab when selecting one for itself', async () => {
      mountTabs({ tabs: [{ value: 'overview', disabled: true }, { value: 'usage' }] });
      await nextTick();

      expect(selectedTab()).toBe(tab('usage'));
    });

    it('announces its orientation only when it is not the default', async () => {
      mountTabs();
      await nextTick();
      expect(list().getAttribute('aria-orientation')).toBeNull();

      document.body.innerHTML = '';
      mountTabs({ rootProps: { orientation: 'vertical' } });
      await nextTick();
      expect(list().getAttribute('aria-orientation')).toBe('vertical');
    });
  });

  describe('selection', () => {
    it('selects on click and swaps the panel', async () => {
      mountTabs();
      await nextTick();

      await press(tab('usage'));
      expect(selectedTab()).toBe(tab('usage'));
      expect(panel('usage')).not.toBeNull();

      // The panel it replaced leaves rather than vanishing, so it is still
      // there for a frame — `present` outlives the selection.
      expect(panel('overview')).not.toBeNull();
      await settle();
      expect(panel('overview')).toBeNull();
    });

    it('announces the tab it picked for itself, so v-model agrees with the screen', async () => {
      // Selecting the first tab silently would leave a bound ref undefined
      // while the first panel is plainly showing.
      const onChange = vi.fn();
      mountTabs({ rootProps: { onChange } });
      await nextTick();

      expect(onChange).toHaveBeenCalledWith('overview');
    });

    it('emits the value once, and not again for the same tab', async () => {
      const onChange = vi.fn();
      mountTabs({ rootProps: { onChange } });
      await nextTick();
      onChange.mockClear();

      await press(tab('usage'));
      await press(tab('usage'));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('usage');
    });

    it('follows a controlled value moved from outside', async () => {
      const value = ref('overview');
      const Host = defineComponent({
        setup() {
          return () =>
            h(
              TabsRoot as any,
              { modelValue: value.value },
              {
                default: () => [
                  h(TabsList as any, null, {
                    default: () =>
                      DEFAULT_TABS.map((entry) =>
                        h(TabsTab as any, { value: entry.value, class: `tab-${entry.value}` })
                      )
                  }),
                  h(TabsPanel as any, { value: 'api', class: 'panel-api' })
                ]
              }
            );
        }
      });
      mount(Host, { attachTo: document.body });
      await nextTick();
      expect(panel('api')).toBeNull();

      value.value = 'api';
      await nextTick();
      expect(selectedTab()).toBe(tab('api'));
      expect(panel('api')).not.toBeNull();
    });

    it('ignores a disabled tab', async () => {
      mountTabs({ tabs: [{ value: 'overview' }, { value: 'usage', disabled: true }] });
      await nextTick();

      await press(tab('usage'));
      expect(selectedTab()).toBe(tab('overview'));
    });
  });

  describe('keyboard', () => {
    it('moves focus with the arrow keys without selecting', async () => {
      mountTabs();
      await nextTick();
      tab('overview').focus();

      key('ArrowRight');
      await nextTick();
      expect(document.activeElement).toBe(tab('usage'));
      // Manual activation: focus moved, the selection did not.
      expect(selectedTab()).toBe(tab('overview'));
    });

    it('selects on arrow keys when activateOnFocus is set', async () => {
      mountTabs({ rootProps: { activateOnFocus: true } });
      await nextTick();
      tab('overview').focus();

      key('ArrowRight');
      await nextTick();
      expect(selectedTab()).toBe(tab('usage'));
    });

    it('uses the axis it is drawn on', async () => {
      mountTabs({ rootProps: { orientation: 'vertical' } });
      await nextTick();
      tab('overview').focus();

      key('ArrowRight');
      await nextTick();
      expect(document.activeElement).toBe(tab('overview'));

      key('ArrowDown');
      await nextTick();
      expect(document.activeElement).toBe(tab('usage'));
    });

    it('wraps at the ends, unless told not to', async () => {
      mountTabs();
      await nextTick();
      tab('api').focus();
      key('ArrowRight');
      await nextTick();
      expect(document.activeElement).toBe(tab('overview'));

      document.body.innerHTML = '';
      mountTabs({ rootProps: { loop: false } });
      await nextTick();
      tab('api').focus();
      key('ArrowRight');
      await nextTick();
      expect(document.activeElement).toBe(tab('api'));
    });

    it('jumps to the ends with Home and End', async () => {
      mountTabs();
      await nextTick();
      tab('usage').focus();

      key('End');
      await nextTick();
      expect(document.activeElement).toBe(tab('api'));

      key('Home');
      await nextTick();
      expect(document.activeElement).toBe(tab('overview'));
    });

    it('steps over a disabled tab', async () => {
      mountTabs({
        tabs: [{ value: 'overview' }, { value: 'usage', disabled: true }, { value: 'api' }]
      });
      await nextTick();
      tab('overview').focus();

      key('ArrowRight');
      await nextTick();
      expect(document.activeElement).toBe(tab('api'));
    });
  });

  describe('tab order', () => {
    it('keeps one tab stop for the whole list', async () => {
      mountTabs();
      await nextTick();

      expect(tab('overview').getAttribute('tabindex')).toBe('0');
      expect(tab('usage').getAttribute('tabindex')).toBe('-1');
      expect(tab('api').getAttribute('tabindex')).toBe('-1');
    });

    it('moves the tab stop to the selected tab', async () => {
      mountTabs();
      await nextTick();

      await press(tab('api'));
      expect(tab('api').getAttribute('tabindex')).toBe('0');
      expect(tab('overview').getAttribute('tabindex')).toBe('-1');
    });

    it('leaves the tab stop where focus went, not where the selection is', async () => {
      // Arrowing to a tab and tabbing away should bring you back to the tab you
      // were looking at, not to the one that happens to be selected.
      mountTabs();
      await nextTick();
      tab('overview').focus();

      key('ArrowRight');
      await nextTick();
      expect(selectedTab()).toBe(tab('overview'));
      expect(tab('usage').getAttribute('tabindex')).toBe('0');
      expect(tab('overview').getAttribute('tabindex')).toBe('-1');
    });

    it('offers a tab stop when the selected tab is disabled', async () => {
      // Otherwise every tab is -1 and the list drops out of the tab order.
      mountTabs({
        rootProps: { defaultValue: 'usage' },
        tabs: [{ value: 'overview' }, { value: 'usage', disabled: true }]
      });
      await nextTick();

      expect(selectedTab()).toBe(tab('usage'));
      expect(tab('overview').getAttribute('tabindex')).toBe('0');
    });
  });

  describe('panels', () => {
    it('unmounts a hidden panel by default', async () => {
      mountTabs();
      await nextTick();
      expect(panel('usage')).toBeNull();
    });

    it('keeps one mounted and hidden when asked', async () => {
      mountTabs({ panels: DEFAULT_TABS.map((entry) => ({ value: entry.value, keepMounted: true })) });
      await nextTick();

      expect(panel('usage')).not.toBeNull();
      expect(panel('usage')!.hasAttribute('hidden')).toBe(true);
      expect(panel('overview')!.hasAttribute('hidden')).toBe(false);
    });

    it('is reachable by keyboard', async () => {
      mountTabs();
      await nextTick();
      expect(panel('overview')!.getAttribute('tabindex')).toBe('0');
    });
  });

  describe('activation direction', () => {
    it('reports which way the selection moved', async () => {
      mountTabs();
      await nextTick();
      expect(list().getAttribute('data-activation-direction')).toBe('none');

      await press(tab('api'));
      expect(list().getAttribute('data-activation-direction')).toBe('right');

      await press(tab('overview'));
      expect(list().getAttribute('data-activation-direction')).toBe('left');
    });

    it('reports it along the axis the tabs run on', async () => {
      mountTabs({ rootProps: { orientation: 'vertical' } });
      await nextTick();

      await press(tab('api'));
      expect(list().getAttribute('data-activation-direction')).toBe('down');
    });

    it('reaches the panel, which is what animates', async () => {
      mountTabs();
      await nextTick();

      await press(tab('api'));
      expect(panel('api')!.getAttribute('data-activation-direction')).toBe('right');
    });
  });

  describe('indicator', () => {
    it('publishes the selected tab geometry as custom properties', async () => {
      mountTabs({ indicator: true });
      await nextTick();
      await nextTick();

      const indicator = document.querySelector<HTMLElement>('.indicator')!;
      // `test/setup.ts` gives every element the same box, so the interesting
      // part is that the variables are published at all, and from the list's
      // own scroll size rather than the viewport.
      expect(indicator.style.getPropertyValue('--active-tab-width')).toBe('120px');
      expect(indicator.style.getPropertyValue('--active-tab-height')).toBe('32px');
      expect(indicator.style.getPropertyValue('--active-tab-left')).toBe('0px');
    });

    it('stays hidden until a tab has been measured', async () => {
      // Nothing is selected, so there is no tab to sit under.
      const Host = defineComponent({
        setup() {
          return () =>
            h(
              TabsRoot as any,
              { modelValue: 'missing' },
              {
                default: () =>
                  h(TabsList as any, null, { default: () => h(TabsIndicator as any, { class: 'indicator' }) })
              }
            );
        }
      });
      mount(Host, { attachTo: document.body });
      await nextTick();
      await nextTick();

      expect(document.querySelector<HTMLElement>('.indicator')!.hasAttribute('hidden')).toBe(true);
    });
  });

  describe('composition', () => {
    it('runs the caller’s click handler and still selects', async () => {
      let clicks = 0;
      const Host = defineComponent({
        setup() {
          return () =>
            h(TabsRoot as any, null, {
              default: () =>
                h(TabsList as any, null, {
                  default: () =>
                    DEFAULT_TABS.map((entry) =>
                      h(TabsTab as any, {
                        value: entry.value,
                        class: `tab-${entry.value}`,
                        onClick: () => {
                          clicks += 1;
                        }
                      })
                    )
                })
            });
        }
      });
      mount(Host, { attachTo: document.body });
      await nextTick();

      await press(tab('usage'));
      expect(clicks).toBe(1);
      expect(selectedTab()).toBe(tab('usage'));
    });

    it('lets a caller cancel the selection', async () => {
      const Host = defineComponent({
        setup() {
          return () =>
            h(TabsRoot as any, null, {
              default: () =>
                h(TabsList as any, null, {
                  default: () =>
                    DEFAULT_TABS.map((entry) =>
                      h(TabsTab as any, {
                        value: entry.value,
                        class: `tab-${entry.value}`,
                        onClick: (event: any) => event.preventInternalHandler()
                      })
                    )
                })
            });
        }
      });
      mount(Host, { attachTo: document.body });
      await nextTick();

      await press(tab('usage'));
      expect(selectedTab()).toBe(tab('overview'));
    });
  });
});
