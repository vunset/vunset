# Theming

Every color and size in ui is a CSS variable. Change one on `:root` and
every component follows:

```css
:root {
  --ui-accent: #7c3aed;
  --ui-radius: 0.75rem;
}
```

You can also set them on any element, and they apply only inside it:

```css
.sidebar {
  --ui-font-size: 0.8125rem;
}
```

## How your CSS wins

ui puts its tokens in `@layer theme` and its rules in `@layer components`.
Anything you write outside a layer beats both, and so does a Tailwind
utility. You never need `!important`.

To restyle a component, write a rule for its class. Each component's page
lists its classes under **Styling**:

```css
.app-dialog {
  border-radius: 1.5rem;
}
```

## Classes on the inner parts

`class` and `style` go on a component's outermost element: the field around
a `Form*` component, the trigger of an overlay. To reach the elements inside,
every component takes a `<part>-class` prop for each of them:

```vue
<FormInput label="Email" control-class="bg-white" label-class="uppercase" />
<AppDialog title="Rename" popup-class="max-w-sm" />
```

- `control-class` is the box a `Form*` component draws its value in.
- `label-class`, `help-class` and `error-class` are a `Form*` field's texts.
- `popup-class` is the panel of anything that opens one.
- Overlays add `trigger-class`, `backdrop-class`, `header-class`,
  `body-class` and `footer-class`.

They take whatever `class` takes: a string, an object or an array. Each
component's page lists the ones it has under **Styling**.

Other attributes, like `aria-label` or `data-*`, go on the control itself on
a `Form*` component with one control, so `<FormSwitch aria-label="Dark mode" />`
names the switch, not the field around it.

## Sizes

Most sizes have a base, and the smaller and larger steps are worked out from
it. Change the base and they all move: `--ui-radius: 0` makes everything
square, pills included, and `--ui-font-size: 1rem` makes all of ui's text
bigger. Set a step yourself (`--ui-radius-sm`) to change only that one.

Set a base on `:root`. The steps are worked out there, so a base set on a
smaller element changes only the base step inside it.

| Token | Default |
| --- | --- |
| `--ui-font-size` | `0.875rem` |
| `--ui-font-size-2xs`, `-xs`, `-sm` | `0.1875rem`, `0.125rem`, `0.0625rem` under it |
| `--ui-font-size-lg`, `-xl` | `0.0625rem`, `0.125rem` over it |
| `--ui-radius` | `0.375rem` |
| `--ui-radius-xs`, `-sm` | a third, two thirds of it (`0.125rem`, `0.25rem`) |
| `--ui-radius-lg`, `-xl`, `-2xl`, `-3xl` | ×4/3, ×2, ×8/3, ×4 (`0.5rem` to `1.5rem`), Tailwind's steps |
| `--ui-radius-full` | a pill; none at `--ui-radius: 0` |
| `--ui-control-height` | `2.125rem` |
| `--ui-control-height-sm`, `-lg` | `0.5rem` under or over it, for `size` |
| `--ui-control-padding-x` | `0.75rem` |
| `--ui-control-padding-x-sm`, `-lg` | `0.125rem` under or over it |
| `--ui-control-shadow` | `0 1px 3px -1px` black at 15% |
| `--ui-border-width` | `1px` |
| `--ui-check-size` | `1.125rem`: a checkbox, a radio, a range thumb |
| `--ui-check-size-sm`, `-lg` | `0.125rem` under or over it |
| `--ui-switch-width`, `--ui-switch-height` | `2.5rem`, `1.375rem` |
| `--ui-switch-width-sm`, `-lg` | `0.375rem` under or over it |
| `--ui-switch-height-sm`, `-lg` | `0.25rem` under or over it |
| `--ui-duration` | `150ms` |

## Colors

Colors are written with `light-dark()`, so each has a light and a dark value
and follows the page's color scheme.

| Token | Default |
| --- | --- |
| `--ui-bg` | `light-dark(#fff, #111111)` |
| `--ui-surface` | `light-dark(#f4f4f5, #27272a)` |
| `--ui-border` | `light-dark(#d4d4d8, #333)` |
| `--ui-text` | `light-dark(#18181b, #fafafa)` |
| `--ui-muted` | `--ui-text` at 50% |
| `--ui-accent`, `--ui-on-accent` | `#228c9e`, `#fff` |
| `--ui-neutral`, `--ui-on-neutral` | `--ui-text`, `--ui-bg` |
| `--ui-danger`, `--ui-on-danger` | `light-dark(#d42525, #ff4d4d)`, `light-dark(#fff, #4c0707)` |
| `--ui-success`, `--ui-on-success` | `light-dark(#16a34a, #4ade80)`, `light-dark(#fff, #093019)` |
| `--ui-warning`, `--ui-on-warning` | `light-dark(#d97706, #fbbf24)`, `light-dark(#fff, #301909)` |
| `--ui-focus-ring` | `--ui-focus-ring-width` (`0 0 0 3px`) in `--ui-focus-ring-color` (accent at 15%) |

### Tables

AppTable and AppDataTable color their cells from these. They're unset, and
each falls back to a tint mixed where it's used, so a `--ui-bg` set on a card
around the table reaches its stripes and hover too. Set them on `:root`, on
one table, or in a class.

| Token | When unset |
| --- | --- |
| `--ui-table-bg` | `--ui-bg`: every cell, header and footer included |
| `--ui-table-stripe` | `--ui-text` at 3% over the table's background: odd rows of a striped table |
| `--ui-table-hover` | `--ui-text` at 6% over it: the row under the pointer, given an `index` |
| `--ui-table-selected` | `--ui-accent` at 14% over it: a `selected` row |

```css
.orders-table {
  --ui-table-stripe: light-dark(#f8fafc, #18181b);
  --ui-table-hover: light-dark(#eef2ff, #1e1b4b);
}
```

## Light and dark

The colors follow `color-scheme` on `<html>`. If nothing sets it, the
browser shows light. [`useTheme()`](/utilities/theme) from `@vunset/vue`
switches between light, dark and the system's setting, and remembers the
choice:

```vue
<script setup lang="ts">
import { useTheme } from '@vunset/vue';

const { theme } = useTheme();
</script>

<template>
  <FormToggleGroup v-model="theme" :options="['light', 'dark', 'system']" keep-one />
</template>
```

## Stacking

| Token | Default |
| --- | --- |
| `--ui-z-floating` | `40`: AppFloating |
| `--ui-z-overlay` | `50`: dialogs, drawers, their backdrop |
| `--ui-z-popup` | `50`: popovers, menus, selects, tooltips |
| `--ui-z-toast` | `60`: AppToaster |

Leave gaps for your own layers: a sticky header at `45` sits above floating
panels and below dialogs. Popups and dialogs share a level, so whichever
opened last is on top, which is what you want for a select inside a dialog.

## The field box

`.form-control` is the box every `Form*` field draws in: the input, the
textarea, and the triggers of the select, combobox and datepicker. It holds
the height, padding, border, radius, font and focus ring. Put it on a control
of your own and it looks like the rest. A medium `AppButton` is the same
height, so they line up side by side, and the button's classes work on your
own `<button>` too: `class="app-button" data-variant="solid"`.

::: preview ui/theming/FormControl
:::

Its states are attributes, so your control can set them too: `data-open`,
`data-invalid`, `data-readonly`, or `disabled`.

::: preview ui/theming/FormControlStates
:::

<<< ../../packages/ui/src/form/form-control.css

## Only the stylesheets you use

`all.css` has everything. If you'd rather ship less, import `base.css` for
the tokens, then one stylesheet per component from `css/`:

```ts
import '@vunset/ui/base.css';
import '@vunset/ui/css/form-field.css';
import '@vunset/ui/css/form-control.css';
import '@vunset/ui/css/form-input.css';
import '@vunset/ui/css/app-button.css';
import '@vunset/ui/css/app-overlay.css';
import '@vunset/ui/css/app-dialog.css';
```

A stylesheet doesn't import the ones it builds on, so you never load one
twice. That means you import those yourself, first, in this order:

| Stylesheet                                                                                       | Needs first                                                               |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `form-checkbox`, `form-radio`, `form-switch`, `form-range`, `form-calendar`, `form-toggle-group` | `form-field`                                                              |
| `form-input`, `form-textarea`, `form-timepicker`  | `form-field`, `form-control`                                              |
| `form-checkbox-group`                                                                            | `form-field`, `form-checkbox`                                             |
| `form-select`, `form-combobox`                                                                   | `form-field`, `form-control`, `form-listbox`                              |
| `form-datepicker`                                                                                | `form-field`, `form-control`, `form-calendar`                             |
| `app-copy`, `app-alert`                                                                          | `app-button`                                                              |
| `app-dialog`, `app-drawer`, `app-floating`                                                       | `app-button`, `app-overlay`                                               |
| `app-popover`, `app-tooltip`                                                                     | `app-overlay`                                                             |
| `app-confirm`                                                                                    | `app-button`, `app-overlay`, `app-popover`                                |
| `app-menu`                                                                                       | `app-overlay`, `app-separator`                                            |
| `app-menubar`                                                                                    | `app-overlay`, `app-separator`, `app-menu`                                |
| `app-group`                                                                                      | `app-separator`                                                           |
| `app-toaster`                                                                                    | `app-button`, `app-spinner`                                               |
| `app-async-state`                                                                                | `app-button`, `app-spinner`, `app-empty-state`                            |
| `app-data-table`                                                                                 | `app-table`                                                               |
| `app-pagination`                                                                                 | `form-field`, `form-control`, `form-listbox`, `form-select`, `app-button` |

A few components share a stylesheet:

| Component                        | Stylesheet            |
| -------------------------------- | --------------------- |
| `AppProgress`, `AppMeter`        | `app-gauge.css`       |
| `AppAccordion`                   | `app-collapsible.css` |
| `AppContextMenu`, `AppMenuItems` | `app-menu.css`        |
| `FormRadioGroup`                 | `form-radio.css`      |
| `AppIcon`                        | `base.css` alone      |

`kbd.css` styles every `<kbd>` on the page as a key cap. It's part of
`all.css`; leave it out if you load stylesheets one by one and want the
browser's own look.
