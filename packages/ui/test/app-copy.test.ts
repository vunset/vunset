import { describe, it, expect, afterEach, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { configureIcons } from '@vunset/vue';
import { AppCopy } from '../src';

let wrapper: VueWrapper | undefined;

function stubClipboard(writeText = vi.fn(async () => {})) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  configureIcons({ inline: {} });
});

// See app-button.test.ts: a click in the millisecond of the mount can be dropped.
const later = () => new Promise((resolve) => setTimeout(resolve, 2));

const icon = (state: 'copy' | 'copy-done') => wrapper!.find(`.app-copy-icon[data-name="${state}"]`);

describe('AppCopy', () => {
  it('is a square ghost button named Copy, showing the copy icon', () => {
    wrapper = mount(AppCopy as any, { props: { value: 'npm i' } });
    const button = wrapper.find('button');

    expect(button.classes()).toEqual(expect.arrayContaining(['app-button', 'app-copy']));
    expect(button.attributes('data-variant')).toBe('ghost');
    expect(button.attributes('data-tone')).toBe('neutral');
    expect(button.attributes('data-square')).toBeDefined();
    expect(button.attributes('aria-label')).toBe('Copy');
    expect(icon('copy').attributes('data-active')).toBeDefined();
    expect(icon('copy-done').exists()).toBe(false);
  });

  it('draws its done icon once a pointer or focus arrives, before the press, so it can fade in', async () => {
    wrapper = mount(AppCopy as any, { props: { value: 'npm i' }, attachTo: document.body });
    await later();

    await wrapper.find('button').trigger('pointerenter');
    expect(icon('copy-done').exists()).toBe(true);
    expect(icon('copy-done').attributes('data-active')).toBeUndefined();

    wrapper.unmount();
    wrapper = mount(AppCopy as any, { props: { value: 'npm i' }, attachTo: document.body });
    await later();

    await wrapper.find('button').trigger('focus');
    expect(icon('copy-done').exists()).toBe(true);
  });

  it('takes variant, tone and size as an AppButton does', () => {
    wrapper = mount(AppCopy as any, { props: { value: 'npm i', variant: 'outline', tone: 'accent', size: 'sm' } });
    const button = wrapper.find('button');

    expect(button.attributes('data-variant')).toBe('outline');
    expect(button.attributes('data-tone')).toBe('accent');
    expect(button.attributes('data-size')).toBe('sm');
  });

  it('copies its value, then shows it copied for a moment', async () => {
    const writeText = stubClipboard();
    wrapper = mount(AppCopy as any, { props: { value: 'npm i', timeout: 1000 } });
    await later();

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith('npm i');
    expect(wrapper.emitted('copy')![0]).toEqual([true]);
    expect(wrapper.find('button').attributes('data-copied')).toBeDefined();
    expect(icon('copy-done').attributes('data-active')).toBeDefined();
    expect(icon('copy').attributes('data-active')).toBeUndefined();
  });

  it('with a label is a labeled button, not a square one', () => {
    wrapper = mount(AppCopy as any, { props: { value: 'x', label: 'Copy link' } });
    const button = wrapper.find('button');

    expect(button.text()).toBe('Copy link');
    expect(button.attributes('data-square')).toBeUndefined();
    expect(button.attributes('aria-label')).toBeUndefined();
  });

  it('draws the app’s copy icon in place of ui’s', async () => {
    configureIcons({
      inline: { './icons/copy.svg': async () => '<svg viewBox="0 0 24 24"><rect width="1" height="1"/></svg>' }
    });
    wrapper = mount(AppCopy as any, { props: { value: 'x' } });
    await later();
    await wrapper.find('button').trigger('pointerenter');
    await flushPromises();

    expect(icon('copy').find('rect').attributes('width')).toBe('1');
    expect(icon('copy-done').find('path').exists()).toBe(true);
  });
});
