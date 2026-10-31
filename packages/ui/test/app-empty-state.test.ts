import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h } from 'vue';
import { AppEmptyState } from '../src';

let wrapper: VueWrapper<any> | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('AppEmptyState', () => {
  it('draws the icon, title, description and actions it is given, and nothing else', () => {
    wrapper = mount(AppEmptyState as any, {
      props: { icon: 'circle-info', title: 'No orders yet', description: 'Orders show up here.', tone: 'accent' },
      slots: { actions: () => h('button', { class: 'create' }, 'New order') }
    });

    expect(wrapper.attributes('data-tone')).toBe('accent');
    expect(wrapper.find('.app-empty-state-icon [data-name="circle-info"]').exists()).toBe(true);
    expect(wrapper.find('.app-empty-state-title').text()).toBe('No orders yet');
    expect(wrapper.find('.app-empty-state-description').text()).toBe('Orders show up here.');
    expect(wrapper.find('.app-empty-state-actions .create').exists()).toBe(true);

    wrapper.unmount();
    wrapper = mount(AppEmptyState as any, { props: { title: 'Empty' } });
    expect(wrapper.find('.app-empty-state-icon').exists()).toBe(false);
    expect(wrapper.find('.app-empty-state-description').exists()).toBe(false);
    expect(wrapper.find('.app-empty-state-actions').exists()).toBe(false);
  });

  it('takes an icon, title and description from slots, and anything else in the default one', () => {
    wrapper = mount(AppEmptyState as any, {
      slots: {
        icon: () => h('i', { class: 'mine' }),
        title: () => 'Slotted',
        description: () => 'Text',
        default: () => h('p', { class: 'extra' }, 'More')
      }
    });

    expect(wrapper.find('.app-empty-state-icon .mine').exists()).toBe(true);
    expect(wrapper.find('.app-empty-state-title').text()).toBe('Slotted');
    expect(wrapper.find('.extra').exists()).toBe(true);
  });

  it('renders as another element', () => {
    wrapper = mount(AppEmptyState as any, { props: { as: 'section', title: 'x' } });
    expect(wrapper.element.tagName).toBe('SECTION');
  });
});
