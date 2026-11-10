import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, effectScope, h, nextTick, ref, type Ref } from 'vue';
import { useMediaQuery } from '../src';

// jsdom has no matchMedia: a fake whose answers the test sets.
const answers = new Map<string, boolean>();
const lists = new Map<string, Set<(event: MediaQueryListEvent) => void>>();

function listeners(query: string) {
  if (!lists.has(query)) lists.set(query, new Set());
  return lists.get(query)!;
}

function change(query: string, matches: boolean) {
  answers.set(query, matches);
  for (const listener of listeners(query)) listener({ matches, media: query } as MediaQueryListEvent);
}

beforeEach(() => {
  window.matchMedia = ((query: string) => ({
    media: query,
    get matches() {
      return answers.get(query) ?? false;
    },
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners(query).add(listener),
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners(query).delete(listener)
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  answers.clear();
  lists.clear();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

const NARROW = '(max-width: 1024px)';
const WIDE = '(min-width: 1025px)';

describe('useMediaQuery', () => {
  it('reads the query straight away outside a component', () => {
    answers.set(NARROW, true);
    const scope = effectScope();
    const matches = scope.run(() => useMediaQuery(NARROW))!;
    expect(matches.value).toBe(true);
    scope.stop();
  });

  it('follows change events', () => {
    const scope = effectScope();
    const matches = scope.run(() => useMediaQuery(NARROW))!;
    expect(matches.value).toBe(false);
    change(NARROW, true);
    expect(matches.value).toBe(true);
    change(NARROW, false);
    expect(matches.value).toBe(false);
    scope.stop();
  });

  it('moves to a new query when it changes', async () => {
    answers.set(WIDE, true);
    const query = ref(NARROW);
    const scope = effectScope();
    const matches = scope.run(() => useMediaQuery(query))!;
    expect(matches.value).toBe(false);

    query.value = WIDE;
    await nextTick();
    expect(matches.value).toBe(true);
    expect(listeners(NARROW).size).toBe(0);
    expect(listeners(WIDE).size).toBe(1);
    scope.stop();
  });

  it('stops listening when its scope is disposed', () => {
    const scope = effectScope();
    const matches = scope.run(() => useMediaQuery(NARROW))!;
    expect(listeners(NARROW).size).toBe(1);
    scope.stop();
    expect(listeners(NARROW).size).toBe(0);
    change(NARROW, true);
    expect(matches.value).toBe(false);
  });

  it('holds ssrValue in a component until it mounts', async () => {
    answers.set(NARROW, false);
    const seen: boolean[] = [];
    let matches!: Readonly<Ref<boolean>>;
    const wrapper = mount(
      defineComponent({
        setup() {
          matches = useMediaQuery(NARROW, { ssrValue: true });
          seen.push(matches.value);
          return () => h('span', String(matches.value));
        }
      })
    );
    expect(seen).toEqual([true]);
    await nextTick();
    expect(matches.value).toBe(false);
    expect(wrapper.text()).toBe('false');
    wrapper.unmount();
    expect(listeners(NARROW).size).toBe(0);
  });

  it('keeps ssrValue where there is no matchMedia', () => {
    delete (window as { matchMedia?: unknown }).matchMedia;
    const scope = effectScope();
    const matches = scope.run(() => useMediaQuery(NARROW, { ssrValue: true }))!;
    expect(matches.value).toBe(true);
    scope.stop();
  });
});
