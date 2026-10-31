import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { AppBadge, AppAlert } from '../src';

// Vue drops an event no later than the millisecond its listener was attached in;
// a click straight after mounting can land in that millisecond. A user's can't.
const later = () => new Promise((resolve) => setTimeout(resolve, 2));

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('AppBadge', () => {
  const badge = () => document.querySelector<HTMLElement>('.app-badge')!;

  function mountBadge(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
    wrapper = mount(AppBadge as any, { props, slots: { default: () => 'New', ...slots }, attachTo: document.body });
    return wrapper;
  }

  it('is a soft neutral span by default', () => {
    mountBadge();
    expect(badge().tagName).toBe('SPAN');
    expect(badge().dataset).toMatchObject({ variant: 'soft', tone: 'neutral', size: 'md' });
    expect(badge().textContent).toBe('New');
  });

  it('takes a variant, tone and size', () => {
    mountBadge({ variant: 'solid', tone: 'success', size: 'sm' });
    expect(badge().dataset).toMatchObject({ variant: 'solid', tone: 'success', size: 'sm' });
  });
});

describe('AppAlert', () => {
  const alert = () => document.querySelector<HTMLElement>('.app-alert')!;

  function mountAlert(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
    wrapper = mount(AppAlert as any, { props, slots, attachTo: document.body });
    return wrapper;
  }

  it('is an alert named by its title and described by its description', async () => {
    mountAlert({ title: 'Saved', description: 'Your changes are live.', tone: 'success' });
    await nextTick();

    expect(alert().getAttribute('role')).toBe('alert');
    expect(document.getElementById(alert().getAttribute('aria-labelledby')!)!.textContent!.trim()).toBe('Saved');
    expect(document.getElementById(alert().getAttribute('aria-describedby')!)!.textContent!.trim()).toBe(
      'Your changes are live.'
    );
    expect(alert().dataset).toMatchObject({ tone: 'success' });
  });

  it('takes the description from the default slot', () => {
    mountAlert({}, { default: () => h('span', 'Slot text') });
    expect(alert().querySelector('.app-alert-description')!.textContent).toBe('Slot text');
    expect(alert().querySelector('.app-alert-title')).toBeNull();
  });

  it('draws an icon per tone, unless told not to or given one', () => {
    mountAlert({ tone: 'danger', title: 'Failed' });
    expect(alert().querySelector('.app-alert-icon svg path')!.getAttribute('d')).toContain('M15 9l-6 6');
    wrapper!.unmount();

    mountAlert({ title: 'Plain', icon: false });
    expect(alert().querySelector('.app-alert-icon')).toBeNull();
    wrapper!.unmount();

    mountAlert({ title: 'Custom' }, { icon: () => h('b', '!') });
    expect(alert().querySelector('.app-alert-icon')!.textContent).toBe('!');
  });

  it('emits close from its close button, named by close-label', async () => {
    const w = mountAlert({ title: 'Heads up', closable: true, closeLabel: 'Hide' });
    const close = alert().querySelector<HTMLElement>('.app-alert-close')!;

    expect(close.getAttribute('aria-label')).toBe('Hide');
    // A real button, so the keyboard reaches it.
    expect(close.tagName).toBe('BUTTON');
    expect(close.getAttribute('type')).toBe('button');
    await later();
    close.click();
    expect(w.emitted('close')).toHaveLength(1);
  });

  it('has no close button unless closable', () => {
    mountAlert({ title: 'Heads up' });
    expect(alert().querySelector('.app-alert-close')).toBeNull();
  });

  it('renders actions under the text', () => {
    mountAlert({ title: 'Update ready' }, { actions: () => h('button', 'Restart') });
    expect(alert().querySelector('.app-alert-actions button')!.textContent).toBe('Restart');
  });

  it('lets the page soften its role', () => {
    wrapper = mount(AppAlert as any, { props: { title: 'Tip' }, attrs: { role: 'status' }, attachTo: document.body });
    expect(alert().getAttribute('role')).toBe('status');
  });
});
