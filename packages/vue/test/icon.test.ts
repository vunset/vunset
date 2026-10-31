import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Icon, configureIcons, registerDefaultIcons, hasIcon } from '../src';

const STAR = '<svg viewBox="0 0 16 16" width="16" height="16">\n<path fill="#ff0" d="M8 0z"/>\n</svg>';

function mountIcon(props: Record<string, any>, attrs: Record<string, any> = {}) {
  return mount(Icon as any, { props, attrs, attachTo: document.body });
}

/** Configuration is module-level, so each test states the whole of it. */
beforeEach(() => {
  configureIcons({
    sprite: '/sprite.svg',
    inline: {
      './icons/star.svg': async () => STAR,
      './icons/bolt.svg': async () => '<svg><path fill="none" stroke="#f00" d="M0 0"/></svg>',
    },
  });
});

describe('Icon', () => {
  describe('from the sprite', () => {
    it('points a use at the symbol', () => {
      const w = mountIcon({ name: 'check' });
      expect(w.element.tagName).toBe('svg');
      expect(w.find('use').attributes('href')).toBe('/sprite.svg#check');
    });

    it('follows the configured sprite', () => {
      configureIcons({ sprite: '/assets/icons.svg' });
      const w = mountIcon({ name: 'check' });
      expect(w.find('use').attributes('href')).toBe('/assets/icons.svg#check');
    });

    it('takes an override for one icon', () => {
      const w = mountIcon({ name: 'logo', sprite: '/brand.svg' });
      expect(w.find('use').attributes('href')).toBe('/brand.svg#logo');
    });

    it('follows a name that changes', async () => {
      const w = mountIcon({ name: 'check' });
      await w.setProps({ name: 'bell' });
      expect(w.find('use').attributes('href')).toBe('/sprite.svg#bell');
    });
  });

  describe('from the folder', () => {
    it('is the svg itself, with no wrapper around it', async () => {
      // The same element the sprite branch renders, so one rule sizes both.
      const w = mountIcon({ name: 'star', inline: true });
      await nextTick();
      await nextTick();

      expect(w.element.tagName).toBe('svg');
      expect(w.element.namespaceURI).toBe('http://www.w3.org/2000/svg');
      expect(w.find('path').exists()).toBe(true);
      expect(w.find('path').element.namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    it('keeps the viewBox and drops the size the file shipped with', async () => {
      const w = mountIcon({ name: 'star', inline: true });
      await nextTick();
      await nextTick();

      expect(w.attributes('viewBox')).toBe('0 0 16 16');
      expect(w.attributes('width')).toBeUndefined();
      expect(w.attributes('height')).toBeUndefined();
    });

    it('paints it with the text color', async () => {
      const w = mountIcon({ name: 'star', inline: true });
      await nextTick();
      await nextTick();

      expect(w.find('path').attributes('fill')).toBe('currentColor');
    });

    it('leaves an explicit none alone', async () => {
      // `fill="none"` is a shape saying it is not filled, not a color.
      const w = mountIcon({ name: 'bolt', inline: true });
      await nextTick();
      await nextTick();

      expect(w.find('path').attributes('fill')).toBe('none');
    });

    it('lets the caller overrule what the file says', async () => {
      // The file's root attributes are a starting point, not the last word:
      // hooks beat them, and the caller beats everything.
      const w = mountIcon({ name: 'star', inline: true }, { viewBox: '0 0 32 32' });
      await nextTick();
      await nextTick();

      expect(w.attributes('viewBox')).toBe('0 0 32 32');
    });

    it('says so when the file holds no svg at all', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      configureIcons({ inline: { './icons/broken.svg': async () => '<!-- empty -->' } });

      const w = mountIcon({ name: 'broken', inline: true });
      await nextTick();
      await nextTick();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('no <svg>'));
      expect(w.element.children.length).toBe(0);
      warn.mockRestore();
    });

    it('reads each file once, however many icons use it', async () => {
      const read = vi.fn(async () => STAR);
      configureIcons({ inline: { './icons/star.svg': read } });

      const icons = Array.from({ length: 50 }, () => mountIcon({ name: 'star', inline: true }));
      await flushPromises();

      expect(read).toHaveBeenCalledTimes(1);
      expect(icons.every((w) => w.find('path').exists())).toBe(true);
    });

    it('draws a file another icon already loaded in its first render', async () => {
      mountIcon({ name: 'star', inline: true });
      await flushPromises();

      // A table row mounting later: no empty svg first, no second render.
      const w = mountIcon({ name: 'star', inline: true });
      expect(w.find('path').exists()).toBe(true);
    });

    it('tries a failed read again', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const read = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(STAR);
      configureIcons({ inline: { './icons/star.svg': read } });

      mountIcon({ name: 'star', inline: true });
      await flushPromises();
      const w = mountIcon({ name: 'star', inline: true });
      await flushPromises();

      expect(read).toHaveBeenCalledTimes(2);
      expect(w.find('path').exists()).toBe(true);
      warn.mockRestore();
    });

    it('reloads when the name changes', async () => {
      const w = mountIcon({ name: 'star', inline: true });
      await nextTick();
      await nextTick();
      expect(w.find('path').attributes('fill')).toBe('currentColor');

      await w.setProps({ name: 'bolt' });
      await nextTick();
      await nextTick();
      expect(w.find('path').attributes('fill')).toBe('none');
    });

    it('lets only the newest load land', async () => {
      // A slow first icon must not arrive after a fast second one and replace
      // it, which is what a name changed mid-flight would otherwise do.
      let releaseSlow: (value: string) => void = () => {};
      configureIcons({
        inline: {
          './icons/slow.svg': () => new Promise<string>((resolve) => {
            releaseSlow = resolve;
          }),
          './icons/fast.svg': async () => '<svg><path d="fast"/></svg>',
        },
      });

      const w = mountIcon({ name: 'slow', inline: true });
      await w.setProps({ name: 'fast' });
      await nextTick();
      await nextTick();

      releaseSlow('<svg><path d="slow"/></svg>');
      await nextTick();
      await nextTick();

      expect(w.find('path').attributes('d')).toBe('fast');
    });

    it('matches the whole filename, not a piece of the path', async () => {
      // `star` must not pick up `starburst`, and a folder in between must not
      // stop it finding `star` either.
      configureIcons({
        inline: {
          './icons/starburst.svg': async () => '<svg><path d="burst"/></svg>',
          './icons/outline/star.svg': async () => '<svg><path d="star"/></svg>',
        },
      });

      const w = mountIcon({ name: 'star', inline: true });
      await nextTick();
      await nextTick();

      expect(w.find('path').attributes('d')).toBe('star');
    });

    it('says which icon is missing rather than rendering nothing in silence', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const w = mountIcon({ name: 'nope', inline: true });
      await nextTick();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining("'nope'"));
      // An empty svg rather than nothing: it holds the space the icon would
      // have taken, so a name that resolves later does not shift the layout.
      expect(w.element.tagName).toBe('svg');
      expect(w.element.children.length).toBe(0);
      warn.mockRestore();
    });
  });

  describe('defaults under the app', () => {
    const CLOSE = '<svg viewBox="0 0 16 16"><path d="M4 4l8 8"/></svg>';

    beforeEach(() => registerDefaultIcons({ close: CLOSE, star: '<svg viewBox="0 0 1 1"><circle r="1"/></svg>' }));

    it('draws a default in the same render, before anything has loaded', () => {
      const w = mountIcon({ name: 'close', inline: true });
      expect(w.find('path').attributes('d')).toBe('M4 4l8 8');
      expect(w.attributes('viewBox')).toBe('0 0 16 16');
    });

    it('lets the app’s file win over a default of the same name', async () => {
      const w = mountIcon({ name: 'star', inline: true });
      await flushPromises();
      expect(w.find('path').exists()).toBe(true);
      expect(w.find('circle').exists()).toBe(false);
    });

    it('keeps the defaults when the app reconfigures, and a later default replaces an earlier', () => {
      configureIcons({ inline: {} });
      registerDefaultIcons({ close: '<svg><rect/></svg>' });
      const w = mountIcon({ name: 'close', inline: true });
      expect(w.find('rect').exists()).toBe(true);
    });

    it('says whether a name resolves in either layer, without asking the sprite', () => {
      expect(hasIcon('close')).toBe(true);
      expect(hasIcon('bolt')).toBe(true);
      expect(hasIcon('rocket')).toBe(false);
    });
  });

  describe('semantics', () => {
    it('is decoration unless it is given a name', () => {
      const w = mountIcon({ name: 'check' });
      expect(w.attributes('aria-hidden')).toBe('true');
      expect(w.attributes('role')).toBeUndefined();
      expect(w.attributes('data-part')).toBe('icon');
      expect(w.attributes('data-name')).toBe('check');
    });

    it('becomes an image once it carries one', () => {
      const w = mountIcon({ name: 'check' }, { 'aria-label': 'Verified' });
      expect(w.attributes('role')).toBe('img');
      expect(w.attributes('aria-hidden')).toBeUndefined();
    });

    it('counts a reference as a name too', () => {
      const w = mountIcon({ name: 'check' }, { 'aria-labelledby': 'heading' });
      expect(w.attributes('role')).toBe('img');
      expect(w.attributes('aria-hidden')).toBeUndefined();
    });

    it('keeps the caller’s class', () => {
      const w = mountIcon({ name: 'check' }, { class: 'Icon' });
      expect(w.classes()).toContain('Icon');
      expect(w.attributes('data-part')).toBe('icon');
    });
  });
});
