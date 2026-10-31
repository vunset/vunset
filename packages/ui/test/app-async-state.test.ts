import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { AppAsyncState } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

// See app-button.test.ts: a click in the millisecond of the mount can be dropped.
const later = () => new Promise((resolve) => setTimeout(resolve, 2));

function mountState(props: Record<string, unknown>, slots: Record<string, any> = {}) {
  wrapper = mount(AppAsyncState as any, {
    props,
    slots: { default: ({ status }: any) => h('ul', { class: 'list' }, `content (${status})`), ...slots }
  });
  return wrapper;
}

const view = () => wrapper!.find('[data-part="async-state-message"]');

describe('AppAsyncState', () => {
  it('shows a loader, its title and text while loading with nothing yet', () => {
    mountState({ status: 'pending', loadingText: 'Fetching orders…' });

    expect(wrapper!.attributes('data-status')).toBe('pending');
    expect(wrapper!.attributes('data-view')).toBe('pending');
    expect(view().attributes('role')).toBe('status');
    expect(view().find('.app-async-state-loader').classes()).toContain('app-dot-matrix');
    expect(view().find('.app-empty-state-title').text()).toBe('Please wait');
    expect(view().find('.app-empty-state-description').text()).toBe('Fetching orders…');
    expect(wrapper!.find('.list').exists()).toBe(false);
  });

  it('shows the idle view only when given its title or text', () => {
    mountState({ status: 'idle' });
    expect(wrapper!.attributes('data-view')).toBe('idle');
    expect(view().exists()).toBe(false);
    wrapper!.unmount();

    mountState({ status: 'idle', idleTitle: 'Ready to search', idleText: 'Pick filters, then run it.' });
    expect(view().find('.app-empty-state-title').text()).toBe('Ready to search');
    expect(view().find('.app-empty-state-description').text()).toBe('Pick filters, then run it.');
  });

  it('shows the content once there is data', () => {
    mountState({ status: 'success', data: [1, 2] });
    expect(wrapper!.find('.list').text()).toBe('content (success)');
    expect(view().exists()).toBe(false);
  });

  it('shows the empty view, its texts and actions, when there is no data', () => {
    mountState(
      { status: 'success', data: [], emptyTitle: 'No orders', emptyText: 'Orders show up here.' },
      { 'empty-actions': () => h('button', { class: 'create' }, 'New order') }
    );

    expect(view().find('.app-empty-state-title').text()).toBe('No orders');
    expect(view().find('.app-empty-state-description').text()).toBe('Orders show up here.');
    expect(view().find('.create').exists()).toBe(true);
  });

  it('shows the error, with a retry button only when listened for', async () => {
    mountState({ status: 'error', errorText: 'The server hung up.' });
    expect(view().attributes('role')).toBe('alert');
    expect(view().find('.app-empty-state-title').text()).toBe('Something went wrong');
    expect(view().text()).toContain('The server hung up.');
    expect(view().find('button').exists()).toBe(false);
    wrapper!.unmount();

    const onRetry = vi.fn();
    mountState({ status: 'error', onRetry, retryLabel: 'Reload' });
    await later();
    const retry = view().find('button');
    expect(retry.text()).toBe('Reload');
    await retry.trigger('click');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps the content under a spinner on a soft reload', async () => {
    mountState({ status: 'pending', data: [1], softLoading: true });
    await nextTick();
    expect(wrapper!.find('.list').exists()).toBe(true);
    expect(wrapper!.find('[data-part="async-state-overlay"] .app-async-state-loader').exists()).toBe(true);
  });

  it('lets a slot replace a whole view', () => {
    mountState({ status: 'error' }, { error: () => h('p', { class: 'mine' }, 'Custom') });
    expect(view().find('.mine').exists()).toBe(true);
    expect(view().find('.app-empty-state-title').exists()).toBe(false);
  });
});
