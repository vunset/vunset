import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { AppProgress, AppMeter } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

const root = () => wrapper!.find('.app-gauge');

describe('AppProgress', () => {
  it('is a progressbar named by its label', async () => {
    wrapper = mount(AppProgress as any, { props: { value: 30, label: 'Uploading' }, attachTo: document.body });
    await nextTick();

    const bar = wrapper.find('[role="progressbar"]');
    expect(bar.classes()).toEqual(expect.arrayContaining(['app-gauge', 'app-progress']));
    const labelId = bar.attributes('aria-labelledby')!;
    expect(document.getElementById(labelId)!.textContent!.trim()).toBe('Uploading');
  });

  it('shows the formatted value and sets the bar by percentage', () => {
    wrapper = mount(AppProgress as any, { props: { value: 40, label: 'Uploading' } });
    expect(wrapper.find('.app-gauge-value').text()).toBe('40');
    expect(root().attributes('style')).toContain('--gauge-percentage: 40%');
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('40');
  });

  it('sweeps while the value is null', () => {
    wrapper = mount(AppProgress as any, { props: { value: null, label: 'Waiting' } });
    expect(wrapper.find('.app-gauge-indicator').attributes('data-status')).toBe('indeterminate');
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBeUndefined();
  });

  it('hides the value on request, and takes a tone and track-class', () => {
    wrapper = mount(AppProgress as any, { props: { value: 10, showValue: false, tone: 'success', trackClass: 'h-1' } });
    expect(wrapper.find('.app-gauge-value').exists()).toBe(false);
    expect(wrapper.find('.app-gauge-header').exists()).toBe(false);
    expect(root().attributes('data-tone')).toBe('success');
    expect(wrapper.find('.app-gauge-track').classes()).toContain('h-1');
  });
});

describe('AppMeter', () => {
  it('is a meter, with the same look', () => {
    wrapper = mount(AppMeter as any, {
      props: { value: 72, label: 'Disk used', tone: 'warning', format: { style: 'unit', unit: 'percent' } }
    });

    const meter = wrapper.find('[role="meter"]');
    expect(meter.classes()).toEqual(expect.arrayContaining(['app-gauge', 'app-meter']));
    expect(meter.attributes('aria-valuenow')).toBe('72');
    expect(meter.attributes('data-tone')).toBe('warning');
    expect(wrapper.find('.app-gauge-value').text()).toBe('72%');
  });
});
