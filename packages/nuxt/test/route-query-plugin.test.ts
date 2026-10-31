import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { routeQueryKey } from '../../vue/src/shared/route-query';

const nuxt = vi.hoisted(() => ({ navigateTo: vi.fn(), route: null as any }));

vi.mock('#app', () => ({
  defineNuxtPlugin: (plugin: unknown) => plugin,
  navigateTo: nuxt.navigateTo,
  useRouter: () => ({ currentRoute: nuxt.route })
}));

const { default: plugin } = (await import('../src/runtime/route-query')) as any;

describe('the route-query plugin', () => {
  it('reads the query, and writes it by navigating, keeping the rest', () => {
    nuxt.route = ref({ query: { page: '2', sortBy: 'name:asc', tags: ['a', 'b'] } });
    const provide = vi.fn();
    plugin.setup({ vueApp: { provide } });

    const [key, query] = provide.mock.calls[0]!;
    expect(key).toBe(routeQueryKey);
    expect(query.get('sortBy')).toBe('name:asc');
    // A repeated key is no sort.
    expect(query.get('tags')).toBeUndefined();

    query.set('sortBy', 'age:desc');
    expect(nuxt.navigateTo).toHaveBeenLastCalledWith({ query: { page: '2', sortBy: 'age:desc', tags: ['a', 'b'] } });

    query.set('sortBy', undefined);
    expect(nuxt.navigateTo).toHaveBeenLastCalledWith({ query: { page: '2', sortBy: undefined, tags: ['a', 'b'] } });
  });
});
