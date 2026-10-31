# AppTabs

A row of tabs, each showing its own panel. Built on [Tabs](/navigation/tabs):
two looks, `line` and `pills`, with an indicator that slides to the selected
tab.

::: preview ui/app-tabs/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppTabs } from '@vunset/ui';

const tabs = [
  { value: 'account', label: 'Account' },
  { value: 'password', label: 'Password' }
];
</script>

<template>
  <AppTabs :tabs="tabs">
    <template #account>…</template>
    <template #password>…</template>
  </AppTabs>
</template>
```

`tabs` makes a tab each: `{ value, label, disabled }`, or a plain value, which
is its own label. Each tab's panel is the slot named after its `value`; the
`#panel` slot covers every tab without one. A tab with no slot at all gets no
panel, for tabs that only switch a view you show yourself.

`v-model` holds the selected value. Without it, the first tab that isn't
disabled starts selected, or `default-value`; a `v-model` that starts empty is
given that first tab.

## Examples

### Pills

`variant="pills"` sets the tabs in a sunken track and lifts the selected one
out of it. Here the class props stretch it: `tabs-class="w-full"` on the row,
`tab-class="flex-1"` on each tab. `#tab` replaces a tab's label, and receives
the `tab` and whether it is `selected`.

::: preview ui/app-tabs/Pills
:::

### Vertical

`orientation="vertical"` stacks the tabs beside their panels; Up and Down move
between them. `keep-mounted` keeps every panel in the page, hidden, so what was
typed in one survives a switch.

::: preview ui/app-tabs/Vertical
:::

### Vertical pills

`variant` and `orientation` combine: pills stacked beside their panels.

::: preview ui/app-tabs/VerticalPills
:::

### Fill

`app-tabs-fill` on tabs in a flex column makes them take the height left, and
each panel a flex column passing it on: a table in a panel (`min-h-0 flex-1`)
scrolls within it, its sticky header in view. The panels still share one cell,
so a switch still cross-fades.

::: preview ui/app-tabs/Fill
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | Move between tabs; <kbd>↑</kbd> <kbd>↓</kbd> when vertical. Wraps unless `:loop="false"` |
| <kbd>Home</kbd> <kbd>End</kbd> | Move to the first or the last tab |
| <kbd>Enter</kbd> <kbd>Space</kbd> | Select the focused tab, unless `activate-on-focus` already has |

## Styling

| Class | On |
| --- | --- |
| `app-tabs` | The root, with `data-variant` and `data-orientation` |
| `app-tabs-list` | The row of tabs, with `data-variant` and `data-orientation` |
| `app-tabs-tab` | Each tab, with `data-selected` and `data-disabled` |
| `app-tabs-indicator` | The line or pill under the selected tab, placed by `--active-tab-*` |
| `app-tabs-panels` | The wrapper around the panels |
| `app-tabs-panel` | Each panel |
| `app-tabs-fill` | Add it to the root: fills a flex column, and passes the height on to each panel |

`class` goes on the root. For classes on the inner parts, use `tabs-class`
(the row), `tab-class`, `panels-class`, `panel-class` and `indicator-class`. See
[classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/app/app-tabs.css

## API Reference

### AppTabs

::: api app/AppTabs
:::
