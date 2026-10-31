import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { AppDotMatrix, AppSpinner, APP_DOT_MATRIX_VARIANTS } from '../src';

let wrapper: VueWrapper<any> | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('AppSpinner', () => {
  it('is ui’s spinner icon, hidden from assistive technology unless labeled', () => {
    wrapper = mount(AppSpinner as any);
    expect(wrapper.classes()).toContain('app-spinner');
    expect(wrapper.attributes('data-name')).toBe('spinner');
    expect(wrapper.attributes('aria-hidden')).toBe('true');

    wrapper.unmount();
    wrapper = mount(AppSpinner as any, { props: { label: 'Loading orders' } });
    expect(wrapper.attributes('aria-label')).toBe('Loading orders');
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-hidden')).toBeUndefined();
  });
});

describe('AppDotMatrix', () => {
  const dots = () => wrapper!.findAll('.app-dot-matrix > span');

  it('draws 25 dots, each starting on the pattern’s own beat', () => {
    wrapper = mount(AppDotMatrix as any, { props: { variant: 'waves', shape: 'square' } });

    expect(wrapper.attributes('data-variant')).toBe('waves');
    expect(wrapper.attributes('data-shape')).toBe('square');
    expect(dots()).toHaveLength(25);
    expect(dots()[0]!.attributes('style')).toContain('animation-delay: -0.35s');
    expect(dots()[12]!.attributes('style')).toContain('animation-delay: 0s');
    expect(wrapper.attributes('style')).toContain('--app-dot-matrix-keyframes: app-dot-matrix-wave');
    expect(wrapper.attributes('style')).toContain('--app-dot-matrix-duration: 0.65s');
  });

  it('gives each DNA column its phase and each row its delay', () => {
    wrapper = mount(AppDotMatrix as any, { props: { variant: 'dna' } });
    expect(dots()[4]!.attributes('style')).toContain('--app-dot-matrix-phase: 1');
    expect(dots()[7]!.attributes('style')).toContain('--app-dot-matrix-phase: 0.5');
    expect(dots()[7]!.attributes('style')).toContain('animation-delay: 0.12s');
  });

  it('sends one dot round each ring of orbit, the center sitting out', () => {
    wrapper = mount(AppDotMatrix as any, { props: { variant: 'orbit' } });
    const delay = (index: number) => Number(/animation-delay: (-?[\d.]+)s/.exec(dots()[index]!.attributes('style') ?? '')?.[1]);

    expect(dots()[12]!.attributes('data-rest')).toBe('true');
    // The outer ring clockwise from the corner, a tenth of a second apart.
    expect([delay(0), delay(1), delay(4), delay(9)]).toEqual([-1.6, -1.5, -1.2, -1.1]);
    // The inner ring the other way: down the left first.
    expect(delay(11)).toBeLessThan(delay(7));
    expect(dots().filter((dot) => dot.attributes('data-rest'))).toHaveLength(1);
  });

  it('beats only the dots of the heart, the rest sitting out', () => {
    wrapper = mount(AppDotMatrix as any, { props: { variant: 'heart' } });
    const resting = dots().map((dot, index) => (dot.attributes('data-rest') ? index : -1)).filter((index) => index >= 0);

    expect(resting).toEqual([0, 2, 4, 15, 19, 20, 21, 23, 24]);
    expect(wrapper.attributes('style')).toContain('--app-dot-matrix-keyframes: app-dot-matrix-beat');
  });

  it('picks a random pattern once mounted, and the same one on the server every time', async () => {
    wrapper = mount(AppDotMatrix as any);
    expect(APP_DOT_MATRIX_VARIANTS).toContain(wrapper.attributes('data-variant'));

    const html = await renderToString(createSSRApp({ render: () => h(AppDotMatrix as any) }));
    expect(html).toContain('data-variant="spiral"');
  });

  it('is hidden from assistive technology unless labeled', () => {
    wrapper = mount(AppDotMatrix as any);
    expect(wrapper.attributes('aria-hidden')).toBe('true');

    wrapper.unmount();
    wrapper = mount(AppDotMatrix as any, { props: { label: 'Loading' } });
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('Loading');
    expect(wrapper.attributes('aria-hidden')).toBeUndefined();
  });
});
