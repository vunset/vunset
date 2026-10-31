import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import {
  DatepickerRoot,
  DatepickerTrigger,
  DatepickerValue,
  DatepickerClear,
  CalendarGrid,
  CalendarWeek,
  CalendarDay,
  CalendarPresets,
  CalendarPreset,
  Portal,
  Positioner,
  Popup,
  FieldRoot,
  FieldLabel,
  FieldDescription
} from '../src';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 8, 23, 12));
});

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  vi.useRealTimers();
});

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const datepicker = (props: Record<string, unknown>, model?: Ref<unknown>) =>
  h(
    DatepickerRoot as any,
    {
      ...props,
      ...(model && { modelValue: model.value, 'onUpdate:modelValue': (next: unknown) => (model.value = next) })
    },
    {
      default: () => [
        h(DatepickerTrigger as any, null, { default: () => h(DatepickerValue as any, { placeholder: 'Pick a date' }) }),
        h(DatepickerClear as any),
        h(Portal as any, null, {
          default: () =>
            h(Positioner as any, null, {
              default: () =>
                h(Popup as any, null, {
                  default: () => [
                    h(CalendarGrid as any, null, {
                      default: () => h(CalendarWeek as any, null, { default: () => h(CalendarDay as any) })
                    }),
                    h(CalendarPresets as any, null, { default: () => h(CalendarPreset as any) })
                  ]
                })
            })
        })
      ]
    }
  );

function mountDatepicker(props: Record<string, unknown> = {}, model?: Ref<unknown>) {
  wrapper = mount(defineComponent({ render: () => datepicker(props, model) }), { attachTo: document.body });
  return wrapper;
}

const trigger = () => document.querySelector<HTMLElement>('[data-part="trigger"]')!;
const valueEl = () => document.querySelector<HTMLElement>('[data-part="value"]')!;
const popup = () => document.querySelector<HTMLElement>('[role="dialog"]');
const day = (iso: string) => document.querySelector<HTMLElement>(`[data-part="day"][data-value="${iso}"]`)!;
const clearButton = () => document.querySelector<HTMLElement>('[data-part="clear"]');
const preset = (label: string) =>
  [...document.querySelectorAll<HTMLElement>('[data-part="preset"]')].find((el) => el.textContent?.trim() === label)!;

async function open() {
  trigger().click();
  await settle();
}

async function pick(iso: string) {
  day(iso).click();
  await settle();
}

describe('Datepicker', () => {
  describe('the text', () => {
    it('shows the placeholder while nothing is picked', () => {
      mountDatepicker();
      expect(valueEl().textContent).toBe('Pick a date');
      expect(valueEl().hasAttribute('data-placeholder')).toBe(true);
    });

    it('writes a single day', () => {
      mountDatepicker({ defaultValue: new Date(2026, 9, 3) });
      expect(valueEl().textContent).toBe('Oct 3, 2026');
      expect(valueEl().hasAttribute('data-placeholder')).toBe(false);
    });

    it('writes a range with the year once, or on both ends', () => {
      mountDatepicker({ mode: 'range', defaultValue: [new Date(2026, 9, 3), new Date(2026, 9, 9)] });
      expect(valueEl().textContent).toBe('Oct 3 – Oct 9, 2026');
      wrapper!.unmount();

      mountDatepicker({ mode: 'range', defaultValue: [new Date(2025, 11, 30), new Date(2026, 0, 2)] });
      expect(valueEl().textContent).toBe('Dec 30, 2025 – Jan 2, 2026');
    });

    it('writes up to two days of a multiple pick, then a count', () => {
      mountDatepicker({ mode: 'multiple', defaultValue: [new Date(2026, 9, 3), new Date(2026, 9, 5)] });
      expect(valueEl().textContent).toBe('Oct 3, 2026, Oct 5, 2026');
      wrapper!.unmount();

      mountDatepicker({
        mode: 'multiple',
        defaultValue: [new Date(2026, 9, 3), new Date(2026, 9, 5), new Date(2026, 9, 7)]
      });
      expect(valueEl().textContent).toBe('3 days');
    });

    it('follows the locale', () => {
      mountDatepicker({ defaultValue: new Date(2026, 9, 3), locale: 'de-DE' });
      expect(valueEl().textContent).toBe('3. Okt. 2026');
    });
  });

  describe('open and close', () => {
    it('opens on a press, with focus on the selected day', async () => {
      mountDatepicker({ defaultValue: new Date(2026, 8, 12) });
      expect(popup()).toBeNull();

      await open();
      expect(popup()).not.toBeNull();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(document.activeElement).toBe(day('2026-09-12'));
    });

    it('starts on today when nothing is picked', async () => {
      mountDatepicker();
      await open();
      expect(document.activeElement).toBe(day('2026-09-23'));
    });

    it('closes once a single day is picked, focus back on the trigger', async () => {
      const model = ref<unknown>(null);
      mountDatepicker({}, model);
      await open();
      await pick('2026-09-15');

      expect((model.value as Date).getDate()).toBe(15);
      expect(popup()).toBeNull();
      expect(document.activeElement).toBe(trigger());
    });

    it('closes a range only once its second end is picked', async () => {
      mountDatepicker({ mode: 'range' });
      await open();

      await pick('2026-09-10');
      expect(popup()).not.toBeNull();
      expect(valueEl().textContent).toBe('Sep 10, 2026 –');

      await pick('2026-09-14');
      expect(popup()).toBeNull();
      expect(valueEl().textContent).toBe('Sep 10 – Sep 14, 2026');
    });

    it('stays open while picking several', async () => {
      mountDatepicker({ mode: 'multiple' });
      await open();
      await pick('2026-09-10');
      await pick('2026-09-11');
      expect(popup()).not.toBeNull();
    });

    it('stays open when close-on-select is off', async () => {
      mountDatepicker({ closeOnSelect: false });
      await open();
      await pick('2026-09-10');
      expect(popup()).not.toBeNull();
    });

    it('closes on a preset that completes the value', async () => {
      const model = ref<unknown>([]);
      mountDatepicker({ mode: 'range' }, model);
      await open();

      preset('Last 7 Days').click();
      await settle();
      expect((model.value as Date[]).length).toBe(2);
      expect(popup()).toBeNull();
    });

    it('completes a half-picked range onto its one day when closed', async () => {
      const model = ref<unknown>([]);
      mountDatepicker({ mode: 'range' }, model);
      await open();
      await pick('2026-09-10');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(popup()).toBeNull();
      expect((model.value as Date[]).map((date) => date.getDate())).toEqual([10, 10]);
    });

    it('opens nothing while disabled or read-only', async () => {
      mountDatepicker({ disabled: true });
      expect((trigger() as HTMLButtonElement).disabled).toBe(true);
      await open();
      expect(popup()).toBeNull();
      wrapper!.unmount();

      mountDatepicker({ readOnly: true, defaultValue: new Date(2026, 8, 3) });
      await open();
      expect(popup()).toBeNull();
      expect(trigger().hasAttribute('data-readonly')).toBe(true);
    });
  });

  describe('v-model modifiers', () => {
    it('.iso writes YYYY-MM-DD, one day or each end', async () => {
      const model = ref<unknown>(null);
      mountDatepicker({ modelModifiers: { iso: true } }, model);
      await open();
      await pick('2026-09-10');
      expect(model.value).toBe('2026-09-10');
      expect(valueEl().textContent?.trim()).toBe('Sep 10, 2026');
      wrapper!.unmount();

      const range = ref<unknown>([]);
      mountDatepicker({ mode: 'range', modelModifiers: { iso: true } }, range);
      await open();
      await pick('2026-09-10');
      await pick('2026-09-12');
      expect(range.value).toEqual(['2026-09-10', '2026-09-12']);
    });

    it('.iso.safe steps today back while the UTC day has not started', async () => {
      vi.spyOn(Date.prototype, 'getUTCDate').mockImplementation(function (this: Date) {
        return this.getDate() - 1;
      });
      const model = ref<unknown>(null);
      mountDatepicker({ modelModifiers: { iso: true, safe: true } }, model);
      await open();

      await pick('2026-09-23');
      expect(model.value).toBe('2026-09-22');
      await open();
      await pick('2026-09-20');
      expect(model.value).toBe('2026-09-20');
      vi.restoreAllMocks();
    });

    it('.safe alone keeps dates', async () => {
      const model = ref<unknown>(null);
      mountDatepicker({ modelModifiers: { safe: true } }, model);
      await open();
      await pick('2026-09-20');
      expect(model.value).toEqual(new Date(2026, 8, 20));
    });
  });

  describe('max-today', () => {
    it('rules out every day after today', async () => {
      mountDatepicker({ maxToday: true });
      await open();
      expect(day('2026-09-23').hasAttribute('data-disabled')).toBe(false);
      expect(day('2026-09-24').hasAttribute('data-disabled')).toBe(true);
    });

    it('keeps an earlier max', async () => {
      mountDatepicker({ maxToday: true, max: new Date(2026, 8, 20) });
      await open();
      expect(day('2026-09-21').hasAttribute('data-disabled')).toBe(true);
    });
  });

  describe('preset', () => {
    it('is the starting value while uncontrolled, emitting nothing', () => {
      const onUpdate = vi.fn();
      mountDatepicker({ preset: 'yesterday', 'onUpdate:modelValue': onUpdate });
      expect(valueEl().textContent?.trim()).toBe('Sep 22, 2026');
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('fills an empty v-model, through its modifiers', async () => {
      const model = ref<unknown>([]);
      mountDatepicker({ mode: 'range', preset: 'last-7', modelModifiers: { iso: true } }, model);
      await nextTick();
      expect(model.value).toEqual(['2026-09-16', '2026-09-22']);
      expect(valueEl().textContent?.trim()).toBe('Sep 16 – Sep 22, 2026');
    });

    it('leaves a v-model that already holds a value', async () => {
      const model = ref<unknown>(new Date(2026, 8, 3));
      mountDatepicker({ preset: 'yesterday' }, model);
      await nextTick();
      expect(model.value).toEqual(new Date(2026, 8, 3));
    });

    it('takes a custom preset from the list, and skips one out of bounds', async () => {
      const model = ref<unknown>(null);
      const presets = [{ key: 'launch', label: 'Launch', range: () => ['2026-09-01', '2026-09-01'] as [string, string] }];
      mountDatepicker({ presets, preset: 'launch' }, model);
      await nextTick();
      expect(model.value).toEqual(new Date(2026, 8, 1));
      wrapper!.unmount();

      const bounded = ref<unknown>(null);
      mountDatepicker({ preset: 'last-month', min: new Date(2026, 8, 10) }, bounded);
      await nextTick();
      expect(bounded.value).toBeNull();
    });
  });

  describe('presets', () => {
    const labels = () => [...document.querySelectorAll('[data-part="preset"]')].map((el) => el.textContent?.trim());
    const BASE = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'];

    it('`base` is the six rolling ranges, `all` adds the year and quarters', async () => {
      mountDatepicker({ presets: 'base' });
      await open();
      expect(labels()).toEqual(BASE);
      wrapper!.unmount();

      mountDatepicker({ presets: 'all' });
      await open();
      expect(labels()).toEqual([...BASE, 'This Year', 'Q1', 'Q2', 'Q3', 'Q4']);
    });

    it('a list shows just those', async () => {
      mountDatepicker({ presets: ['yesterday', 'q3'] });
      await open();
      expect(labels()).toEqual(['Yesterday', 'Q3']);
    });

    it('a list may hold groups, and shows a key listed twice once', async () => {
      mountDatepicker({ presets: ['base', 'this-year', 'all'] });
      await open();
      expect(labels()).toEqual([...BASE, 'This Year', 'Q1', 'Q2', 'Q3', 'Q4']);
    });
  });

  describe('clear', () => {
    it('shows only while there is a value, and empties it', async () => {
      const model = ref<unknown>(new Date(2026, 8, 3));
      mountDatepicker({}, model);

      expect(clearButton()!.getAttribute('aria-label')).toBe('Clear');
      clearButton()!.click();
      await settle();

      expect(model.value).toBeNull();
      expect(clearButton()).toBeNull();
      expect(document.activeElement).toBe(trigger());
    });

    it('is absent while disabled or read-only', () => {
      mountDatepicker({ readOnly: true, defaultValue: new Date(2026, 8, 3) });
      expect(clearButton()).toBeNull();
    });
  });

  describe('forms', () => {
    it('submits the value as hidden inputs', () => {
      mountDatepicker({ name: 'stay', mode: 'range', defaultValue: [new Date(2026, 8, 3), new Date(2026, 8, 5)] });
      expect(
        [...document.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map((input) => input.value)
      ).toEqual(['2026-09-03', '2026-09-05']);
    });
  });

  describe('inside a field', () => {
    function mountInField(fieldProps: Record<string, unknown> = {}) {
      wrapper = mount(FieldRoot as any, {
        props: fieldProps,
        slots: {
          default: () => [
            h(FieldLabel as any, null, { default: () => 'Arrival' }),
            datepicker({ defaultValue: new Date(2026, 8, 3) }),
            h(FieldDescription as any, null, { default: () => 'Check-in from 3pm' })
          ]
        },
        attachTo: document.body
      });
      return wrapper;
    }

    it('is the field control: labeled by the label then its value, and described', async () => {
      mountInField();
      await nextTick();

      const label = document.querySelector('label')!;
      expect(label.htmlFor).toBe(trigger().id);
      expect(trigger().getAttribute('aria-labelledby')).toBe(`${label.id} ${trigger().id}`);
      expect(document.getElementById(trigger().getAttribute('aria-describedby')!)!.textContent).toBe(
        'Check-in from 3pm'
      );
    });

    it('opens from a press on the label, as a button would', async () => {
      mountInField();
      await nextTick();
      document.querySelector('label')!.click();
      await settle();
      expect(popup()).not.toBeNull();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it("follows the field's state", () => {
      mountInField({ required: true, invalid: true, disabled: true });

      expect(trigger().getAttribute('aria-required')).toBe('true');
      expect(trigger().getAttribute('aria-invalid')).toBe('true');
      expect((trigger() as HTMLButtonElement).disabled).toBe(true);
    });

    it('names the popup by the label', async () => {
      mountInField();
      await open();
      expect(popup()!.getAttribute('aria-labelledby')).toBe(document.querySelector('label')!.id);
    });

    it('is touched only once focus has left both the trigger and the popup', async () => {
      const w = mountInField();
      const field = () => w.element as HTMLElement;
      await open();

      trigger().dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: day('2026-09-03') }));
      await nextTick();
      expect(field().hasAttribute('data-touched')).toBe(false);

      day('2026-09-03').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
      await nextTick();
      expect(field().hasAttribute('data-touched')).toBe(true);
    });
  });
});
