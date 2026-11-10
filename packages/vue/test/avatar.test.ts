import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { AvatarRoot, AvatarImage, AvatarFallback } from '../src';

// jsdom never loads an image: each one the avatar probes is held here, to load or fail by hand.
class FakeImage {
  static made: FakeImage[] = [];
  static cached = new Set<string>();
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin: string | null = null;
  referrerPolicy = '';
  sizes = '';
  srcset = '';
  naturalWidth = 0;
  complete = false;
  #src = '';

  constructor() {
    FakeImage.made.push(this);
  }
  get src() {
    return this.#src;
  }
  set src(value: string) {
    this.#src = value;
    if (FakeImage.cached.has(value)) {
      this.complete = true;
      this.naturalWidth = 40;
    }
  }
  load() {
    this.naturalWidth = 40;
    this.complete = true;
    this.onload?.();
  }
  fail() {
    this.complete = true;
    this.onerror?.();
  }
}

const last = () => FakeImage.made[FakeImage.made.length - 1];
const root = () => document.querySelector<HTMLElement>('[data-part="avatar"]')!;
const image = () => document.querySelector<HTMLImageElement>('img');
const fallback = () => document.querySelector<HTMLElement>('[data-part="fallback"]');

beforeEach(() => {
  FakeImage.made = [];
  FakeImage.cached.clear();
  vi.stubGlobal('Image', FakeImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  document.body.innerHTML = '';
});

function mountAvatar(
  options: { src?: string | null; rootProps?: Record<string, any>; imageProps?: Record<string, any> } = {}
) {
  const src = ref<string | null | undefined>(options.src === undefined ? '/ada.png' : options.src);
  const statuses: string[] = [];
  const Host = defineComponent({
    setup() {
      return () =>
        h(
          AvatarRoot as any,
          { ...options.rootProps, onStatusChange: (status: string) => statuses.push(status) },
          {
            default: () => [
              src.value === null ? null : h(AvatarImage as any, { src: src.value, alt: 'Ada', ...options.imageProps }),
              h(AvatarFallback as any, null, { default: ({ status }: { status: string }) => `AL ${status}` })
            ]
          }
        );
    }
  });
  const wrapper = mount(Host, { attachTo: document.body });
  return { wrapper, src, statuses };
}

describe('Avatar', () => {
  it('shows the fallback while the image loads, then the image alone', async () => {
    mountAvatar();
    await nextTick();
    expect(root().getAttribute('data-status')).toBe('loading');
    expect(image()).toBeNull();
    expect(fallback()?.textContent).toBe('AL loading');

    last().load();
    await nextTick();
    expect(root().getAttribute('data-status')).toBe('loaded');
    expect(image()?.getAttribute('src')).toBe('/ada.png');
    expect(image()?.getAttribute('alt')).toBe('Ada');
    expect(image()?.getAttribute('data-part')).toBe('image');
    expect(fallback()).toBeNull();
  });

  it('keeps the fallback when the image fails, never showing a broken one', async () => {
    mountAvatar();
    await nextTick();
    last().fail();
    await nextTick();
    expect(root().getAttribute('data-status')).toBe('error');
    expect(image()).toBeNull();
    expect(fallback()?.getAttribute('data-status')).toBe('error');
  });

  it('shows a cached image at once', async () => {
    FakeImage.cached.add('/ada.png');
    mountAvatar();
    await nextTick();
    expect(image()).not.toBeNull();
    expect(fallback()).toBeNull();
  });

  it('is idle with no image, and fails an empty source without loading it', async () => {
    const { src } = mountAvatar({ src: null });
    await nextTick();
    expect(root().getAttribute('data-status')).toBe('idle');
    expect(fallback()).not.toBeNull();

    src.value = '';
    await nextTick();
    expect(root().getAttribute('data-status')).toBe('error');
    expect(FakeImage.made).toHaveLength(0);
  });

  it('loads again when the source changes', async () => {
    const { src } = mountAvatar();
    await nextTick();
    last().load();
    await nextTick();

    src.value = '/grace.png';
    await nextTick();
    expect(FakeImage.made).toHaveLength(2);
    expect(root().getAttribute('data-status')).toBe('loading');
    expect(image()).toBeNull();

    // The first image arriving late doesn't count for the second.
    FakeImage.made[0].onload?.();
    await nextTick();
    expect(root().getAttribute('data-status')).toBe('loading');

    last().load();
    await nextTick();
    expect(image()?.getAttribute('src')).toBe('/grace.png');
  });

  it('probes with the same attributes the image renders with', async () => {
    mountAvatar({
      imageProps: { srcset: '/ada@2x.png 2x', sizes: '40px', crossorigin: 'anonymous', referrerpolicy: 'no-referrer' }
    });
    await nextTick();
    expect(last()).toMatchObject({
      src: '/ada.png',
      srcset: '/ada@2x.png 2x',
      sizes: '40px',
      crossOrigin: 'anonymous',
      referrerPolicy: 'no-referrer'
    });

    last().load();
    await nextTick();
    expect(image()?.getAttribute('srcset')).toBe('/ada@2x.png 2x');
    expect(image()?.getAttribute('crossorigin')).toBe('anonymous');
  });

  it('holds the fallback back for `delay`', async () => {
    vi.useFakeTimers();
    mountAvatar({ rootProps: { delay: 300 } });
    await nextTick();
    expect(fallback()).toBeNull();

    vi.advanceTimersByTime(300);
    await nextTick();
    expect(fallback()).not.toBeNull();
  });

  it('never shows the fallback when the image beats the delay', async () => {
    vi.useFakeTimers();
    mountAvatar({ rootProps: { delay: 300 } });
    await nextTick();
    last().load();
    await nextTick();
    vi.advanceTimersByTime(300);
    await nextTick();
    expect(fallback()).toBeNull();
    expect(image()).not.toBeNull();
  });

  it('reports each status change', async () => {
    const { statuses } = mountAvatar();
    await nextTick();
    last().fail();
    await nextTick();
    expect(statuses).toEqual(['loading', 'error']);
  });

  it('goes back to idle when the image is removed', async () => {
    const { src } = mountAvatar();
    await nextTick();
    last().load();
    await nextTick();

    src.value = null;
    await nextTick();
    expect(root().getAttribute('data-status')).toBe('idle');
    expect(fallback()).not.toBeNull();
  });

  it('renders a span by default and takes `as`', async () => {
    mountAvatar({ rootProps: { as: 'div' } });
    await nextTick();
    expect(root().tagName).toBe('DIV');
    expect(fallback()?.tagName).toBe('SPAN');
  });
});
