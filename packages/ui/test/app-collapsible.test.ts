import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { AppCollapsible, AppAccordion } from '../src';

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

const triggers = () => wrapper!.findAll('.app-collapsible-trigger');
const contents = () => wrapper!.findAll('.app-collapsible-content').map((c) => c.text());

describe('AppCollapsible', () => {
  it('opens and closes its content from the trigger row, for v-model:open', async () => {
    wrapper = mount(AppCollapsible as any, {
      props: { title: 'Details', open: false },
      slots: { default: () => 'Hidden detail' },
      attachTo: document.body
    });
    expect(triggers()[0]!.text()).toBe('Details');
    expect(triggers()[0]!.attributes('aria-expanded')).toBe('false');
    expect(contents()).toEqual([]);

    await later();
    await triggers()[0]!.trigger('click');
    expect(wrapper.emitted('update:open')![0]).toEqual([true]);
  });

  it('shows its content while open, with a chevron that turns', async () => {
    wrapper = mount(AppCollapsible as any, {
      props: { title: 'Details', defaultOpen: true },
      slots: { default: () => 'Hidden detail' }
    });
    await settle();
    expect(contents()).toEqual(['Hidden detail']);
    expect(triggers()[0]!.attributes('data-open')).toBeDefined();
    expect(wrapper.find('.app-collapsible-chevron').attributes('data-name')).toBe('chevron-down');
  });

  it('takes a trigger slot, keep-mounted, and trigger- and panel-class', () => {
    wrapper = mount(AppCollapsible as any, {
      props: { keepMounted: true, triggerClass: 't', panelClass: 'p' },
      slots: { trigger: ({ open }: { open: boolean }) => h('b', open ? 'Less' : 'More'), default: () => 'Body' }
    });
    expect(triggers()[0]!.find('b').text()).toBe('More');
    expect(triggers()[0]!.classes()).toContain('t');
    expect(wrapper.find('.app-collapsible-content').classes()).toContain('p');
    expect(wrapper.find('.app-collapsible-panel').attributes('hidden')).toBeDefined();
  });
});

describe('AppAccordion', () => {
  const sections = [
    { value: 'shipping', title: 'How long does shipping take?' },
    { value: 'returns', title: 'Can I return an order?' },
    { value: 'gift', title: 'Gift wrapping', disabled: true }
  ];
  const slots = {
    shipping: () => 'Two to four days.',
    returns: () => 'Within 30 days.'
  };

  it('draws a section per entry, each content from the slot named after its value', async () => {
    wrapper = mount(AppAccordion as any, { props: { sections, defaultValue: ['shipping'] }, slots });
    await settle();

    expect(triggers().map((t) => t.text())).toEqual(sections.map((s) => s.title));
    expect(contents()).toEqual(['Two to four days.']);
    expect(triggers()[2]!.attributes('disabled')).toBeDefined();
  });

  it('opens one at a time, or several with multiple', async () => {
    wrapper = mount(AppAccordion as any, { props: { sections, modelValue: ['shipping'] }, slots });
    await later();
    await triggers()[1]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['returns']]);
    wrapper.unmount();

    wrapper = mount(AppAccordion as any, { props: { sections, modelValue: ['shipping'], multiple: true }, slots });
    await later();
    await triggers()[1]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['shipping', 'returns']]);
  });

  it('falls back to the panel slot, and takes a title slot and class props', async () => {
    wrapper = mount(AppAccordion as any, {
      props: { sections: [{ value: 'a', title: 'A' }], defaultValue: ['a'], sectionClass: 's', triggerClass: 't', panelClass: 'p' },
      slots: {
        panel: ({ section }: any) => `About ${section.title}`,
        title: ({ section, open }: any) => h('i', `${section.title}${open ? ' (open)' : ''}`)
      }
    });
    await settle();

    expect(contents()).toEqual(['About A']);
    expect(triggers()[0]!.find('i').text()).toBe('A (open)');
    expect(wrapper.find('.app-accordion-section').classes()).toContain('s');
    expect(triggers()[0]!.classes()).toContain('t');
    expect(wrapper.find('.app-collapsible-content').classes()).toContain('p');
  });
});
