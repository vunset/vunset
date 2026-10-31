import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h } from 'vue';
import { AppButton } from '../src';

// Vue drops an event no later than the millisecond its listener was attached in;
// a click straight after mounting can land in that millisecond. A user's can't.
const later = () => new Promise((resolve) => setTimeout(resolve, 2));

let wrapper: VueWrapper | undefined;

function mountButton(
  props: Record<string, unknown> = {},
  attrs: Record<string, unknown> = {},
  slots: Record<string, any> = {}
) {
  wrapper = mount(AppButton as any, {
    props,
    attrs,
    slots: { default: () => 'Save', ...slots },
    attachTo: document.body
  });
  return wrapper;
}

const button = () => document.querySelector<HTMLElement>('.app-button')!;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('AppButton', () => {
  it('is a non-submitting button with its variant, tone and size as attributes', () => {
    mountButton();

    expect(button().tagName).toBe('BUTTON');
    expect(button().getAttribute('type')).toBe('button');
    expect(button().classList.contains('app-button')).toBe(true);
    expect(button().dataset).toMatchObject({ variant: 'ghost', tone: 'neutral', size: 'md' });
  });

  it('passes its attributes and listeners to the button', async () => {
    const onClick = vi.fn();
    mountButton({}, { 'aria-label': 'Save draft', onClick });

    await later();

    button().click();
    expect(button().getAttribute('aria-label')).toBe('Save draft');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders as a link', () => {
    mountButton({ as: 'a', variant: 'outline' }, { href: '#top' });

    expect(button().tagName).toBe('A');
    expect(button().getAttribute('href')).toBe('#top');
    expect(button().dataset.variant).toBe('outline');
  });

  it('blocks clicks while disabled', async () => {
    const onClick = vi.fn();
    mountButton({ disabled: true }, { onClick });

    await later();

    button().click();
    expect((button() as HTMLButtonElement).disabled).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('marks itself loading, busy and still focusable, and blocks clicks', async () => {
    const onClick = vi.fn();
    mountButton({ loading: true }, { onClick }, { default: () => h('i', { class: 'start' }) });

    await later();

    button().click();
    expect(onClick).not.toHaveBeenCalled();
    expect(button().getAttribute('aria-busy')).toBe('true');
    expect(button().getAttribute('aria-disabled')).toBe('true');
    expect((button() as HTMLButtonElement).disabled).toBe(false);
    expect(button().hasAttribute('data-loading')).toBe(true);
    // No spinner of its own: the stripes are CSS, and what it holds stays.
    expect(button().querySelector('svg')).toBeNull();
    expect(button().querySelector('.start')).not.toBeNull();
  });

  it('marks square for the stylesheet', () => {
    mountButton({ square: true });
    expect(button().hasAttribute('data-square')).toBe(true);
  });

  it('submits when asked', () => {
    mountButton({ type: 'submit', tone: 'accent' });
    expect(button().getAttribute('type')).toBe('submit');
    expect(button().dataset.tone).toBe('accent');
  });
});
