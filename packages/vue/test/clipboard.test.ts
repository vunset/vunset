import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, effectScope, h, ref } from 'vue';
import { Copy, useClipboard, configureIcons } from '../src';
import { provideRecycle } from '../src/shared/recycle';

const writeText = vi.fn<(text: string) => Promise<void>>();

function withClipboard(available = true) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: available ? { writeText } : undefined
  });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  writeText.mockReset().mockResolvedValue(undefined);
  withClipboard();
});

afterEach(() => {
  vi.useRealTimers();
  configureIcons({ inline: {} });
});

function run() {
  const scope = effectScope();
  const api = scope.run(() => useClipboard())!;
  return { api, scope };
}

describe('useClipboard', () => {
  it('copies, shows it, and settles back', async () => {
    const { api } = run();

    expect(await api.copy('hello')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(api.status.value).toBe('copied');
    expect(api.copied.value).toBe(true);

    vi.advanceTimersByTime(1500);
    expect(api.status.value).toBe('idle');
  });

  it('does nothing with nothing to copy', async () => {
    const { api } = run();

    expect(await api.copy('')).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
    expect(api.status.value).toBe('idle');
  });

  it('remembers which one was copied, for a list sharing one instance', async () => {
    const { api } = run();

    await api.copy('a', 7);
    expect(api.copiedId.value).toBe(7);

    vi.advanceTimersByTime(1500);
    expect(api.copiedId.value).toBeNull();
  });

  it('moves straight to a second copy rather than ignoring it', async () => {
    const { api } = run();

    await api.copy('a', 1);
    vi.advanceTimersByTime(1000);
    await api.copy('b', 2);

    expect(writeText).toHaveBeenLastCalledWith('b');
    expect(api.copiedId.value).toBe(2);

    // The timer restarted: 1000ms after the second copy it is still showing.
    vi.advanceTimersByTime(1000);
    expect(api.copied.value).toBe(true);
    vi.advanceTimersByTime(500);
    expect(api.copied.value).toBe(false);
  });

  it('reports a failure, and recovers from it', async () => {
    const { api } = run();
    const reason = new Error('denied');
    writeText.mockRejectedValueOnce(reason);

    expect(await api.copy('a')).toBe(false);
    expect(api.status.value).toBe('error');
    expect(api.error.value).toBe(reason);

    vi.advanceTimersByTime(1500);
    expect(api.status.value).toBe('idle');
    expect(api.error.value).toBeNull();
  });

  it('takes a timeout of its own', async () => {
    const scope = effectScope();
    const api = scope.run(() => useClipboard({ timeout: 300 }))!;

    await api.copy('a');
    vi.advanceTimersByTime(299);
    expect(api.copied.value).toBe(true);
    vi.advanceTimersByTime(1);
    expect(api.copied.value).toBe(false);
  });

  it('resets on request', async () => {
    const { api } = run();

    await api.copy('a', 1);
    api.reset();

    expect(api.status.value).toBe('idle');
    expect(api.copiedId.value).toBeNull();
  });

  it('stops its timer when its scope goes', async () => {
    const { api, scope } = run();

    await api.copy('a');
    scope.stop();
    vi.advanceTimersByTime(1500);

    // Had the timer survived, it would have reset the state.
    expect(api.status.value).toBe('copied');
  });

  it('reports an error outside a secure context', async () => {
    withClipboard(false);
    const { api } = run();

    expect(await api.copy('a')).toBe(false);
    expect(api.status.value).toBe('error');
  });
});

describe('Copy', () => {
  const mountCopy = (props: Record<string, any> = {}, slots: Record<string, any> = {}) =>
    mount(Copy as any, { props: { value: 'secret', ...props }, slots, attachTo: document.body });

  const icons = (wrapper: ReturnType<typeof mountCopy>) => wrapper.findAll('[data-part="copy-icon"]');

  it('copies its value and says so', async () => {
    const wrapper = mountCopy();

    await wrapper.trigger('click');
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith('secret');
    expect(wrapper.attributes('data-copied')).toBe('');
    expect(wrapper.attributes('data-status')).toBe('copied');
    expect(wrapper.emitted('copy')![0]).toEqual([true]);
  });

  it('stops saying so when it is handed another row', async () => {
    const item = ref('a');
    const Row = defineComponent({
      setup() {
        provideRecycle(() => item.value);
        return () => h(Copy, { value: item.value });
      }
    });
    const wrapper = mount(Row, { attachTo: document.body });

    await wrapper.find('[data-part="copy"]').trigger('click');
    await flushPromises();
    expect(wrapper.find('[data-part="copy"]').attributes('data-copied')).toBe('');

    item.value = 'b';
    await flushPromises();

    expect(wrapper.find('[data-part="copy"]').attributes('data-copied')).toBeUndefined();
  });

  it('keeps its click from reaching what it sits in', async () => {
    const outer = vi.fn();
    document.body.addEventListener('click', outer);
    const wrapper = mountCopy();

    await wrapper.trigger('click');
    await flushPromises();
    document.body.removeEventListener('click', outer);

    expect(writeText).toHaveBeenCalledWith('secret');
    expect(outer).not.toHaveBeenCalled();
  });

  it('reports a failure', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const wrapper = mountCopy();

    await wrapper.trigger('click');
    await flushPromises();

    expect(wrapper.attributes('data-status')).toBe('error');
    expect(wrapper.emitted('copy')![0]).toEqual([false]);
  });

  it('names an icon-only button, and leaves a labeled one alone', () => {
    expect(mountCopy().attributes('aria-label')).toBe('Copy');
    expect(mountCopy({ label: 'Copy key' }).attributes('aria-label')).toBeUndefined();
    expect(mountCopy({}, { default: 'Copy key' }).attributes('aria-label')).toBeUndefined();
    expect(mountCopy({ 'aria-label': 'Copy token' }).attributes('aria-label')).toBe('Copy token');
  });

  it('falls back to its own icons when the folder has none', async () => {
    const wrapper = mountCopy();

    expect(icons(wrapper).map((node) => node.attributes('data-name'))).toEqual([undefined, undefined]);
    expect(icons(wrapper)[0]!.attributes('data-active')).toBe('');
    expect(icons(wrapper)[1]!.attributes('data-active')).toBeUndefined();

    await wrapper.trigger('click');
    await flushPromises();

    expect(icons(wrapper)[0]!.attributes('data-active')).toBeUndefined();
    expect(icons(wrapper)[1]!.attributes('data-active')).toBe('');
  });

  it('uses `copy` and `copied` from the icon folder when they are there', () => {
    const svg = () => Promise.resolve('<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>');
    configureIcons({ inline: { './icons/copy.svg': svg, './icons/copied.svg': svg } });

    const wrapper = mountCopy();

    expect(icons(wrapper).map((node) => node.attributes('data-name'))).toEqual(['copy', 'copied']);
  });

  it('takes icons by name, trusting the sprite for one the folder lacks', () => {
    const wrapper = mountCopy({ icon: 'clipboard', copiedIcon: 'tick' });

    expect(wrapper.findAll('use').map((node) => node.attributes('href'))).toEqual([
      '/sprite.svg#clipboard',
      '/sprite.svg#tick'
    ]);
  });

  it('prefers the folder for a named icon it does have', () => {
    const svg = () => Promise.resolve('<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>');
    configureIcons({ inline: { './icons/clipboard.svg': svg } });

    const wrapper = mountCopy({ icon: 'clipboard' });

    // Inline, so no sprite reference for it; the copied icon is still the built-in one.
    expect(wrapper.findAll('use')).toHaveLength(0);
    expect(icons(wrapper)[0]!.attributes('data-name')).toBe('clipboard');
  });

  it('takes an icon of the caller’s own', async () => {
    const wrapper = mountCopy(
      {},
      { icon: `<template #icon="{ copied }"><b class="mine">{{ copied ? 'done' : 'copy' }}</b></template>` }
    );

    expect(wrapper.find('.mine').text()).toBe('copy');
    await wrapper.trigger('click');
    await flushPromises();
    expect(wrapper.find('.mine').text()).toBe('done');
  });

  it('does nothing while disabled', async () => {
    const wrapper = mountCopy({ disabled: true });

    expect(wrapper.attributes('disabled')).toBeDefined();
    (wrapper.element as HTMLButtonElement).click();
    await flushPromises();

    expect(writeText).not.toHaveBeenCalled();
  });

  it('stays off when rendered as something with no `disabled` of its own', async () => {
    // A native button drops the click before any handler sees it; a span does not.
    const wrapper = mountCopy({ disabled: true, as: 'span' });

    await wrapper.trigger('click');
    await flushPromises();

    expect(writeText).not.toHaveBeenCalled();
  });

  it('goes back to idle after its timeout', async () => {
    const wrapper = mountCopy({ timeout: 400 });

    await wrapper.trigger('click');
    await flushPromises();
    vi.advanceTimersByTime(400);
    await flushPromises();

    expect(wrapper.attributes('data-status')).toBe('idle');
    expect(wrapper.attributes('data-copied')).toBeUndefined();
  });
});
