import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h } from 'vue';
import { AppCard } from '../src';

let wrapper: VueWrapper<any> | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('AppCard', () => {
  it('draws a header from the title, description and actions, then the body and footer', () => {
    wrapper = mount(AppCard as any, {
      props: { title: 'Plan', description: 'Billed monthly', bodyClass: 'mine', footerClass: 'foot' },
      attrs: { class: 'w-80', id: 'plan' },
      slots: {
        actions: () => h('button', { class: 'more' }, '…'),
        default: () => 'Body',
        footer: () => h('button', 'Upgrade')
      }
    });

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['app-card', 'w-80']));
    expect(wrapper.attributes('id')).toBe('plan');
    expect(wrapper.find('.app-card-title').text()).toBe('Plan');
    expect(wrapper.find('.app-card-description').text()).toBe('Billed monthly');
    expect(wrapper.find('.app-card-actions .more').exists()).toBe(true);
    expect(wrapper.find('.app-card-body').classes()).toContain('mine');
    expect(wrapper.find('.app-card-body').text()).toBe('Body');
    expect(wrapper.find('.app-card-footer').classes()).toContain('foot');
  });

  it('leaves out a header, body or footer it has nothing for', () => {
    wrapper = mount(AppCard as any, { slots: { default: () => 'Only a body' } });
    expect(wrapper.find('.app-card-header').exists()).toBe(false);
    expect(wrapper.find('.app-card-footer').exists()).toBe(false);
    expect(wrapper.find('.app-card-body').text()).toBe('Only a body');
  });

  it('takes a whole header of the caller’s own', () => {
    wrapper = mount(AppCard as any, { props: { title: 'Ignored' }, slots: { header: () => h('h2', 'Own') } });
    expect(wrapper.find('.app-card-header h2').text()).toBe('Own');
    expect(wrapper.find('.app-card-title').exists()).toBe(false);
  });

  it('renders as a link, as a native element rather than a component of that name', () => {
    wrapper = mount(AppCard as any, { props: { as: 'a', title: 'Docs' }, attrs: { href: '/docs' } });
    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('href')).toBe('/docs');
  });
});
