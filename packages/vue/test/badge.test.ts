import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Badge } from '../src';

function mountBadge(props: Record<string, any> = {}, slots?: any) {
  return mount(Badge as any, {
    props,
    slots: slots ?? { default: () => 'New' },
    attachTo: document.body,
  });
}

describe('Badge', () => {
  it('renders its content in a span', () => {
    const w = mountBadge();
    expect(w.element.tagName).toBe('SPAN');
    expect(w.text()).toBe('New');
  });

  it('keeps `as` out of its attributes', () => {
    const w = mountBadge({ as: 'a' });
    expect(w.attributes()).not.toHaveProperty('data-as');
  });

  it('decides no look: size and variant stay the caller’s', () => {
    const w = mountBadge();
    expect(w.attributes('data-part')).toBe('badge');
    expect(w.attributes('data-size')).toBeUndefined();
    expect(w.attributes('data-variant')).toBeUndefined();
  });

  it('passes the caller’s own hooks straight through', () => {
    const w = mountBadge({ 'data-size': '2xl', 'data-variant': 'ghost' });
    expect(w.attributes('data-size')).toBe('2xl');
    expect(w.attributes('data-variant')).toBe('ghost');
  });

  it('renders a different tag when asked', () => {
    const w = mountBadge({ as: 'div' });
    expect(w.element.tagName).toBe('DIV');
  });

  it('claims no role: it is text, not a control', () => {
    // What a badge means is in its words. A role would only make a screen
    // reader announce furniture around them.
    const w = mountBadge();
    expect(w.attributes('role')).toBeUndefined();
  });

  it('lets the caller add to it', () => {
    const w = mount(Badge as any, {
      attrs: { class: 'Badge Badge--danger', 'aria-label': '3 unread messages' },
      slots: { default: () => '3' },
      attachTo: document.body,
    });

    expect(w.classes()).toContain('Badge--danger');
    expect(w.attributes('aria-label')).toBe('3 unread messages');
    // The caller's additions never cost it its own hooks.
    expect(w.attributes('data-part')).toBe('badge');
  });
});
