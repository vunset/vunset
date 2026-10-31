import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressValue,
  ProgressLabel,
  MeterRoot,
  MeterTrack,
  MeterIndicator,
} from '../src';

function mountGauge(root: any, props: Record<string, any>, parts: any[] = []) {
  const Host = defineComponent({
    setup() {
      return () =>
        h(root, props, {
          default: () =>
            parts.length > 0
              ? parts
              : [h(ProgressTrack as any, null, { default: () => h(ProgressIndicator as any) })],
        });
    },
  });
  return mount(Host, { attachTo: document.body });
}

const gauge = () => document.querySelector<HTMLElement>('[data-part="gauge"]')!;
const indicator = () => document.querySelector<HTMLElement>('[data-part="indicator"]')!;
const cssVar = (name: string) => gauge().style.getPropertyValue(name);

describe('Progress and Meter', () => {
  describe('what each one claims', () => {
    it('announces a task as a progress bar', () => {
      mountGauge(ProgressRoot, { value: 40 });
      expect(gauge().getAttribute('role')).toBe('progressbar');
      expect(gauge().getAttribute('data-status')).toBe('progressing');
    });

    it('announces a reading as a meter', () => {
      mountGauge(MeterRoot, { value: 40 });
      expect(gauge().getAttribute('role')).toBe('meter');
    });

    it('reports the range and the value either way', () => {
      mountGauge(MeterRoot, { value: 3, min: 0, max: 7 });
      expect(gauge().getAttribute('aria-valuemin')).toBe('0');
      expect(gauge().getAttribute('aria-valuemax')).toBe('7');
      expect(gauge().getAttribute('aria-valuenow')).toBe('3');
    });

    it('completes, which only a task can do', () => {
      mountGauge(ProgressRoot, { value: 100 });
      expect(gauge().getAttribute('data-status')).toBe('complete');

      document.body.innerHTML = '';
      // A full meter is still just a reading at the top of its range.
      mountGauge(MeterRoot, { value: 100 });
      expect(gauge().getAttribute('data-status')).toBe('progressing');
    });
  });

  describe('indeterminate', () => {
    it('reports no number at all, rather than zero', async () => {
      // Zero would have a screen reader announce a value that is not true;
      // the missing `aria-valuenow` is what says "working, no number yet".
      const w = mountGauge(ProgressRoot, { value: null });

      expect(gauge().getAttribute('data-status')).toBe('indeterminate');
      expect(gauge().getAttribute('aria-valuenow')).toBeNull();
      expect(gauge().getAttribute('aria-valuetext')).toBe('indeterminate');
      expect(cssVar('--gauge-percentage')).toBe('');

      await w.setProps({});
    });

    it('draws nothing, so a stylesheet animates instead of filling', () => {
      mountGauge(ProgressRoot, { value: null });
      // The variable is absent rather than 0%, so `var(…, …)` fallbacks apply.
      expect(cssVar('--gauge-percentage')).toBe('');
      expect(indicator().getAttribute('data-status')).toBe('indeterminate');
    });

    it('is not a state a meter can be in', () => {
      // A meter always has a reading; a missing one reads at the bottom.
      mountGauge(MeterRoot, { value: Number.NaN, min: 10, max: 20 });
      expect(gauge().getAttribute('data-status')).toBe('progressing');
      expect(gauge().getAttribute('aria-valuenow')).toBe('10');
    });
  });

  describe('the percentage', () => {
    it('is published as a length for CSS to draw with', () => {
      mountGauge(ProgressRoot, { value: 40 });
      expect(cssVar('--gauge-percentage')).toBe('40%');
      expect(cssVar('--gauge-value')).toBe('40');
      expect(cssVar('--gauge-min')).toBe('0');
      expect(cssVar('--gauge-max')).toBe('100');
    });

    it('is measured across the range it was given', () => {
      mountGauge(MeterRoot, { value: 30, min: 20, max: 40 });
      expect(cssVar('--gauge-percentage')).toBe('50%');
    });

    it('sets no width of its own', () => {
      // Left to the stylesheet, which is what lets the same reading be a bar,
      // a ring or a column.
      mountGauge(ProgressRoot, { value: 40 });
      expect(indicator().style.width).toBe('');
    });

    it('clamps a value from outside the range', () => {
      mountGauge(MeterRoot, { value: 500, min: 0, max: 50 });
      expect(gauge().getAttribute('aria-valuenow')).toBe('50');
      expect(cssVar('--gauge-percentage')).toBe('100%');

      document.body.innerHTML = '';
      mountGauge(MeterRoot, { value: -5, min: 0, max: 50 });
      expect(gauge().getAttribute('aria-valuenow')).toBe('0');
    });

    it('survives a range with no width', () => {
      mountGauge(MeterRoot, { value: 5, min: 5, max: 5 });
      expect(cssVar('--gauge-percentage')).toBe('0%');
    });
  });

  describe('the readout', () => {
    it('shows the value and leaves the announcing to the root', () => {
      mountGauge(ProgressRoot, { value: 40 }, [h(ProgressValue as any)]);
      const value = document.querySelector<HTMLElement>('[data-part="value"]')!;

      expect(value.textContent).toBe('40');
      // Said once: the root already carries it in `aria-valuetext`.
      expect(value.getAttribute('aria-hidden')).toBe('true');
    });

    it('formats through Intl when asked', () => {
      mountGauge(
        MeterRoot,
        { value: 1500, max: 4000, format: { style: 'currency', currency: 'EUR' }, locale: 'de-DE' },
        [h(ProgressValue as any)],
      );

      const text = document.querySelector('[data-part="value"]')!.textContent!;
      expect(text).toContain('1.500');
      expect(gauge().getAttribute('aria-valuetext')).toBe(text);
    });

    it('takes a sentence for the value text', () => {
      mountGauge(ProgressRoot, {
        value: 3,
        max: 7,
        getValueText: (formatted: string, value: number | null) => `${formatted} of 7 files (${value})`,
      });
      expect(gauge().getAttribute('aria-valuetext')).toBe('3 of 7 files (3)');
    });
  });

  describe('the label', () => {
    it('names the gauge', async () => {
      mountGauge(ProgressRoot, { value: 40 }, [
        h(ProgressLabel as any, null, { default: () => 'Uploading' }),
      ]);
      await nextTick();
      const label = document.querySelector<HTMLElement>('[data-part="label"]')!;

      expect(gauge().getAttribute('aria-labelledby')).toBe(label.id);
      expect(label.textContent).toBe('Uploading');
    });

    it('claims no name when there is no label', () => {
      mountGauge(ProgressRoot, { value: 40 });
      expect(gauge().getAttribute('aria-labelledby')).toBeNull();
    });

    it('keeps an id the caller chose', async () => {
      mountGauge(ProgressRoot, { value: 40 }, [h(ProgressLabel as any, { id: 'upload-label' })]);
      await nextTick();
      expect(gauge().getAttribute('aria-labelledby')).toBe('upload-label');
    });
  });

  describe('the parts', () => {
    it('are the same components under either root', () => {
      // A track is a track. Only the roots differ, because only the roots make
      // a claim about what the number means.
      mountGauge(MeterRoot, { value: 40 }, [
        h(MeterTrack as any, null, { default: () => h(MeterIndicator as any) }),
      ]);
      expect(document.querySelector('[data-part="track"]')).not.toBeNull();
      expect(indicator().getAttribute('data-status')).toBe('progressing');
    });

    it('say where they belong when used outside a root', () => {
      expect(() => mount(ProgressTrack as any)).toThrow(/Gauge/);
      expect(() => mount(MeterTrack as any)).toThrow(/Gauge/);
    });
  });
});
