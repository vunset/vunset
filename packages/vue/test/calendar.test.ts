import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import {
  CalendarRoot,
  CalendarPrev,
  CalendarNext,
  CalendarViewTrigger,
  CalendarGrid,
  CalendarRow,
  CalendarWeek,
  CalendarWeekDay,
  CalendarDay,
  CalendarMonth,
  CalendarYear,
  CalendarPresets,
  CalendarPreset,
  formatISO,
} from '../src';

/** A Wednesday, and deliberately not near a month boundary. */
const TODAY = '2026-09-23';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 8, 23, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

function mountCalendar(props: Record<string, any> = {}) {
  const Host = defineComponent({
    setup() {
      return () =>
        h(CalendarRoot as any, { class: 'calendar', ...props }, {
          default: () => [
            h(CalendarPrev as any, { class: 'prev' }, { default: () => 'prev' }),
            h(CalendarViewTrigger as any, { value: 'month', class: 'month-trigger' }),
            h(CalendarViewTrigger as any, { value: 'year', class: 'year-trigger' }),
            h(CalendarNext as any, { class: 'next' }, { default: () => 'next' }),
            h(CalendarGrid as any, { class: 'grid' }, {
              default: (slot: any) => {
                if (slot.view === 'day') {
                  return [
                    h(CalendarRow as any, { class: 'week-days' }, {
                      default: () =>
                        slot.weekDays.map((day: any) =>
                          h(CalendarWeekDay as any, { key: day.index, value: day.index }),
                        ),
                    }),
                    ...slot.weeks.map((week: Date[], index: number) =>
                      h(CalendarRow as any, { key: index, class: 'week' }, {
                        default: () =>
                          week.map((date) =>
                            h(CalendarDay as any, { key: date.getTime(), value: date }),
                          ),
                      }),
                    ),
                  ];
                }

                if (slot.view === 'month') {
                  return slot.months.map((_: string, index: number) =>
                    h(CalendarMonth as any, { key: index, value: index }),
                  );
                }

                return slot.years.map((year: number) =>
                  h(CalendarYear as any, { key: year, value: year }),
                );
              },
            }),
            h(CalendarPresets as any, { class: 'presets' }, {
              default: (slot: any) =>
                slot.presets.map((preset: any) =>
                  h(CalendarPreset as any, { key: preset.key, value: preset.key }),
                ),
            }),
          ],
        });
    },
  });

  return mount(Host, { attachTo: document.body });
}

const day = (wrapper: VueWrapper<any>, iso: string) =>
  wrapper.find(`[data-part="day"][data-value="${iso}"]`);

const days = (wrapper: VueWrapper<any>) => wrapper.findAll('[data-part="day"]');

const highlighted = (wrapper: VueWrapper<any>) =>
  wrapper.find('[data-part="day"][data-highlighted]').attributes('data-value');

const emittedValue = (wrapper: VueWrapper<any>, index = 0) => {
  const events = wrapper.findComponent(CalendarRoot).emitted('update:modelValue');
  const value = events?.[index]?.[0] as Date | Date[] | null | undefined;
  return Array.isArray(value) ? value.map((entry) => formatISO(entry)) : formatISO(value ?? null);
};

const emitCount = (wrapper: VueWrapper<any>) =>
  wrapper.findComponent(CalendarRoot).emitted('update:modelValue')?.length ?? 0;

/** The keyboard lives on the grid, so that is where a key is pressed. */
async function press(wrapper: VueWrapper<any>, key: string, modifiers: Record<string, any> = {}) {
  await wrapper.find('.grid').trigger('keydown', { key, ...modifiers });
  await nextTick();
  await nextTick();
}

describe('the month on screen', () => {
  it('opens on today and draws the whole month', () => {
    const wrapper = mountCalendar();

    expect(day(wrapper, '2026-09-01').exists()).toBe(true);
    expect(day(wrapper, '2026-09-30').exists()).toBe(true);
    expect(day(wrapper, TODAY).attributes('data-today')).toBe('');
    expect(wrapper.find('.grid').attributes('aria-label')).toBe('September 2026');
  });

  it('starts the week where its locale does, and elsewhere when told to', () => {
    const first = (props: Record<string, unknown>) =>
      mountCalendar(props).find('[data-part="week-day"]').attributes('aria-label');

    expect(first({ locale: 'en-US' })).toBe('Sunday');
    expect(first({ locale: 'en-GB' })).toBe('Monday');
    expect(first({ locale: 'en-GB', firstDayOfWeek: 0 })).toBe('Sunday');

    const mondayFirst = mountCalendar({ locale: 'en-US', firstDayOfWeek: 1 });

    expect(mondayFirst.findAll('[data-part="week-day"]').map((cell) => cell.text())).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
  });

  it('marks the days either side of the month as outside', () => {
    const wrapper = mountCalendar();

    // September 2026 starts on a Tuesday, so the first row reaches back to the
    // 31st of August.
    expect(day(wrapper, '2026-08-31').attributes('data-outside')).toBe('');
    expect(day(wrapper, '2026-09-01').attributes('data-outside')).toBeUndefined();
  });

  it('keeps its height month to month when asked for fixed weeks', () => {
    expect(mountCalendar({ fixedWeeks: true }).findAll('.week')).toHaveLength(6);
    expect(mountCalendar().findAll('.week').length).toBeLessThan(6);
  });

  it('opens on defaultMonth when one is given', () => {
    const wrapper = mountCalendar({ defaultMonth: '2027-02-10' });

    expect(wrapper.find('.grid').attributes('aria-label')).toBe('February 2027');
  });

  it('pages with the arrows', async () => {
    const wrapper = mountCalendar();

    await wrapper.find('.next').trigger('click');
    expect(wrapper.find('.grid').attributes('aria-label')).toBe('October 2026');

    await wrapper.find('.prev').trigger('click');
    await wrapper.find('.prev').trigger('click');
    expect(wrapper.find('.grid').attributes('aria-label')).toBe('August 2026');
  });
});

describe('the tab stop', () => {
  it('is a single cell, on the cursor', () => {
    const wrapper = mountCalendar();
    const tabbable = days(wrapper).filter((cell) => cell.attributes('tabindex') === '0');

    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]!.attributes('data-value')).toBe(TODAY);
  });

  it('starts on the selection rather than on today', () => {
    const wrapper = mountCalendar({ defaultValue: '2026-09-04' });

    expect(highlighted(wrapper)).toBe('2026-09-04');
  });
});

describe('single selection', () => {
  it('emits the day that was pressed', async () => {
    const wrapper = mountCalendar();

    await day(wrapper, '2026-09-15').trigger('click');

    expect(emittedValue(wrapper)).toBe('2026-09-15');
    expect(day(wrapper, '2026-09-15').attributes('data-selected')).toBe('');
    expect(day(wrapper, '2026-09-15').attributes('aria-selected')).toBe('true');
  });

  it('replaces the previous day rather than adding to it', async () => {
    const wrapper = mountCalendar();

    await day(wrapper, '2026-09-15').trigger('click');
    await day(wrapper, '2026-09-16').trigger('click');

    expect(wrapper.findAll('[data-part="day"][data-selected]')).toHaveLength(1);
    expect(emittedValue(wrapper, 1)).toBe('2026-09-16');
  });

  it('follows the month when a trailing day is pressed', async () => {
    const wrapper = mountCalendar();

    await day(wrapper, '2026-08-31').trigger('click');

    expect(wrapper.find('.grid').attributes('aria-label')).toBe('August 2026');
  });
});

describe('range selection', () => {
  it('publishes nothing until both ends are picked', async () => {
    const wrapper = mountCalendar({ mode: 'range' });

    await day(wrapper, '2026-09-10').trigger('click');
    expect(emitCount(wrapper)).toBe(0);
    expect(wrapper.find('.calendar').attributes('data-selecting')).toBe('');

    await day(wrapper, '2026-09-14').trigger('click');
    expect(emittedValue(wrapper)).toEqual(['2026-09-10', '2026-09-14']);
    expect(wrapper.find('.calendar').attributes('data-selecting')).toBeUndefined();
  });

  it('orders the ends however they were picked', async () => {
    const wrapper = mountCalendar({ mode: 'range' });

    await day(wrapper, '2026-09-14').trigger('click');
    await day(wrapper, '2026-09-10').trigger('click');

    expect(emittedValue(wrapper)).toEqual(['2026-09-10', '2026-09-14']);
  });

  it('marks the ends and the days between them', async () => {
    const wrapper = mountCalendar({ mode: 'range' });

    await day(wrapper, '2026-09-10').trigger('click');
    await day(wrapper, '2026-09-13').trigger('click');

    expect(day(wrapper, '2026-09-10').attributes('data-range-start')).toBe('');
    expect(day(wrapper, '2026-09-13').attributes('data-range-end')).toBe('');
    expect(day(wrapper, '2026-09-11').attributes('data-in-range')).toBe('');
    expect(day(wrapper, '2026-09-10').attributes('data-in-range')).toBeUndefined();
    expect(day(wrapper, '2026-09-13').attributes('data-in-range')).toBeUndefined();
  });

  it('draws the range under the pointer before it is committed', async () => {
    const wrapper = mountCalendar({ mode: 'range' });

    await day(wrapper, '2026-09-10').trigger('click');
    await day(wrapper, '2026-09-13').trigger('pointerenter');

    expect(day(wrapper, '2026-09-11').attributes('data-in-range')).toBe('');
    expect(day(wrapper, '2026-09-13').attributes('data-preview')).toBe('');
    // Still nothing published: a hover is not a choice.
    expect(emitCount(wrapper)).toBe(0);

    await wrapper.find('.grid').trigger('pointerleave');
    expect(day(wrapper, '2026-09-11').attributes('data-in-range')).toBeUndefined();
  });

  it('starts a new range on the third press', async () => {
    const wrapper = mountCalendar({ mode: 'range' });

    await day(wrapper, '2026-09-10').trigger('click');
    await day(wrapper, '2026-09-13').trigger('click');
    await day(wrapper, '2026-09-20').trigger('click');

    expect(emitCount(wrapper)).toBe(1);
    expect(wrapper.findAll('[data-part="day"][data-selected]')).toHaveLength(1);
    expect(day(wrapper, '2026-09-20').attributes('data-selected')).toBe('');
  });

  it('closes a half-drawn range onto the same day', async () => {
    const wrapper = mountCalendar({ mode: 'range' });

    await day(wrapper, '2026-09-10').trigger('click');
    wrapper.findComponent(CalendarRoot).vm.completeRange();
    await nextTick();

    expect(emittedValue(wrapper)).toEqual(['2026-09-10', '2026-09-10']);
  });

  it('leaves a finished range alone when completed', async () => {
    const wrapper = mountCalendar({ mode: 'range' });

    await day(wrapper, '2026-09-10').trigger('click');
    await day(wrapper, '2026-09-13').trigger('click');
    wrapper.findComponent(CalendarRoot).vm.completeRange();
    await nextTick();

    expect(emitCount(wrapper)).toBe(1);
  });
});

describe('multiple selection', () => {
  it('adds and removes days, keeping them in order', async () => {
    const wrapper = mountCalendar({ mode: 'multiple' });

    await day(wrapper, '2026-09-15').trigger('click');
    await day(wrapper, '2026-09-10').trigger('click');

    expect(emittedValue(wrapper, 1)).toEqual(['2026-09-10', '2026-09-15']);

    await day(wrapper, '2026-09-15').trigger('click');

    expect(emittedValue(wrapper, 2)).toEqual(['2026-09-10']);
  });
});

describe('bounds', () => {
  it('rules out the days outside them without taking them off the keyboard', async () => {
    const wrapper = mountCalendar({ min: '2026-09-10', max: '2026-09-20' });

    const early = day(wrapper, '2026-09-09');
    expect(early.attributes('aria-disabled')).toBe('true');
    expect(early.attributes('data-disabled')).toBe('');
    // Never the native attribute: a disabled button cannot be focused, and the
    // grid's one tab stop has to be able to rest anywhere.
    expect(early.attributes('disabled')).toBeUndefined();

    await early.trigger('click');
    expect(emitCount(wrapper)).toBe(0);
  });

  it('stops the arrows at the edge of the range', () => {
    const wrapper = mountCalendar({ min: '2026-09-01', max: '2026-09-30' });

    expect(wrapper.find('.prev').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.next').attributes('disabled')).toBeDefined();
  });

  it('leaves an arrow alone while part of the next page is reachable', () => {
    const wrapper = mountCalendar({ min: '2026-08-20' });

    expect(wrapper.find('.prev').attributes('disabled')).toBeUndefined();
  });

  it('rules out individual days and whatever the predicate says', async () => {
    const wrapper = mountCalendar({
      disabledDates: ['2026-09-15'],
      isDateDisabled: (date: Date) => date.getDay() === 0,
    });

    expect(day(wrapper, '2026-09-15').attributes('data-disabled')).toBe('');
    // The 20th of September 2026 is a Sunday.
    expect(day(wrapper, '2026-09-20').attributes('data-disabled')).toBe('');
    expect(day(wrapper, '2026-09-16').attributes('data-disabled')).toBeUndefined();

    await day(wrapper, '2026-09-15').trigger('click');
    expect(emitCount(wrapper)).toBe(0);
  });
});

describe('the keyboard', () => {
  it('moves by a day, a week, and a month', async () => {
    const wrapper = mountCalendar();

    await press(wrapper, 'ArrowRight');
    expect(highlighted(wrapper)).toBe('2026-09-24');

    await press(wrapper, 'ArrowDown');
    expect(highlighted(wrapper)).toBe('2026-10-01');

    await press(wrapper, 'ArrowUp');
    await press(wrapper, 'ArrowLeft');
    expect(highlighted(wrapper)).toBe(TODAY);

    await press(wrapper, 'PageDown');
    expect(wrapper.find('.grid').attributes('aria-label')).toBe('October 2026');

    await press(wrapper, 'PageUp', { shiftKey: true });
    expect(wrapper.find('.grid').attributes('aria-label')).toBe('October 2025');
  });

  it('goes to the ends of the week', async () => {
    const wrapper = mountCalendar({ firstDayOfWeek: 1 });

    await press(wrapper, 'Home');
    expect(highlighted(wrapper)).toBe('2026-09-21');

    await press(wrapper, 'End');
    expect(highlighted(wrapper)).toBe('2026-09-27');
  });

  it('takes focus with it, across the month boundary', async () => {
    const wrapper = mountCalendar();

    (day(wrapper, TODAY).element as HTMLElement).focus();
    await press(wrapper, 'ArrowDown');

    expect(document.activeElement?.getAttribute('data-value')).toBe('2026-09-30');

    await press(wrapper, 'ArrowDown');

    expect(wrapper.find('.grid').attributes('aria-label')).toBe('October 2026');
    expect(document.activeElement?.getAttribute('data-value')).toBe('2026-10-07');
  });

  it('will not walk past the bounds', async () => {
    const wrapper = mountCalendar({ min: TODAY, max: TODAY });

    await press(wrapper, 'ArrowLeft');
    await press(wrapper, 'ArrowDown');

    expect(highlighted(wrapper)).toBe(TODAY);
  });

  it('leaves keys it does not use to whatever is above it', async () => {
    const wrapper = mountCalendar();
    await wrapper.find('.grid').trigger('keydown', { key: 'Escape' });

    expect(highlighted(wrapper)).toBe(TODAY);
  });
});

describe('the month and year views', () => {
  it('drills down and comes back', async () => {
    const wrapper = mountCalendar();

    expect(wrapper.find('.month-trigger').text()).toBe('September');
    expect(wrapper.find('.year-trigger').text()).toBe('2026');

    await wrapper.find('.month-trigger').trigger('click');

    expect(wrapper.find('.grid').attributes('data-view')).toBe('month');
    expect(wrapper.find('.month-trigger').attributes('aria-expanded')).toBe('true');
    expect(wrapper.findAll('[data-part="month"]')).toHaveLength(12);

    await wrapper.find('.month-trigger').trigger('click');
    expect(wrapper.find('.grid').attributes('data-view')).toBe('day');
  });

  it('shows the month that was picked, back in the day view', async () => {
    const wrapper = mountCalendar();

    await wrapper.find('.month-trigger').trigger('click');
    await wrapper.findAll('[data-part="month"]')[1]!.trigger('click');

    expect(wrapper.find('.grid').attributes('data-view')).toBe('day');
    expect(wrapper.find('.grid').attributes('aria-label')).toBe('February 2026');
  });

  it('pages years twelve at a time, on a stable page', async () => {
    const wrapper = mountCalendar();

    await wrapper.find('.year-trigger').trigger('click');

    const years = wrapper.findAll('[data-part="year"]').map((cell) => cell.text());
    expect(years).toHaveLength(12);
    expect(years[0]).toBe('2016');
    expect(years[11]).toBe('2027');

    await wrapper.find('.next').trigger('click');
    expect(wrapper.findAll('[data-part="year"]')[0]!.text()).toBe('2028');
  });

  it('rules out a year the bounds cannot reach', async () => {
    const wrapper = mountCalendar({ min: '2026-01-01' });

    await wrapper.find('.year-trigger').trigger('click');
    const cells = wrapper.findAll('[data-part="year"]');

    expect(cells[0]!.attributes('data-disabled')).toBe('');
    expect(cells[10]!.attributes('data-disabled')).toBeUndefined();
  });

  it('rules out a month the bounds cannot reach', async () => {
    const wrapper = mountCalendar({ min: '2026-06-01' });

    await wrapper.find('.month-trigger').trigger('click');
    const cells = wrapper.findAll('[data-part="month"]');

    expect(cells[4]!.attributes('data-disabled')).toBe('');
    expect(cells[5]!.attributes('data-disabled')).toBeUndefined();
  });

  it('stops the arrows at the edge of a year page', async () => {
    const wrapper = mountCalendar({ min: '2016-01-01' });

    await wrapper.find('.year-trigger').trigger('click');

    // The page is 2016–2027; everything behind it is out of reach.
    expect(wrapper.find('.prev').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.next').attributes('disabled')).toBeUndefined();
  });

  it('counts in months and years while those views are up', async () => {
    const wrapper = mountCalendar();

    await wrapper.find('.month-trigger').trigger('click');
    await press(wrapper, 'ArrowDown');

    expect(wrapper.findAll('[data-part="month"][data-highlighted]')[0]!.text()).toBe('December');
  });
});

describe('presets', () => {
  it('offers the six rolling ranges by default', () => {
    const wrapper = mountCalendar({ mode: 'range' });

    expect(wrapper.findAll('[data-part="preset"]').map((button) => button.text())).toEqual([
      'Today',
      'Yesterday',
      'Last 7 Days',
      'Last 30 Days',
      'This Month',
      'Last Month',
    ]);
  });

  it('applies one as a range', async () => {
    const wrapper = mountCalendar({ mode: 'range' });

    await wrapper.find('[data-part="preset"][data-value="last-7"]').trigger('click');

    expect(emittedValue(wrapper)).toEqual(['2026-09-16', '2026-09-22']);
  });

  it('follows includeToday', async () => {
    const wrapper = mountCalendar({ mode: 'range', includeToday: true });

    await wrapper.find('[data-part="preset"][data-value="last-7"]').trigger('click');

    expect(emittedValue(wrapper)).toEqual(['2026-09-17', TODAY]);
  });

  it('clamps what it applies into the bounds', async () => {
    const wrapper = mountCalendar({ mode: 'range', max: '2026-09-20' });

    await wrapper.find('[data-part="preset"][data-value="this-month"]').trigger('click');

    expect(emittedValue(wrapper)).toEqual(['2026-09-01', '2026-09-20']);
  });

  it('rules out a preset the bounds put entirely out of reach', async () => {
    const wrapper = mountCalendar({ mode: 'range', min: '2026-09-01' });
    const lastMonth = wrapper.find('[data-part="preset"][data-value="last-month"]');

    expect(lastMonth.attributes('disabled')).toBeDefined();

    await lastMonth.trigger('click');
    expect(emitCount(wrapper)).toBe(0);
  });

  it('rules out a quarter that has not started, but not a custom range ahead', async () => {
    const wrapper = mountCalendar({
      mode: 'range',
      presets: ['q3', 'q4', { key: 'next-sprint', range: () => ['2026-10-05', '2026-10-16'] }]
    });
    const preset = (key: string) => wrapper.find(`[data-part="preset"][data-value="${key}"]`);

    expect(preset('q3').attributes('disabled')).toBeUndefined();
    expect(preset('q4').attributes('disabled')).toBeDefined();
    expect(preset('q4').attributes('data-disabled')).toBeDefined();
    expect(preset('next-sprint').attributes('disabled')).toBeUndefined();

    await preset('q4').trigger('click');
    expect(emitCount(wrapper)).toBe(0);

    await preset('q3').trigger('click');
    expect(emittedValue(wrapper)).toEqual(['2026-07-01', '2026-09-30']);
  });

  it('takes a list of its own, custom ranges included', async () => {
    const wrapper = mountCalendar({
      mode: 'range',
      presets: [
        'this-year',
        { key: 'sprint', label: 'This Sprint', range: () => ['2026-09-07', '2026-09-18'] },
      ],
    });

    const buttons = wrapper.findAll('[data-part="preset"]');
    expect(buttons.map((button) => button.text())).toEqual(['This Year', 'This Sprint']);

    await buttons[1]!.trigger('click');
    expect(emittedValue(wrapper)).toEqual(['2026-09-07', '2026-09-18']);
  });

  it('takes the start of the range in single mode', async () => {
    const wrapper = mountCalendar({ presets: ['last-7'] });

    await wrapper.find('[data-part="preset"]').trigger('click');

    expect(emittedValue(wrapper)).toBe('2026-09-16');
  });

  it('skips a key it does not know that has no range of its own', () => {
    const wrapper = mountCalendar({ presets: [{ key: 'mystery' }] });

    expect(wrapper.findAll('[data-part="preset"]')).toHaveLength(0);
  });
});

describe('max-today, preset and the value modifiers', () => {
  const raw = (wrapper: VueWrapper<any>, index = 0) =>
    wrapper.findComponent(CalendarRoot).emitted('update:modelValue')?.[index]?.[0];

  it('max-today rules out every day after today, and keeps an earlier max', () => {
    const wrapper = mountCalendar({ maxToday: true });
    expect(day(wrapper, TODAY).attributes('data-disabled')).toBeUndefined();
    expect(day(wrapper, '2026-09-24').attributes('data-disabled')).toBe('');
    wrapper.unmount();

    const earlier = mountCalendar({ maxToday: true, max: '2026-09-20' });
    expect(day(earlier, '2026-09-21').attributes('data-disabled')).toBe('');
  });

  it('.iso emits YYYY-MM-DD, one day or each end', async () => {
    const wrapper = mountCalendar({ modelModifiers: { iso: true } });
    await day(wrapper, '2026-09-10').trigger('click');
    expect(raw(wrapper)).toBe('2026-09-10');
    wrapper.unmount();

    const range = mountCalendar({ mode: 'range', modelModifiers: { iso: true } });
    await day(range, '2026-09-10').trigger('click');
    await day(range, '2026-09-12').trigger('click');
    expect(raw(range)).toEqual(['2026-09-10', '2026-09-12']);
  });

  it('.iso.safe steps today back while the UTC day has not started', async () => {
    vi.spyOn(Date.prototype, 'getUTCDate').mockImplementation(function (this: Date) {
      return this.getDate() - 1;
    });
    const wrapper = mountCalendar({ modelModifiers: { iso: true, safe: true } });
    await day(wrapper, TODAY).trigger('click');
    expect(raw(wrapper)).toBe('2026-09-22');
    vi.restoreAllMocks();
  });

  it('a preset is the starting value while uncontrolled, emitting nothing', () => {
    const wrapper = mountCalendar({ preset: 'yesterday' });
    expect(day(wrapper, '2026-09-22').attributes('data-selected')).toBe('');
    expect(emitCount(wrapper)).toBe(0);
  });

  it('a preset fills an empty v-model, through its modifiers', async () => {
    const wrapper = mountCalendar({ mode: 'range', preset: 'last-7', modelValue: [], modelModifiers: { iso: true } });
    await nextTick();
    expect(raw(wrapper)).toEqual(['2026-09-16', '2026-09-22']);
  });
});

describe('disabled and read-only', () => {
  it('turns everything off when disabled', async () => {
    const wrapper = mountCalendar({ disabled: true });

    expect(wrapper.find('.calendar').attributes('data-disabled')).toBe('');
    expect(wrapper.find('.prev').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.next').attributes('disabled')).toBeDefined();
    expect(day(wrapper, TODAY).attributes('aria-disabled')).toBe('true');

    await day(wrapper, '2026-09-15').trigger('click');
    expect(emitCount(wrapper)).toBe(0);
  });

  it('still reads and walks when read-only', async () => {
    const wrapper = mountCalendar({ readOnly: true });

    expect(wrapper.find('.grid').attributes('aria-readonly')).toBe('true');
    expect(day(wrapper, TODAY).attributes('aria-disabled')).toBeUndefined();

    await press(wrapper, 'ArrowRight');
    expect(highlighted(wrapper)).toBe('2026-09-24');

    await day(wrapper, '2026-09-15').trigger('click');
    expect(emitCount(wrapper)).toBe(0);
  });
});

describe('a controlled value', () => {
  it('only moves when the value it was given moves', async () => {
    const wrapper = mountCalendar({ modelValue: '2026-09-10' });

    expect(day(wrapper, '2026-09-10').attributes('data-selected')).toBe('');

    await day(wrapper, '2026-09-15').trigger('click');

    expect(emittedValue(wrapper)).toBe('2026-09-15');
    // The parent ignored the event, so nothing on screen moved.
    expect(day(wrapper, '2026-09-10').attributes('data-selected')).toBe('');
    expect(day(wrapper, '2026-09-15').attributes('data-selected')).toBeUndefined();
  });

  it('pulls a range draft back when the owner ignores the commit', async () => {
    const wrapper = mountCalendar({ mode: 'range', modelValue: ['2026-09-10', '2026-09-14'] });

    await day(wrapper, '2026-09-20').trigger('click');
    await day(wrapper, '2026-09-25').trigger('click');

    expect(emittedValue(wrapper)).toEqual(['2026-09-20', '2026-09-25']);
    // Nothing agreed to that range, so nothing on screen draws it.
    expect(wrapper.find('[data-part="day"][data-range-start]').attributes('data-value')).toBe(
      '2026-09-10',
    );
    expect(day(wrapper, '2026-09-20').attributes('data-selected')).toBeUndefined();
  });

  it('parses whatever shape the value arrives in', () => {
    const wrapper = mountCalendar({ mode: 'range', modelValue: ['2026-09-10', new Date(2026, 8, 18).getTime()] });

    expect(wrapper.find('[data-part="day"][data-range-start]').attributes('data-value')).toBe(
      '2026-09-10',
    );
    expect(wrapper.findAll('[data-part="day"][data-selected]')).toHaveLength(2);
  });
});

describe('cells that render their own list', () => {
  /** The grid as an app writes it: rows and cells with classes, no arrays, no views. */
  function mountLists(props: Record<string, any> = {}, slots: { month?: (state: any) => any } = {}) {
    const Host = defineComponent({
      setup: () => () =>
        h(CalendarRoot as any, { class: 'calendar', ...props }, {
          default: () => [
            h(CalendarViewTrigger as any, { value: 'month', class: 'month-trigger' }),
            h(CalendarViewTrigger as any, { value: 'year', class: 'year-trigger' }),
            h(CalendarGrid as any, { class: 'grid' }, {
              default: () => [
                h(CalendarRow as any, { view: 'day', class: 'week-days' }, () => h(CalendarWeekDay as any, { class: 'wd' })),
                h(CalendarWeek as any, { class: 'week' }, () => h(CalendarDay as any, { class: 'd' })),
                h(CalendarRow as any, { view: 'month', class: 'months' }, () =>
                  h(CalendarMonth as any, { class: 'm' }, slots.month ? { default: slots.month } : undefined),
                ),
                h(CalendarRow as any, { view: 'year', class: 'years' }, () => h(CalendarYear as any, { class: 'y' })),
              ],
            }),
            h(CalendarPresets as any, { class: 'presets' }, () => h(CalendarPreset as any, { class: 'p' })),
          ],
        }),
    });
    return mount(Host, { attachTo: document.body });
  }

  const texts = (wrapper: VueWrapper<any>, selector: string) => wrapper.findAll(selector).map((el) => el.text());

  it('draws the day view as the hand-built grid does, with a class on every row and cell', () => {
    const built = mountCalendar();
    const wrapper = mountLists();

    expect(texts(wrapper, '.week-days .wd')).toEqual(texts(built, '[data-part="week-day"]'));
    expect(texts(wrapper, '.week .d')).toEqual(texts(built, '[data-part="day"]'));
    expect(wrapper.findAll('.week')).toHaveLength(built.findAll('.week').length);
    expect(wrapper.findAll('.week').every((row) => row.findAll('.d').length === 7)).toBe(true);
    expect(wrapper.find('.week').attributes('role')).toBe('row');
    expect(wrapper.find('.months').exists()).toBe(false);
    expect(wrapper.find('.years').exists()).toBe(false);

    built.unmount();
    wrapper.unmount();
  });

  it('shows only the row of the view on screen', async () => {
    const wrapper = mountLists();

    await wrapper.find('.month-trigger').trigger('click');
    expect(wrapper.findAll('.months .m')).toHaveLength(12);
    expect(wrapper.find('.week-days').exists()).toBe(false);
    expect(wrapper.find('.week').exists()).toBe(false);

    await wrapper.find('.year-trigger').trigger('click');
    expect(wrapper.findAll('.years .y')).toHaveLength(12);
    expect(wrapper.find('.months').exists()).toBe(false);

    wrapper.unmount();
  });

  it('picks a day, and moves by keyboard, like a hand-built grid', async () => {
    const wrapper = mountLists();

    await day(wrapper, '2026-09-10').trigger('click');
    expect(emittedValue(wrapper)).toBe('2026-09-10');

    await press(wrapper, 'ArrowRight');
    expect(highlighted(wrapper)).toBe('2026-09-11');

    wrapper.unmount();
  });

  it("gives each cell's slot that cell's state", async () => {
    const wrapper = mountLists({}, { month: (state: any) => state.label.slice(0, 3) });

    await wrapper.find('.month-trigger').trigger('click');
    expect(texts(wrapper, '.months .m').slice(0, 3)).toEqual(['Jan', 'Feb', 'Mar']);

    wrapper.unmount();
  });

  it('renders every preset', () => {
    const wrapper = mountLists({ presets: ['today', 'last-7'] });

    expect(texts(wrapper, '.presets .p')).toEqual(['Today', 'Last 7 Days']);

    wrapper.unmount();
  });

  it('warns about a day without a value outside a week', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(
      defineComponent({
        setup: () => () => h(CalendarRoot as any, null, () => h(CalendarGrid as any, null, () => h(CalendarDay as any))),
      }),
    );

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[CalendarDay]'));
    expect(wrapper.find('[data-part="day"]').exists()).toBe(false);

    warn.mockRestore();
    wrapper.unmount();
  });
});
