import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { FormCalendar, FormDatepicker } from '../src';

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

const day = (iso: string) => document.querySelector<HTMLElement>(`[data-part="day"][data-value="${iso}"]`)!;
const label = () => document.querySelector<HTMLElement>('.form-label')!;
const presets = () => [...document.querySelectorAll('.form-calendar-preset')].map((el) => el.textContent?.trim());
const BASE = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'];
const hidden = () => [...document.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map((el) => el.value);

describe('FormCalendar', () => {
  function mountCalendar(props: Record<string, unknown> = {}) {
    wrapper = mount(FormCalendar as any, { props: { label: 'Arrival', ...props }, attachTo: document.body });
    return wrapper;
  }

  it('is a group named by its label', async () => {
    mountCalendar();
    await nextTick();

    const root = document.querySelector('.form-calendar')!;
    expect(root.getAttribute('role')).toBe('group');
    expect(root.getAttribute('aria-labelledby')).toBe(label().id);
    expect(label().tagName).toBe('DIV');
  });

  it('picks a day and submits it under its name', async () => {
    const w = mountCalendar({ name: 'arrival' });
    day('2026-09-12').click();
    await nextTick();

    expect((w.emitted('update:modelValue')![0]![0] as Date).getDate()).toBe(12);
    expect(hidden()).toEqual(['2026-09-12']);
  });

  it('passes max-today, preset and v-model.iso to the calendar', async () => {
    const w = mountCalendar({ mode: 'range', maxToday: true, preset: 'last-7', modelValue: [], modelModifiers: { iso: true } });
    await nextTick();

    expect(w.emitted('update:modelValue')![0]![0]).toEqual(['2026-09-16', '2026-09-22']);
    expect(day('2026-09-24').hasAttribute('data-disabled')).toBe(true);
  });

  it('shows the base presets for a range unless told not to, and the ones given', () => {
    mountCalendar({ mode: 'range' });
    expect(presets()).toEqual(BASE);
    wrapper!.unmount();

    mountCalendar({ mode: 'range', presets: false, withYear: true });
    expect(presets()).toEqual([]);
    wrapper!.unmount();

    mountCalendar();
    expect(presets()).toEqual([]);
    wrapper!.unmount();

    mountCalendar({ mode: 'range', presets: ['today', 'last-7'] });
    expect(presets()).toEqual(['Today', 'Last 7 Days']);
  });

  it('adds this year and the quarters to the presets, once each', () => {
    mountCalendar({ mode: 'range', withYear: true });
    expect(presets()).toEqual([...BASE, 'This Year']);
    wrapper!.unmount();

    mountCalendar({ withQuarters: true });
    expect(presets()).toEqual([...BASE, 'Q1', 'Q2', 'Q3', 'Q4']);
    wrapper!.unmount();

    mountCalendar({ mode: 'range', presets: 'all', withYear: true, withQuarters: true });
    expect(presets()).toEqual([...BASE, 'This Year', 'Q1', 'Q2', 'Q3', 'Q4']);
  });

  it('groups the quarters, the ones yet to start disabled', () => {
    mountCalendar({ mode: 'range', withQuarters: true });
    const group = document.querySelector<HTMLElement>('.form-calendar-quarters')!;
    const quarters = [...group.querySelectorAll<HTMLButtonElement>('.form-calendar-preset')];

    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Quarters');
    expect(quarters.map((el) => el.textContent?.trim())).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
    expect(quarters.map((el) => el.disabled)).toEqual([false, false, false, true]);
  });

  it('is described by its help and error, and marked invalid', async () => {
    mountCalendar({ help: 'Check-in from 3pm', error: 'Pick a day' });
    await nextTick();

    const root = document.querySelector('.form-calendar')!;
    const ids = root.getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual([
      'Check-in from 3pm',
      'Pick a day'
    ]);
    expect(root.hasAttribute('data-invalid')).toBe(true);
  });
});

describe('FormDatepicker', () => {
  function mountDatepicker(props: Record<string, unknown> = {}) {
    wrapper = mount(FormDatepicker as any, {
      props: { label: 'Arrival', placeholder: 'Pick a date', ...props },
      attachTo: document.body
    });
    return wrapper;
  }

  const trigger = () => document.querySelector<HTMLElement>('.form-datepicker-trigger')!;
  const valueText = () => document.querySelector('.form-datepicker-value')!.textContent!.trim();
  const popup = () => document.querySelector('.form-datepicker-popup');

  it('labels the trigger and shows the placeholder', async () => {
    mountDatepicker();
    await nextTick();

    expect((label() as HTMLLabelElement).htmlFor).toBe(trigger().id);
    expect(valueText()).toBe('Pick a date');
  });

  it('opens a calendar, and closes once a day is picked', async () => {
    const w = mountDatepicker({ name: 'arrival' });
    trigger().click();
    await settle();
    expect(popup()).not.toBeNull();

    day('2026-09-15').click();
    await settle();
    expect(popup()).toBeNull();
    expect(valueText()).toBe('Sep 15, 2026');
    expect((w.emitted('update:modelValue')![0]![0] as Date).getDate()).toBe(15);
    expect(hidden()).toEqual(['2026-09-15']);
  });

  it('offers to clear only when clearable', async () => {
    const w = mountDatepicker({ defaultValue: new Date(2026, 8, 3), clearable: true });
    document.querySelector<HTMLElement>('.form-clear')!.click();
    await settle();
    expect(w.emitted('update:modelValue')).toEqual([[null]]);
    w.unmount();

    mountDatepicker({ defaultValue: new Date(2026, 8, 3) });
    expect(document.querySelector('.form-clear')).toBeNull();
  });

  it('writes a range and offers presets in the popup', async () => {
    mountDatepicker({
      mode: 'range',
      presets: ['last-7'],
      defaultValue: [new Date(2026, 8, 3), new Date(2026, 8, 9)]
    });
    expect(valueText()).toBe('Sep 3 – Sep 9, 2026');

    trigger().click();
    await settle();
    expect(presets()).toEqual(['Last 7 Days']);
  });

  it('passes v-model modifiers, max-today and a starting preset through', async () => {
    const w = mountDatepicker({ mode: 'range', modelValue: [], modelModifiers: { iso: true }, preset: 'yesterday', maxToday: true });
    await nextTick();
    expect(w.emitted('update:modelValue')).toEqual([[['2026-09-22', '2026-09-22']]]);

    trigger().click();
    await settle();
    expect(day('2026-09-24').hasAttribute('data-disabled')).toBe(true);
  });

  it('shows a preset group', async () => {
    mountDatepicker({ presets: 'all' });
    trigger().click();
    await settle();
    expect(presets()).toHaveLength(11);
  });

  it('passes the field state to the trigger', async () => {
    mountDatepicker({ required: true, error: 'Pick a date', disabled: true });
    await nextTick();

    expect(trigger().getAttribute('aria-required')).toBe('true');
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
    expect((trigger() as HTMLButtonElement).disabled).toBe(true);
  });
});
