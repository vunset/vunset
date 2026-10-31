import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { CalendarRoot, CalendarGrid, CalendarWeek, CalendarDay, FieldRoot, FieldLabel, FieldDescription } from '../src';

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

const calendarParts = () =>
  h(CalendarGrid as any, null, {
    default: () => h(CalendarWeek as any, null, { default: () => h(CalendarDay as any) })
  });

function mountCalendar(props: Record<string, unknown> = {}) {
  wrapper = mount(CalendarRoot as any, { props, slots: { default: calendarParts }, attachTo: document.body });
  return wrapper;
}

function mountInField(fieldProps: Record<string, unknown> = {}, calendarProps: Record<string, unknown> = {}) {
  wrapper = mount(FieldRoot as any, {
    props: fieldProps,
    slots: {
      default: () => [
        h(FieldLabel as any, { as: 'div' }, { default: () => 'Arrival' }),
        h(CalendarRoot as any, calendarProps, { default: calendarParts }),
        h(FieldDescription as any, null, { default: () => 'Check-in from 3pm' })
      ]
    },
    attachTo: document.body
  });
  return wrapper;
}

const root = () => document.querySelector<HTMLElement>('[data-part="calendar"]')!;
const day = (iso: string) => document.querySelector<HTMLElement>(`[data-part="day"][data-value="${iso}"]`)!;
const hidden = () =>
  [...document.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map((input) => [
    input.name,
    input.value,
    input.getAttribute('form')
  ]);

describe('Calendar in a form', () => {
  describe('hidden inputs', () => {
    it('submits a single day as YYYY-MM-DD', () => {
      mountCalendar({ name: 'arrival', defaultValue: new Date(2026, 8, 3) });
      expect(hidden()).toEqual([['arrival', '2026-09-03', null]]);
    });

    it('submits nothing without a name', () => {
      mountCalendar({ defaultValue: new Date(2026, 8, 3) });
      expect(hidden()).toEqual([]);
    });

    it('submits a range once both ends are picked', async () => {
      mountCalendar({ name: 'stay', mode: 'range' });

      day('2026-09-10').click();
      await nextTick();
      expect(hidden()).toEqual([]);

      day('2026-09-05').click();
      await nextTick();
      expect(hidden().map(([, value]) => value)).toEqual(['2026-09-05', '2026-09-10']);
    });

    it('submits every day of a multiple selection, in date order, with form', () => {
      mountCalendar({
        name: 'days',
        form: 'booking',
        mode: 'multiple',
        defaultValue: [new Date(2026, 8, 20), new Date(2026, 8, 4)]
      });
      expect(hidden()).toEqual([
        ['days', '2026-09-04', 'booking'],
        ['days', '2026-09-20', 'booking']
      ]);
    });
  });

  describe('state', () => {
    it('marks itself required and invalid', () => {
      mountCalendar({ required: true, invalid: true });
      expect(root().hasAttribute('data-required')).toBe(true);
      expect(root().hasAttribute('data-invalid')).toBe(true);
    });
  });

  describe('inside a field', () => {
    it('is a group labeled and described by the field', async () => {
      mountInField();
      await nextTick();

      const label = [...document.querySelectorAll('[id]')].find((el) => el.textContent === 'Arrival')!;
      expect(root().getAttribute('role')).toBe('group');
      expect(root().getAttribute('aria-labelledby')).toBe(label.id);
      expect(document.getElementById(root().getAttribute('aria-describedby')!)!.textContent).toBe('Check-in from 3pm');
    });

    it("follows the field's state and name", () => {
      mountInField(
        { disabled: true, required: true, invalid: true, name: 'arrival' },
        { defaultValue: new Date(2026, 8, 3) }
      );

      expect(root().hasAttribute('data-disabled')).toBe(true);
      expect(root().getAttribute('aria-required')).toBe('true');
      expect(root().getAttribute('aria-invalid')).toBe('true');
      expect(hidden()).toEqual([['arrival', '2026-09-03', null]]);
    });

    it('reports the field filled and dirty once a day is picked', async () => {
      const w = mountInField();
      const field = () => w.element as HTMLElement;
      expect(field().hasAttribute('data-filled')).toBe(false);

      day('2026-09-12').click();
      await nextTick();
      expect(field().hasAttribute('data-filled')).toBe(true);
      expect(field().hasAttribute('data-dirty')).toBe(true);
    });

    it('marks the field touched when focus leaves the calendar, not between days', async () => {
      const w = mountInField();
      const field = () => w.element as HTMLElement;

      day('2026-09-12').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: day('2026-09-13') }));
      await nextTick();
      expect(field().hasAttribute('data-touched')).toBe(false);

      day('2026-09-13').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
      await nextTick();
      expect(field().hasAttribute('data-touched')).toBe(true);
    });

    it('stays a plain element outside a field', () => {
      mountCalendar();
      expect(root().hasAttribute('role')).toBe(false);
    });
  });

  it('never marks a day autofocus on its own', () => {
    mountCalendar({ defaultValue: new Date(2026, 8, 3) });
    expect(document.querySelector('[autofocus]')).toBeNull();
  });
});
