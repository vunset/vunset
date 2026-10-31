import { describe, it, expect, vi } from 'vitest';
import { defaultLink, configureLink } from '../../vue/src/shared/link';

const NuxtLink = vi.hoisted(() => ({ name: 'NuxtLink' }));

vi.mock('#app', () => ({ defineNuxtPlugin: (plugin: unknown) => plugin }));
vi.mock('#components', () => ({ NuxtLink }));

const { default: plugin } = (await import('../src/runtime/link')) as any;

describe('the link plugin', () => {
  it('makes NuxtLink what the library’s links render as', () => {
    plugin.setup();
    expect(defaultLink()).toBe(NuxtLink);
    configureLink('a');
  });
});
