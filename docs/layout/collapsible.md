# Collapsible

A button that shows and hides a panel. The panel can animate its height
open and closed, because it tells your CSS how tall its content is.

::: preview collapsible/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel } from '@vunset/vue';
</script>

<template>
  <CollapsibleRoot>
    <CollapsibleTrigger />
    <CollapsiblePanel />
  </CollapsibleRoot>
</template>
```

The parts carry `data-part="collapsible"`, `collapsible-trigger` and
`collapsible-panel`. All three have `data-open` or `data-closed`, and
`data-disabled` when it's disabled.

## Animating the height

The panel sets `--collapsible-panel-height` (and `--collapsible-panel-width`)
to its content's size, and keeps it up to date as the content changes.
Transition `height` to it, and to `0` on `data-enter-from` and
`data-leave-to`. The panel stays on the page until the closing animation
finishes:

```css
.panel {
  overflow: hidden;
  height: var(--collapsible-panel-height);
  transition: height 200ms ease;
}

.panel[data-enter-from],
.panel[data-leave-to] {
  height: 0;
}
```

Put padding on an element inside the panel, not on the panel itself, so a
height of `0` closes it all the way.

## Examples

### Open from the start

`default-open` starts it open. The panel is just there, without playing its
enter animation, so a page load doesn't animate every section that starts
open. To control it yourself, use `v-model:open`.

::: preview collapsible/DefaultOpen
:::

## Keyboard

The trigger is a `<button>`, so it has the usual keys:

| Key | Does |
| --- | --- |
| <kbd>Enter</kbd> <kbd>Space</kbd> | Open or close the panel |

## API Reference

### CollapsibleRoot

::: api collapsible/CollapsibleRoot
:::

### CollapsibleTrigger

The element carries `aria-expanded` and `aria-controls`.

::: api collapsible/CollapsibleTrigger
:::

### CollapsiblePanel

It's on the page only while open, and through its closing animation. With
`keep-mounted`, it stays on the page while closed, `hidden`.

The element carries `--collapsible-panel-height` and
`--collapsible-panel-width`.

::: api collapsible/CollapsiblePanel
:::
