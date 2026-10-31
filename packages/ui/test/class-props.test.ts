import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import {
  FormInput,
  FormTextarea,
  FormCheckbox,
  FormSwitch,
  FormRadioGroup,
  FormRadio,
  FormCheckboxGroup,
  FormToggleGroup,
  FormSelect,
  FormCombobox,
  FormDatepicker,
  FormRange,
  FormCalendar,
  AppDialog,
  AppDrawer,
  AppPopover,
  AppTooltip
} from '../src';

// Each `*-class` prop adds to one inner part, beside that part's own class; `class` stays on the outside.

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

async function render(component: unknown, props: Record<string, unknown>, slots: Record<string, any> = {}) {
  wrapper = mount(component as any, { props, slots, attachTo: document.body });
  await settle();
}

const has = (selector: string, extra: string) => document.querySelector(selector)?.classList.contains(extra) ?? false;

describe('control-class', () => {
  const cases: [string, unknown, string, Record<string, unknown>?][] = [
    ['FormInput', FormInput, '.form-input'],
    ['FormTextarea', FormTextarea, '.form-textarea'],
    ['FormCheckbox', FormCheckbox, '.form-checkbox'],
    ['FormSwitch', FormSwitch, '.form-switch'],
    ['FormRadioGroup', FormRadioGroup, '.form-radio-group', { options: ['a', 'b'] }],
    ['FormCheckboxGroup', FormCheckboxGroup, '.form-checkbox-group', { options: ['a', 'b'] }],
    ['FormToggleGroup', FormToggleGroup, '.form-toggle-group', { options: ['a', 'b'] }],
    ['FormSelect', FormSelect, '.form-select-trigger', { options: ['a', 'b'] }],
    ['FormCombobox', FormCombobox, '.form-combobox-trigger', { options: ['a', 'b'] }],
    ['FormDatepicker', FormDatepicker, '.form-datepicker'],
    ['FormRange', FormRange, '.form-range-control'],
    ['FormCalendar', FormCalendar, '.form-calendar']
  ];

  it.each(cases)('%s puts it on its box, and class on the field', async (_, component, box, props = {}) => {
    await render(component, { ...props, label: 'L', class: 'outer', controlClass: 'mine' });

    expect(has(box, 'mine')).toBe(true);
    expect(has('.form-field', 'outer')).toBe(true);
    expect(has('.form-field', 'mine')).toBe(false);
  });

  it.each(cases)(
    '%s takes label-, help- and error-class, leaving none as an attribute',
    async (_, component, _box, props = {}) => {
      await render(component, {
        ...props,
        label: 'L',
        help: 'H',
        error: 'E',
        labelClass: 'l',
        helpClass: ['h', { also: true }],
        errorClass: 'e'
      });

      expect(has('.form-label', 'l')).toBe(true);
      expect(has('.form-help', 'h')).toBe(true);
      expect(has('.form-help', 'also')).toBe(true);
      expect(has('.form-error', 'e')).toBe(true);
      expect(
        document.querySelector('[labelclass], [label-class], [helpclass], [help-class], [errorclass], [error-class]')
      ).toBe(null);
    }
  );

  it.each(cases)(
    '%s puts #label-start and #label-end beside its label, not in it',
    async (_, component, _box, props = {}) => {
      await render(
        component,
        { ...props, label: 'L' },
        {
          'label-start': () => h('i', 'S'),
          'label-end': () => h('a', { href: '#' }, 'Forgot?')
        }
      );

      expect(document.querySelector('.form-label-start')!.textContent).toBe('S');
      expect(document.querySelector('.form-label-end')!.textContent).toBe('Forgot?');
      expect(document.querySelector('.form-label')!.textContent).toBe('L');
      wrapper!.unmount();

      await render(component, { ...props, label: 'L' });
      expect(document.querySelector('.form-label-row, .form-label-start, .form-label-end')).toBe(null);
    }
  );

  it.each(cases)('%s takes size onto its field, not onto the control', async (_, component, _box, props = {}) => {
    await render(component, { ...props, label: 'L', size: 'sm' });

    expect(document.querySelector('.form-field')!.getAttribute('data-size')).toBe('sm');
    expect(document.querySelector('[size]')).toBe(null);
  });

  it('FormRadio takes label- and help-class for its own label and help', async () => {
    await render(
      FormRadioGroup,
      { label: 'Size' },
      {
        default: () => h(FormRadio as any, { value: 's', label: 'S', help: 'Small', labelClass: 'l', helpClass: 'h' })
      }
    );

    expect(has('.form-radio .form-label', 'l')).toBe(true);
    expect(has('.form-radio .form-help', 'h')).toBe(true);
  });
});

describe('popup-class', () => {
  const cases: [string, unknown, string, Record<string, unknown>][] = [
    ['FormSelect', FormSelect, '.form-listbox-popup', { options: ['a'], open: true }],
    ['FormCombobox', FormCombobox, '.form-listbox-popup', { options: ['a'], open: true }],
    ['FormDatepicker', FormDatepicker, '.form-datepicker-popup', { open: true }],
    ['AppDialog', AppDialog, '.app-dialog', { open: true, title: 'T' }],
    ['AppDrawer', AppDrawer, '.app-drawer', { open: true, title: 'T' }],
    ['AppPopover', AppPopover, '.app-popover', { open: true, title: 'T' }],
    ['AppTooltip', AppTooltip, '.app-tooltip', { open: true, content: 'Tip', trigger: 'T' }]
  ];

  it.each(cases)('%s puts it on its popup', async (_, component, popup, props) => {
    await render(component, { ...props, popupClass: ['mine', { also: true }] });
    expect(has(popup, 'mine')).toBe(true);
    expect(has(popup, 'also')).toBe(true);
  });
});

describe('dialog and drawer parts', () => {
  it('AppDialog takes backdrop-, header- and footer-class', async () => {
    await render(
      AppDialog,
      { open: true, title: 'T', backdropClass: 'b', headerClass: 'h', footerClass: 'f' },
      { footer: () => h('button', 'OK') }
    );
    expect(has('.app-backdrop', 'b')).toBe(true);
    expect(has('.app-overlay-header', 'h')).toBe(true);
    expect(has('.app-overlay-footer', 'f')).toBe(true);
  });

  it('AppDrawer takes body-class too', async () => {
    await render(AppDrawer, { open: true, title: 'T', bodyClass: 'scroll' }, { default: () => 'Body' });
    expect(has('.app-drawer-body', 'scroll')).toBe(true);
  });

  it('AppPopover takes header-class', async () => {
    await render(AppPopover, { open: true, title: 'T', headerClass: 'h' });
    expect(has('.app-overlay-header', 'h')).toBe(true);
  });
});

describe('no leaks', () => {
  it.each([
    ['FormSelect', FormSelect],
    ['FormCombobox', FormCombobox]
  ])('%s keeps its class props off the element as attributes', async (_, component) => {
    await render(component, { options: ['a'], open: true, controlClass: 'c', popupClass: 'p' });
    const leaked = [...document.querySelectorAll('*')].flatMap((el) =>
      [...el.attributes].map((attr) => attr.name).filter((name) => /class$/i.test(name) && name !== 'class')
    );
    expect(leaked).toEqual([]);
  });
});

describe('attributes', () => {
  it.each([
    ['FormSelect', FormSelect, '.form-select-trigger', { options: ['a'] }],
    ['FormCombobox', FormCombobox, '.form-combobox-input', { options: ['a'] }],
    ['FormDatepicker', FormDatepicker, '.form-datepicker-trigger', {}],
    ['FormRange', FormRange, '.form-range', {}]
  ] as [string, unknown, string, Record<string, unknown>][])(
    '%s puts class and style on the field and the rest on its control',
    async (_, component, control, props) => {
      await render(component, { ...props, class: 'outer', style: 'margin: 1px', 'aria-label': 'Mine', 'data-row': '3' });

      const field = document.querySelector<HTMLElement>('.form-field')!;
      const target = document.querySelector<HTMLElement>(control)!;
      expect(field.classList.contains('outer')).toBe(true);
      expect(field.style.margin).toBe('1px');
      expect(target.getAttribute('aria-label')).toBe('Mine');
      expect(target.dataset.row).toBe('3');
      expect(field.hasAttribute('aria-label')).toBe(false);
      expect(target.classList.contains('outer')).toBe(false);
    }
  );

  it('follows an attr that changes after mount', async () => {
    await render(FormInput, { class: 'outer', 'aria-label': 'First' });
    await wrapper!.setProps({ class: 'other', 'aria-label': 'Second' });

    expect(document.querySelector('input')!.getAttribute('aria-label')).toBe('Second');
    expect(document.querySelector('.form-field')!.classList.contains('other')).toBe(true);
  });
});
