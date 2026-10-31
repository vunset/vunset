# Tabs

A list of tabs, each showing its own panel. A tab and its panel are matched by
`value`, so they don't have to sit next to each other in your markup.

::: preview tabs/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { TabsRoot, TabsList, TabsTab, TabsIndicator, TabsPanel } from '@vunset/vue';
</script>

<template>
  <TabsRoot>
    <TabsList>
      <TabsTab value="a" />
      <TabsIndicator />
    </TabsList>
    <TabsPanel value="a" />
  </TabsRoot>
</template>
```

## Examples

### Indicator

`TabsIndicator` gets the selected tab's position and size as CSS variables, so
one element can slide from tab to tab. It stays `hidden` until the selected tab
has been measured, so it doesn't flash in the wrong place on first render.

::: preview tabs/Indicator
:::

### Vertical

`orientation="vertical"` turns the arrow keys to Up and Down.

::: preview tabs/Vertical
:::

### Activate on focus

By default arrow keys only move focus, and Enter or Space selects.
`activate-on-focus` selects as soon as focus arrives, which suits panels that
are cheap to show.

::: preview tabs/ActivateOnFocus
:::

### Disabled tab

A disabled tab can't be selected, and arrow keys skip it.

::: preview tabs/Disabled
:::

## Keyboard

The list is one tab stop: Tab reaches the selected tab, and then its panel.

| Key | Does |
| --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | Previous or next tab, in a horizontal list |
| <kbd>↑</kbd> <kbd>↓</kbd> | Previous or next tab, in a vertical list |
| <kbd>Home</kbd> <kbd>End</kbd> | First or last tab |
| <kbd>Enter</kbd> <kbd>Space</kbd> | Select the focused tab |

Arrow keys wrap past the ends unless `loop` is off.

## API Reference

### TabsRoot

The element carries `data-part="tabs"`.

::: api tabs/TabsRoot
:::

### TabsList

The element carries `data-part="tabs-list"` and `role="tablist"`.

::: api tabs/TabsList
:::

### TabsTab

The element carries `data-part="tabs-tab"`, `role="tab"` and
`aria-selected`.

::: api tabs/TabsTab
:::

### TabsIndicator

The element carries `data-part="tabs-indicator"`, and the selected tab's
box, measured from the list's padding edge:

| Variable | Value |
| --- | --- |
| `--active-tab-left` `--active-tab-top` | Its offset from the list's left and top. |
| `--active-tab-right` `--active-tab-bottom` | Its offset from the list's right and bottom. |
| `--active-tab-width` `--active-tab-height` | Its size. |

::: api tabs/TabsIndicator
:::

### TabsPanel

It's in the DOM only while its tab is selected, and through its exit
animation. `keep-mounted` keeps it there the rest of the time, `hidden`.

The element carries `data-part="tabs-panel"` and `role="tabpanel"`,
labeled by its tab.

::: api tabs/TabsPanel
:::
