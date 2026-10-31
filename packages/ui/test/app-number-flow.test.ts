import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { AppNumberFlow } from '../src';

let wrapper: VueWrapper<any> | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

// Test utils stubs TransitionGroup by default, which would hide its classes.
const mountFlow = (props: Record<string, unknown>) =>
  (wrapper = mount(AppNumberFlow as any, {
    props,
    attachTo: document.body,
    global: { stubs: { 'transition-group': false } }
  }));

const chars = () => [...document.querySelectorAll<HTMLElement>('.app-number-flow-char')];
const live = () => chars().filter((el) => !el.classList.contains('app-number-flow-leave-active'));

describe('AppNumberFlow', () => {
  it('renders a span per character, staggered by position', () => {
    mountFlow({ value: '$1 204' });

    expect(chars().map((el) => el.textContent)).toEqual(['$', '1', ' ', '2', '0', '4']);
    expect(chars()[3]!.style.getPropertyValue('--app-number-flow-index')).toBe('3');
  });

  it('is read once, whole', () => {
    mountFlow({ value: 1204 });

    expect(document.querySelector('.app-number-flow-text')!.textContent).toBe('1204');
    expect(document.querySelector('.app-number-flow-chars')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('enters every character anew when the value changes', async () => {
    const w = mountFlow({ value: 12 });
    const before = chars();

    await w.setProps({ value: 13 });
    await nextTick();

    expect(live().map((el) => el.textContent)).toEqual(['1', '3']);
    expect(live().some((el) => before.includes(el))).toBe(false);
    expect(live().every((el) => el.classList.contains('app-number-flow-enter-from') || el.classList.contains('app-number-flow-enter-active'))).toBe(true);
  });

  it('animates the first value only with appear', () => {
    const first = mountFlow({ value: 7 });
    expect(chars()[0]!.classList.contains('app-number-flow-enter-from')).toBe(false);
    first.unmount();

    mountFlow({ value: 7, appear: true });
    expect(chars()[0]!.classList.contains('app-number-flow-enter-from')).toBe(true);
  });
});
