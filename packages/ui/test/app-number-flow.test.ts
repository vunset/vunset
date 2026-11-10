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

    expect(chars().map((el) => el.querySelector('.app-number-flow-sizer')?.textContent ?? el.textContent)).toEqual(['$', '1', ' ', '2', '0', '4']);
    expect(chars()[3]!.style.getPropertyValue('--app-number-flow-index')).toBe('3');
  });

  it('is read once, whole', () => {
    mountFlow({ value: 1204 });

    expect(document.querySelector('.app-number-flow-text')!.textContent).toBe('1204');
    expect(document.querySelector('.app-number-flow-chars')!.getAttribute('aria-hidden')).toBe('true');
  });

  const wheel = (key: number) => [...document.querySelectorAll<HTMLElement>('.app-number-flow-wheel')][key]!;
  const at = (index: number) => Number(wheel(index).style.getPropertyValue('--app-number-flow-at'));

  it('rolls a changed digit on its wheel, keeping the characters that stay', async () => {
    const w = mountFlow({ value: 12 });
    const before = chars();
    expect(at(1)).toBe(12);

    await w.setProps({ value: 15 });
    await nextTick();

    expect(chars()).toEqual(before);
    expect(at(1)).toBe(15);
    expect(wheel(1).hasAttribute('data-rolling')).toBe(true);
    expect(wheel(0).hasAttribute('data-rolling')).toBe(false);
    expect(document.querySelector('.app-number-flow-text')!.textContent).toBe('15');
  });

  it('carries on past 9 as the value grows, then settles where it looks the same', async () => {
    const w = mountFlow({ value: 19 });
    await w.setProps({ value: 20 });
    await nextTick();
    // 9 → 0 one cell up, onto the next run; 1 → 2 one cell up.
    expect(at(1)).toBe(20);
    expect(at(0)).toBe(12);

    wheel(1).dispatchEvent(new Event('transitionend'));
    await nextTick();
    expect(at(1)).toBe(10);
    expect(wheel(1).hasAttribute('data-rolling')).toBe(false);
  });

  it('rolls down as the value shrinks, or the way it is told', async () => {
    const w = mountFlow({ value: 21 });
    await w.setProps({ value: 19 });
    await nextTick();
    // 1 → 9 down, back past 0; 2 → 1 down.
    expect(at(1)).toBe(9);
    expect(at(0)).toBe(11);

    await w.setProps({ value: 18, trend: 1 });
    await nextTick();
    expect(at(1)).toBe(28);
  });

  it('matches digits from the decimal point, so a new place enters', async () => {
    const w = mountFlow({ value: 999 });
    const units = chars().at(-1);
    await w.setProps({ value: 1000, format: { useGrouping: true } });
    await nextTick();
    expect(live().map((el) => el.textContent?.slice(-1))).toEqual(['1', ',', '0', '0', '0']);
    expect(chars().includes(units!)).toBe(true);
    expect(live()[0]!.className).toContain('app-number-flow-enter');
  });

  it('animates text without digits character by character', async () => {
    const w = mountFlow({ value: 'Computing' });
    expect(document.querySelectorAll('.app-number-flow-wheel')).toHaveLength(0);
    await w.setProps({ value: '$1,204.50' });
    await nextTick();
    expect(document.querySelectorAll('.app-number-flow-wheel')).toHaveLength(6);
    expect(document.querySelector('.app-number-flow-text')!.textContent).toBe('$1,204.50');
  });

  it('animates the first value only with appear', () => {
    const first = mountFlow({ value: 7 });
    expect(chars()[0]!.classList.contains('app-number-flow-enter-from')).toBe(false);
    first.unmount();

    mountFlow({ value: 7, appear: true });
    expect(chars()[0]!.classList.contains('app-number-flow-enter-from')).toBe(true);
  });
});
