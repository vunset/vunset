import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { AppAvatar } from '../src';

// jsdom never loads an image: each one probed is held here, to load or fail by hand.
class FakeImage {
  static made: FakeImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  srcset = '';
  sizes = '';
  crossOrigin: string | null = null;
  referrerPolicy = '';
  complete = false;
  naturalWidth = 0;
  constructor() {
    FakeImage.made.push(this);
  }
}

let wrapper: VueWrapper | undefined;
const avatar = () => document.querySelector<HTMLElement>('.app-avatar')!;
const fallback = () => document.querySelector<HTMLElement>('.app-avatar-fallback');
const image = () => document.querySelector<HTMLImageElement>('.app-avatar-image');

async function render(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  wrapper = mount(AppAvatar as any, { props, slots, attachTo: document.body });
  await nextTick();
  return wrapper;
}

async function fail() {
  FakeImage.made.at(-1)!.onerror?.();
  await nextTick();
}

beforeEach(() => {
  FakeImage.made = [];
  vi.stubGlobal('Image', FakeImage);
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  vi.unstubAllGlobals();
});

describe('AppAvatar', () => {
  it("shows the title's initials when its image fails", async () => {
    await render({ src: '/broken.png', title: 'Ada Love', initials: true });
    await fail();
    expect(fallback()?.textContent).toBe('AL');
  });

  it("shows the title's initials with no image at all", async () => {
    await render({ title: 'Ada Love', initials: true });
    expect(fallback()?.textContent).toBe('AL');
    expect(FakeImage.made).toHaveLength(0);
  });

  it('shows the fallback it is given', async () => {
    await render({ fallback: 'AL' });
    expect(fallback()?.textContent).toBe('AL');
  });

  it('shows N/A when nothing else is known', async () => {
    await render({ src: '/broken.png' });
    await fail();
    expect(fallback()?.textContent).toBe('N/A');
  });

  it('keeps the title out of the fallback without `initials`', async () => {
    await render({ title: 'Ada Love' });
    expect(fallback()?.textContent).toBe('N/A');
  });

  it('falls back to `fallback` when the title has no initials to give', async () => {
    await render({ title: '—', initials: true, fallback: '?' });
    expect(fallback()?.textContent).toBe('?');
  });

  it('takes a fallback slot over any text', async () => {
    await render({ title: 'Ada Love', initials: true }, { fallback: ({ status }: { status: string }) => h('i', status) });
    expect(fallback()?.innerHTML).toBe('<i>idle</i>');
  });

  it('shows the image once it loads, read out by its title', async () => {
    await render({ src: '/ada.png', title: 'Ada Love', initials: true });
    FakeImage.made.at(-1)!.onload?.();
    await nextTick();
    expect(image()?.getAttribute('src')).toBe('/ada.png');
    expect(image()?.getAttribute('alt')).toBe('');
    expect(fallback()).toBeNull();
    expect(avatar().getAttribute('role')).toBe('img');
    expect(avatar().getAttribute('aria-label')).toBe('Ada Love');
    expect(avatar().getAttribute('title')).toBe('Ada Love');
  });

  it('is read out by `alt` over `title`, and has no role with neither', async () => {
    await render({ title: 'Ada Love', alt: 'Ada Lovelace, admin', initials: true });
    expect(avatar().getAttribute('aria-label')).toBe('Ada Lovelace, admin');
    expect(fallback()?.getAttribute('aria-hidden')).toBe('true');
    wrapper!.unmount();

    await render({ fallback: 'AL' });
    expect(avatar().getAttribute('role')).toBeNull();
    expect(fallback()?.getAttribute('aria-hidden')).toBeNull();
  });

  it('is md by default and takes size, classes and status events', async () => {
    const w = await render({ src: '/a.png', size: 'lg', class: 'app-avatar-square', fallbackClass: 'mine' });
    expect(avatar().getAttribute('data-size')).toBe('lg');
    expect(avatar().classList.contains('app-avatar-square')).toBe(true);
    expect(fallback()?.classList.contains('mine')).toBe(true);
    await fail();
    expect(w.emitted('statusChange')).toEqual([['loading'], ['error']]);
  });
});
