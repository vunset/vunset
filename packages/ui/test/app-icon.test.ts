import { describe, it, expect, afterEach } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { h } from 'vue';
import { configureIcons } from '@vunset/vue';
import { AppIcon, AppDialog, AppTooltip } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  configureIcons({ inline: {} });
});

describe('AppIcon', () => {
  it('draws ui’s own icon at once, with the line-height class', () => {
    wrapper = mount(AppIcon as any, { props: { name: 'close' } });

    expect(wrapper.element.tagName).toBe('svg');
    expect(wrapper.classes()).toContain('app-icon');
    expect(wrapper.find('path').attributes('d')).toBe('M18 6L6 18M6 6l12 12');
    expect(wrapper.attributes('aria-hidden')).toBe('true');
  });

  it('draws the app’s icon of the same name instead, in every component', async () => {
    configureIcons({
      inline: { './icons/close.svg': async () => '<svg viewBox="0 0 24 24"><rect width="24" height="24"/></svg>' }
    });

    wrapper = mount(AppIcon as any, { props: { name: 'close' } });
    await flushPromises();
    expect(wrapper.find('rect').exists()).toBe(true);
    expect(wrapper.find('path').exists()).toBe(false);
    wrapper.unmount();

    // A component's own close button follows.
    wrapper = mount(AppDialog as any, { props: { open: true, title: 'T' }, attachTo: document.body });
    await flushPromises();
    expect(document.querySelector('.app-overlay-close svg rect')).not.toBeNull();
  });

  it('draws its slot for a name neither the app nor ui has', () => {
    wrapper = mount(AppIcon as any, {
      props: { name: 'rocket' },
      slots: { default: () => h('svg', { class: 'mine' }) }
    });
    expect(wrapper.find('.mine').exists()).toBe(true);
  });

  it('looks in the sprite when its slot renders nothing, as a trigger with no text passes', () => {
    wrapper = mount(AppIcon as any, { props: { name: 'rocket' }, slots: { default: () => [' ', ''] } });
    expect(wrapper.find('use').attributes('href')).toMatch(/#rocket$/);
  });

  it('looks in the sprite for an unknown name with no slot', () => {
    wrapper = mount(AppIcon as any, { props: { name: 'rocket' } });
    expect(wrapper.find('use').attributes('href')).toMatch(/#rocket$/);
  });

  it('takes the app’s own icon from the sprite, unless told to inline', async () => {
    configureIcons({
      inline: { './icons/rocket.svg': async () => '<svg viewBox="0 0 24 24"><rect width="24" height="24"/></svg>' }
    });

    wrapper = mount(AppIcon as any, { props: { name: 'rocket' } });
    await flushPromises();
    expect(wrapper.find('use').attributes('href')).toMatch(/#rocket$/);
    wrapper.unmount();

    wrapper = mount(AppIcon as any, { props: { name: 'rocket', inline: true } });
    await flushPromises();
    expect(wrapper.find('use').exists()).toBe(false);
    expect(wrapper.find('rect').exists()).toBe(true);
  });

  it('never asks the sprite when told to inline', () => {
    wrapper = mount(AppIcon as any, { props: { name: 'rocket', inline: true } });
    expect(wrapper.find('use').exists()).toBe(false);
  });

  it('works as a tooltip trigger with a name only the sprite has', () => {
    wrapper = mount(AppTooltip as any, {
      props: { content: '3 unread', as: AppIcon },
      attrs: { name: 'bell', 'aria-label': 'Notifications' },
      attachTo: document.body
    });
    const icon = document.querySelector('[data-name="bell"]')!;
    expect(icon.querySelector('use')!.getAttribute('href')).toMatch(/#bell$/);
    expect(icon.getAttribute('aria-label')).toBe('Notifications');
  });

  it('takes a class of its own, for another size', () => {
    wrapper = mount(AppIcon as any, { props: { name: 'check' }, attrs: { class: 'size-4' } });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['app-icon', 'size-4']));
  });
});
