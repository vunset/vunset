import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import {
  TimepickerRoot,
  TimepickerInput,
  TimepickerTrigger,
  TimepickerClear,
  TimepickerColumn,
  Portal,
  Positioner,
  Popup,
  FieldRoot,
  FieldLabel
} from '../src';
import { parseTime } from '../src/components/timepicker/use-timepicker';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = '';
});

// A click straight after mount can be dropped (see menubar.test.ts).
const later = () => new Promise((resolve) => setTimeout(resolve, 2));

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

function setup(rootProps: Record<string, unknown> = {}, model: Ref<unknown> = ref(null), field = false) {
  const picker = () =>
    h(
      TimepickerRoot as any,
      {
        modelValue: model.value,
        'onUpdate:modelValue': (value: unknown) => (model.value = value),
        ...rootProps
      },
      {
        default: () => [
          h(TimepickerInput as any),
          h(TimepickerTrigger as any, null, { default: () => 'Pick' }),
          h(TimepickerClear as any),
          h(Portal as any, null, {
            default: () =>
              h(Positioner as any, null, {
                default: () =>
                  h(Popup as any, null, {
                    default: () => ['hour', 'minute', 'second', 'period'].map((unit) => h(TimepickerColumn as any, { unit }))
                  })
              })
          })
        ]
      }
    );

  const Host = defineComponent({
    setup: () => () =>
      field ? h(FieldRoot as any, null, { default: () => [h(FieldLabel as any, null, { default: () => 'Start' }), picker()] }) : picker()
  });

  wrapper = mount(Host, { attachTo: document.body });
  return model;
}

const segment = (unit: string) => document.querySelector<HTMLElement>(`[data-part="segment"][data-unit="${unit}"]`)!;
const column = (unit: string) => document.querySelector<HTMLElement>(`[data-part="column"][data-unit="${unit}"]`);
const option = (unit: string, value: string) => column(unit)!.querySelector<HTMLElement>(`[data-value="${value}"]`)!;
const trigger = () => document.querySelector<HTMLElement>('[data-part="trigger"]')!;
const popup = () => document.querySelector<HTMLElement>('[role="dialog"]');

async function key(el: HTMLElement, name: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
  await nextTick();
}

async function typeInto(el: HTMLElement, digits: string) {
  for (const digit of digits) await key(document.activeElement === el ? el : (document.activeElement as HTMLElement), digit);
}

async function open() {
  await later();
  trigger().click();
  await settle();
}

describe('parseTime', () => {
  it('reads leniently, and rejects what is out of range', () => {
    expect(parseTime('9:5')).toEqual({ hour: 9, minute: 5, second: 0 });
    expect(parseTime('14:30:05')).toEqual({ hour: 14, minute: 30, second: 5 });
    expect(parseTime('25:00')).toBeNull();
    expect(parseTime('12:60')).toBeNull();
    expect(parseTime('abc')).toBeNull();
    expect(parseTime(null)).toBeNull();
  });
});

describe('Timepicker', () => {
  describe('value', () => {
    it('shows an incoming value, padded, and drops seconds it does not show', async () => {
      setup({}, ref('9:5:30'));
      await nextTick();
      expect(segment('hour').textContent).toBe('09');
      expect(segment('minute').textContent).toBe('05');
      expect(segment('second')).toBeNull();
    });

    it('reads an unreadable value as empty, with placeholders', async () => {
      setup({}, ref('25:00'));
      await nextTick();
      expect(segment('hour').textContent).toBe('--');
      expect(segment('hour').hasAttribute('data-placeholder')).toBe(true);
    });

    it('publishes only once every segment is filled, and null once one is emptied', async () => {
      const model = setup();
      segment('hour').focus();
      await typeInto(segment('hour'), '14');
      expect(model.value).toBeNull();
      await typeInto(segment('minute'), '30');
      expect(model.value).toBe('14:30');

      await key(segment('minute'), 'Backspace');
      expect(model.value).toBeNull();
      // The other segment keeps what it shows.
      expect(segment('hour').textContent).toBe('14');
    });

    it('writes HH:mm:ss with seconds, filling 00 for a value without them', async () => {
      const model = setup({ seconds: true }, ref('08:15'));
      await nextTick();
      expect(segment('second').textContent).toBe('00');
      await key(segment('second'), 'ArrowUp');
      expect(model.value).toBe('08:15:01');
    });

    it('replaces what the segments show when v-model changes', async () => {
      const model = setup({}, ref('10:00'));
      await nextTick();
      model.value = '18:45';
      await nextTick();
      expect(segment('hour').textContent).toBe('18');
      expect(segment('minute').textContent).toBe('45');
    });

    it('writes undefined for empty with .optional', async () => {
      const model = setup({ modelModifiers: { optional: true } }, ref('10:00'));
      await nextTick();
      await key(segment('hour'), 'Delete');
      expect(model.value).toBeUndefined();
    });
  });

  describe('typing', () => {
    it('moves on after a digit no second digit could follow', async () => {
      setup();
      segment('hour').focus();
      await typeInto(segment('hour'), '3');
      expect(segment('hour').textContent).toBe('03');
      expect(document.activeElement).toBe(segment('minute'));
    });

    it('waits for a second digit when one could follow', async () => {
      setup();
      segment('hour').focus();
      await typeInto(segment('hour'), '2');
      expect(segment('hour').textContent).toBe('02');
      expect(document.activeElement).toBe(segment('hour'));
      await typeInto(segment('hour'), '3');
      expect(segment('hour').textContent).toBe('23');
      expect(document.activeElement).toBe(segment('minute'));
    });

    it('starts over when the second digit passes the maximum', async () => {
      setup();
      segment('hour').focus();
      await typeInto(segment('hour'), '25');
      expect(segment('hour').textContent).toBe('05');
      expect(document.activeElement).toBe(segment('minute'));
    });

    it('starts afresh after leaving the segment', async () => {
      setup();
      segment('hour').focus();
      await typeInto(segment('hour'), '1');
      segment('minute').focus();
      segment('hour').focus();
      await typeInto(segment('hour'), '2');
      expect(segment('hour').textContent).toBe('02');
    });

    it('keeps focus on the last segment once done', async () => {
      setup();
      segment('minute').focus();
      await typeInto(segment('minute'), '45');
      expect(document.activeElement).toBe(segment('minute'));
    });
  });

  describe('keys', () => {
    it('steps with the arrows, wrapping, and from empty to an end', async () => {
      setup();
      await key(segment('hour'), 'ArrowUp');
      expect(segment('hour').textContent).toBe('00');
      await key(segment('hour'), 'ArrowDown');
      expect(segment('hour').textContent).toBe('23');
      await key(segment('hour'), 'ArrowUp');
      expect(segment('hour').textContent).toBe('00');
      await key(segment('minute'), 'ArrowDown');
      expect(segment('minute').textContent).toBe('59');
    });

    it('steps minutes by ten with PageUp/PageDown, hours by one', async () => {
      setup({}, ref('10:55'));
      await nextTick();
      await key(segment('minute'), 'PageUp');
      expect(segment('minute').textContent).toBe('05');
      await key(segment('hour'), 'PageDown');
      expect(segment('hour').textContent).toBe('09');
    });

    it('goes to the ends with Home/End', async () => {
      setup({}, ref('10:30'));
      await nextTick();
      await key(segment('minute'), 'End');
      expect(segment('minute').textContent).toBe('59');
      await key(segment('minute'), 'Home');
      expect(segment('minute').textContent).toBe('00');
    });

    it('moves between segments with the arrows and the separators', async () => {
      setup({ seconds: true });
      segment('hour').focus();
      await key(segment('hour'), 'ArrowRight');
      expect(document.activeElement).toBe(segment('minute'));
      await key(segment('minute'), ':');
      expect(document.activeElement).toBe(segment('second'));
      await key(segment('second'), 'ArrowLeft');
      expect(document.activeElement).toBe(segment('minute'));
    });

    it('is a spinbutton announcing its value', async () => {
      setup({}, ref('07:05'));
      await nextTick();
      const hour = segment('hour');
      expect(hour.getAttribute('role')).toBe('spinbutton');
      expect(hour.getAttribute('aria-valuenow')).toBe('7');
      expect(hour.getAttribute('aria-valuetext')).toBe('07');
      expect(hour.getAttribute('aria-valuemax')).toBe('23');
      expect(hour.getAttribute('aria-label')).toBe('Hours');
      await key(hour, 'Delete');
      expect(hour.getAttribute('aria-valuetext')).toBe('Empty');
      expect(hour.hasAttribute('aria-valuenow')).toBe(false);
    });

    it('ignores keys while disabled, and edits nothing while read-only', async () => {
      const model = setup({ disabled: true }, ref('10:00'));
      await nextTick();
      expect(segment('hour').hasAttribute('tabindex')).toBe(false);
      await key(segment('hour'), 'ArrowUp');
      expect(model.value).toBe('10:00');

      wrapper!.unmount();
      const second = setup({ readOnly: true }, ref('10:00'));
      await nextTick();
      segment('hour').focus();
      await key(segment('hour'), 'ArrowUp');
      expect(second.value).toBe('10:00');
      await key(segment('hour'), 'ArrowRight');
      expect(document.activeElement).toBe(segment('minute'));
    });
  });

  describe('popup', () => {
    it('opens from the trigger and focuses the first column', async () => {
      setup({}, ref('10:30'));
      await open();
      expect(popup()).not.toBeNull();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(document.activeElement).toBe(column('hour'));
    });

    it('stays open on a press on the picker itself', async () => {
      setup({}, ref('10:30'));
      await open();
      segment('minute').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await settle();
      expect(popup()).not.toBeNull();
    });

    it('lists every value of each unit, marking the picked one', async () => {
      setup({}, ref('10:30'));
      await open();
      expect(column('hour')!.querySelectorAll('[role="option"]')).toHaveLength(24);
      expect(column('minute')!.querySelectorAll('[role="option"]')).toHaveLength(60);
      expect(option('hour', '10').getAttribute('aria-selected')).toBe('true');
      expect(column('hour')!.getAttribute('aria-activedescendant')).toBe(option('hour', '10').id);
      // No seconds column without `seconds`.
      expect(column('second')).toBeNull();
    });

    it('picks on a click, filling the other units with 00 from empty', async () => {
      const model = setup();
      await open();
      option('hour', '09').click();
      await nextTick();
      expect(model.value).toBe('09:00');
      option('minute', '45').click();
      await nextTick();
      expect(model.value).toBe('09:45');
      expect(popup()).not.toBeNull();
    });

    it('picks with the arrows, wrapping, moves between columns, and closes with Enter', async () => {
      const model = setup({}, ref('23:00'));
      await open();
      await key(column('hour')!, 'ArrowDown');
      expect(model.value).toBe('00:00');
      await key(column('hour')!, 'ArrowUp');
      expect(model.value).toBe('23:00');
      await key(column('hour')!, 'ArrowRight');
      expect(document.activeElement).toBe(column('minute'));
      await key(column('minute')!, 'End');
      expect(model.value).toBe('23:59');

      await key(column('minute')!, 'Enter');
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('opens when focus enters the segments, leaving focus there', async () => {
      setup({}, ref('10:30'));
      await later();
      segment('hour').focus();
      await settle();
      expect(popup()).not.toBeNull();
      expect(document.activeElement).toBe(segment('hour'));

      // Typing carries on, and the columns follow.
      await typeInto(segment('hour'), '14');
      expect(option('hour', '14').getAttribute('aria-selected')).toBe('true');
    });

    it('stays closed after Escape as focus moves between segments, and a press reopens it', async () => {
      setup({}, ref('10:30'));
      await later();
      segment('hour').focus();
      await settle();
      await key(segment('hour'), 'Escape');
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('false');

      segment('minute').focus();
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('false');

      document.querySelector('[data-part="input"]')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('closes once focus leaves the picker and its popup', async () => {
      setup({}, ref('10:30'));
      const elsewhere = document.body.appendChild(document.createElement('button'));
      await later();
      segment('hour').focus();
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');

      elsewhere.focus();
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('opens only from the trigger with openOnFocus off', async () => {
      setup({ openOnFocus: false }, ref('10:30'));
      await later();
      segment('hour').focus();
      await settle();
      expect(popup()).toBeNull();

      await open();
      expect(popup()).not.toBeNull();
      expect(document.activeElement).toBe(column('hour'));
    });

    it('opens nothing while read-only', async () => {
      setup({ readOnly: true }, ref('10:30'));
      await open();
      expect(popup()).toBeNull();
    });
  });

  describe('min and max', () => {
    const disabled = (unit: string, value: string) => option(unit, value).hasAttribute('data-disabled');

    it('disables options with no time inside the bounds, given the units above them', async () => {
      setup({ min: '09:30', max: '17:15' }, ref('09:45'));
      await open();
      expect(disabled('hour', '08')).toBe(true);
      expect(disabled('hour', '09')).toBe(false);
      expect(disabled('hour', '17')).toBe(false);
      expect(disabled('hour', '18')).toBe(true);
      expect(disabled('minute', '29')).toBe(true);
      expect(disabled('minute', '30')).toBe(false);
      expect(option('minute', '29').getAttribute('aria-disabled')).toBe('true');
    });

    it('ignores a click on a disabled option', async () => {
      const model = setup({ min: '09:30' }, ref('09:45'));
      await open();
      option('minute', '10').click();
      await nextTick();
      expect(model.value).toBe('09:45');
    });

    it('moves a pick that leaves the lower units outside onto the nearer bound', async () => {
      const model = setup({ min: '09:30', max: '17:15' }, ref('12:10'));
      await open();
      option('hour', '09').click();
      await nextTick();
      expect(model.value).toBe('09:30');
      option('minute', '50').click();
      await nextTick();
      option('hour', '17').click();
      await nextTick();
      expect(model.value).toBe('17:15');
    });

    it('fills an empty value from a pick, inside the bounds', async () => {
      const model = setup({ min: '09:30' });
      await open();
      option('hour', '09').click();
      await nextTick();
      expect(model.value).toBe('09:30');
    });

    it('steps over what is outside, wrapping, and goes to the allowed ends', async () => {
      const model = setup({ min: '09:00', max: '17:00' }, ref('17:00'));
      await nextTick();
      await key(segment('hour'), 'ArrowUp');
      expect(model.value).toBe('09:00');
      await key(segment('hour'), 'ArrowDown');
      expect(model.value).toBe('17:00');
      await key(segment('hour'), 'Home');
      expect(model.value).toBe('09:00');
      await key(segment('minute'), 'End');
      expect(model.value).toBe('09:59');
      await key(segment('hour'), 'End');
      // 17:59 is past the max: the step lands on it.
      expect(model.value).toBe('17:00');
    });

    it('picks with the column keys only what is inside', async () => {
      const model = setup({ min: '09:00', max: '11:00' }, ref('11:00'));
      await open();
      await key(column('hour')!, 'ArrowDown');
      expect(model.value).toBe('09:00');
      await key(column('hour')!, 'End');
      expect(model.value).toBe('11:00');
    });

    it('keeps a typed time outside the bounds, publishes it, and marks it invalid', async () => {
      const model = setup({ min: '09:00' });
      segment('hour').focus();
      await typeInto(segment('hour'), '0730');
      expect(model.value).toBe('07:30');
      const root = document.querySelector<HTMLElement>('[data-part="timepicker"]')!;
      expect(root.hasAttribute('data-invalid')).toBe(true);
      expect(segment('hour').getAttribute('aria-invalid')).toBe('true');

      // A step skips 08, which has no minute inside.
      await key(segment('hour'), 'ArrowUp');
      expect(model.value).toBe('09:30');
      expect(root.hasAttribute('data-invalid')).toBe(false);
    });

    it('rounds bounds inward to whole minutes without seconds, and reads them with seconds', async () => {
      const model = setup({ min: '09:30:30' }, ref('09:31'));
      await open();
      expect(option('minute', '30').hasAttribute('data-disabled')).toBe(true);
      expect(option('minute', '31').hasAttribute('data-disabled')).toBe(false);
      model.value = '09:30:15';
      await nextTick();
      expect(document.querySelector('[data-part="timepicker"]')!.hasAttribute('data-invalid')).toBe(true);
    });

    it('bounds nothing when min is after max', async () => {
      setup({ min: '22:00', max: '06:00' }, ref('12:00'));
      await open();
      expect(column('hour')!.querySelectorAll('[data-disabled]')).toHaveLength(0);
      expect(document.querySelector('[data-part="timepicker"]')!.hasAttribute('data-invalid')).toBe(false);
    });
  });

  describe('12-hour', () => {
    it('shows the hour as 12, 01–11 with a period, and keeps the value 24-hour', async () => {
      const model = setup({ hourCycle: 12 }, ref('00:05'));
      await nextTick();
      expect(segment('hour').textContent).toBe('12');
      expect(segment('period').textContent).toBe('AM');
      model.value = '13:30';
      await nextTick();
      expect(segment('hour').textContent).toBe('01');
      expect(segment('period').textContent).toBe('PM');
      expect(segment('hour').getAttribute('aria-valuenow')).toBe('1');
      expect(segment('hour').getAttribute('aria-valuemin')).toBe('1');
      expect(segment('hour').getAttribute('aria-valuemax')).toBe('12');
      expect(segment('period').getAttribute('aria-valuetext')).toBe('PM');
      expect(segment('period').getAttribute('aria-label')).toBe('AM/PM');
      expect(document.querySelectorAll('[data-part="separator"]')[1].textContent).toBe(' ');
    });

    it('publishes only once the period is set too', async () => {
      const model = setup({ hourCycle: 12 });
      segment('hour').focus();
      await typeInto(segment('hour'), '0930');
      expect(model.value).toBeNull();
      expect(document.activeElement).toBe(segment('period'));
      await key(segment('period'), 'p');
      expect(model.value).toBe('21:30');
      await key(segment('period'), 'A');
      expect(model.value).toBe('09:30');
    });

    it('types a 12-hour hour: 1 waits, 2 moves on, a lone 0 shows nothing yet', async () => {
      const model = setup({ hourCycle: 12 }, ref('15:00'));
      await nextTick();
      segment('hour').focus();
      await typeInto(segment('hour'), '1');
      expect(segment('hour').textContent).toBe('01');
      expect(document.activeElement).toBe(segment('hour'));
      await typeInto(segment('hour'), '2');
      // 12 in the afternoon is noon.
      expect(model.value).toBe('12:00');
      segment('hour').focus();
      await typeInto(segment('hour'), '0');
      expect(segment('hour').textContent).toBe('12');
      await typeInto(segment('hour'), '7');
      expect(model.value).toBe('19:00');
    });

    it('steps the hour within its period, and toggles the period with the arrows', async () => {
      const model = setup({ hourCycle: 12 }, ref('23:00'));
      await nextTick();
      await key(segment('hour'), 'ArrowUp');
      expect(model.value).toBe('12:00');
      await key(segment('period'), 'ArrowDown');
      expect(model.value).toBe('00:00');
      await key(segment('period'), 'ArrowDown');
      expect(model.value).toBe('12:00');
      await key(segment('period'), 'Backspace');
      expect(model.value).toBeNull();
      expect(segment('period').textContent).toBe('--');
    });

    it('takes custom period labels, typed by their first letter', async () => {
      const model = setup({ hourCycle: 12, periodLabels: ['vorm.', 'nachm.'] }, ref('08:00'));
      await nextTick();
      expect(segment('period').textContent).toBe('vorm.');
      await key(segment('period'), 'n');
      expect(model.value).toBe('20:00');
    });

    it('lists the hours of the period shown, and a period column', async () => {
      const model = setup({ hourCycle: 12 }, ref('14:00'));
      await open();
      const labels = [...column('hour')!.querySelectorAll('[role="option"]')].map((el) => el.textContent);
      expect(labels).toEqual(['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']);
      expect(option('hour', '02').getAttribute('aria-selected')).toBe('true');
      option('period', 'AM').click();
      await nextTick();
      expect(model.value).toBe('02:00');
      option('hour', '12').click();
      await nextTick();
      expect(model.value).toBe('00:00');
    });

    it('fills an empty period with AM from a pick, or PM where only that is allowed', async () => {
      const model = setup({ hourCycle: 12, min: '13:00' });
      await open();
      option('hour', '03').click();
      await nextTick();
      expect(model.value).toBe('15:00');
      expect(option('period', 'AM').hasAttribute('data-disabled')).toBe(true);
    });

    it('renders no period column in 24-hour', async () => {
      setup();
      await open();
      expect(column('period')).toBeNull();
      expect(segment('period')).toBeNull();
    });
  });

  describe('clear', () => {
    it('shows while filled, empties every segment and focuses the first', async () => {
      const model = setup({}, ref('10:30'));
      await nextTick();
      const clear = document.querySelector<HTMLElement>('[data-part="clear"]')!;
      await later();
      clear.click();
      await nextTick();
      expect(model.value).toBeNull();
      expect(segment('minute').textContent).toBe('--');
      expect(document.activeElement).toBe(segment('hour'));
      expect(document.querySelector('[data-part="clear"]')).toBeNull();
    });
  });

  describe('field and form', () => {
    it('is the field control: labeled, and its label focuses the first segment', async () => {
      setup({}, ref(null), true);
      await nextTick();
      const label = document.querySelector<HTMLElement>('[data-part="field-label"]')!;
      const group = document.querySelector<HTMLElement>('[data-part="input"]')!;
      expect(group.getAttribute('role')).toBe('group');
      expect(group.getAttribute('aria-labelledby')).toBe(label.id);
      expect(label.getAttribute('for')).toBe(segment('hour').id);

      await later();
      label.click();
      expect(document.activeElement).toBe(segment('hour'));
    });

    it('submits the value under its name, and nothing while empty', async () => {
      const model = setup({ name: 'start' }, ref('07:45'));
      await nextTick();
      const hidden = () => document.querySelector<HTMLInputElement>('input[type="hidden"][name="start"]')!;
      expect(hidden().value).toBe('07:45');
      model.value = null;
      await nextTick();
      expect(hidden().value).toBe('');
    });

    it('carries its state as data attributes', async () => {
      setup({ invalid: true, required: true }, ref(null));
      await nextTick();
      const root = document.querySelector<HTMLElement>('[data-part="timepicker"]')!;
      expect(root.hasAttribute('data-empty')).toBe(true);
      expect(root.hasAttribute('data-invalid')).toBe(true);
      expect(root.hasAttribute('data-required')).toBe(true);
      expect(segment('hour').getAttribute('aria-invalid')).toBe('true');
    });
  });
});
