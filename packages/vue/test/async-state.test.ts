import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { AsyncState, resolveAsyncView } from '../src';

const SLOTS = {
  default: '<p class="content">rows</p>',
  pending: '<p class="pending">loading</p>',
  empty: '<p class="empty">nothing</p>',
  error: '<p class="error">failed</p>',
  idle: '<p class="idle">not started</p>',
  overlay: '<p class="overlay">spinner</p>',
};

const mountState = (props: Record<string, any>, slots: Record<string, string> = SLOTS) =>
  mount(AsyncState as any, { props, slots, attachTo: document.body });

const shown = (wrapper: ReturnType<typeof mountState>) =>
  ['content', 'pending', 'empty', 'error', 'idle'].filter((name) => wrapper.find(`.${name}`).exists());

describe('resolveAsyncView', () => {
  it('shows the content whenever there is some', () => {
    expect(resolveAsyncView('success', true, false).view).toBe('content');
    expect(resolveAsyncView('idle', true, false).view).toBe('content');
  });

  it('keeps stale content through an error', () => {
    expect(resolveAsyncView('error', true, false).view).toBe('content');
  });

  it('replaces content with the loading view, unless loading is soft', () => {
    expect(resolveAsyncView('pending', true, false)).toEqual({ view: 'pending', refreshing: false });
    expect(resolveAsyncView('pending', true, true)).toEqual({ view: 'content', refreshing: true });
  });

  it('shows the full loading view on a first load, soft or not', () => {
    // Soft loading keeps content that is there; with none, there is nothing to keep.
    expect(resolveAsyncView('pending', false, true)).toEqual({ view: 'pending', refreshing: false });
  });

  it('tells empty, error and idle apart when there is no data', () => {
    expect(resolveAsyncView('success', false, false).view).toBe('empty');
    expect(resolveAsyncView('error', false, false).view).toBe('error');
    expect(resolveAsyncView('idle', false, false).view).toBe('idle');
  });
});

describe('AsyncState', () => {
  it('renders exactly one view', () => {
    expect(shown(mountState({ status: 'success', data: [1] }))).toEqual(['content']);
    expect(shown(mountState({ status: 'pending' }))).toEqual(['pending']);
    expect(shown(mountState({ status: 'success', data: [] }))).toEqual(['empty']);
    expect(shown(mountState({ status: 'error' }))).toEqual(['error']);
    expect(shown(mountState({ status: 'idle' }))).toEqual(['idle']);
  });

  it('works out whether there is data from the data itself', () => {
    const empty = (data: unknown) => shown(mountState({ status: 'success', data }))[0];

    expect(empty([])).toBe('empty');
    expect(empty({})).toBe('empty');
    expect(empty(new Map())).toBe('empty');
    expect(empty(null)).toBe('empty');
    expect(empty([0])).toBe('content');
    expect(empty({ total: 0 })).toBe('content');
    expect(empty(0)).toBe('content');
    // No keys, still data.
    expect(empty(new Date())).toBe('content');
  });

  it('takes an explicit answer over the data', () => {
    expect(shown(mountState({ status: 'success', data: [], hasData: true }))).toEqual(['content']);
    expect(shown(mountState({ status: 'success', data: [1], hasData: false }))).toEqual(['empty']);
  });

  it('publishes the status and the view', () => {
    const wrapper = mountState({ status: 'error' });

    expect(wrapper.attributes('data-part')).toBe('async-state');
    expect(wrapper.attributes('data-status')).toBe('error');
    expect(wrapper.attributes('data-view')).toBe('error');
  });

  it('says it is busy while loading', () => {
    expect(mountState({ status: 'pending' }).attributes('aria-busy')).toBe('true');
    expect(mountState({ status: 'success', data: [1] }).attributes('aria-busy')).toBeUndefined();
  });

  it('announces an error at once, and the rest politely', () => {
    const role = (props: Record<string, any>) =>
      mountState(props).find('[data-part="async-state-message"]').attributes('role');

    expect(role({ status: 'error' })).toBe('alert');
    expect(role({ status: 'pending' })).toBe('status');
    expect(role({ status: 'success', data: [] })).toBe('status');
    expect(role({ status: 'idle' })).toBeUndefined();
  });

  it('renders no wrapper for a view it was given nothing for', () => {
    const wrapper = mountState({ status: 'idle' }, { default: '<p class="content">rows</p>' });

    expect(wrapper.find('[data-part="async-state-message"]').exists()).toBe(false);
  });

  it('hands every slot the status and the view', () => {
    const wrapper = mountState(
      { status: 'error', data: [1] },
      { default: '<template #default="{ status, view }"><p class="content">{{ status }}/{{ view }}</p></template>' },
    );

    // Stale content after a failed reload: the default slot can show a banner.
    expect(wrapper.find('.content').text()).toBe('error/content');
  });

  describe('soft loading', () => {
    it('keeps the content and lays the overlay over it', () => {
      const wrapper = mountState({ status: 'pending', data: [1], softLoading: true });

      expect(shown(wrapper)).toEqual(['content']);
      expect(wrapper.find('.overlay').exists()).toBe(true);
      expect(wrapper.attributes('data-refreshing')).toBe('');
      expect(wrapper.find('[data-part="async-state-overlay"]').attributes('aria-hidden')).toBe('true');
    });

    it('shows the full loading view on a first load, not an empty one under a spinner', () => {
      const wrapper = mountState({ status: 'pending', data: [], softLoading: true });

      expect(shown(wrapper)).toEqual(['pending']);
      expect(wrapper.find('.overlay').exists()).toBe(false);
    });

    it('lifts the overlay once loading is done', async () => {
      const wrapper = mountState({ status: 'pending', data: [1], softLoading: true });

      await wrapper.setProps({ status: 'success' });
      for (let i = 0; i < 3; i += 1) {
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        await nextTick();
      }

      expect(wrapper.find('.overlay').exists()).toBe(false);
      expect(wrapper.attributes('data-refreshing')).toBeUndefined();
    });

    it('draws no overlay at all without soft loading', () => {
      const wrapper = mountState({ status: 'pending', data: [1] });

      expect(wrapper.find('[data-part="async-state-overlay"]').exists()).toBe(false);
      expect(shown(wrapper)).toEqual(['pending']);
    });
  });
});
