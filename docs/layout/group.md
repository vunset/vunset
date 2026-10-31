# Group

A box around related controls, so screen readers know they belong together.
It's a `role="group"`, or a `role="toolbar"` with `variant="toolbar"`. A
[Separator](/utilities/separator) inside it automatically runs across the
group's direction.

::: preview group/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { Group, Separator } from '@vunset/vue';
</script>

<template>
  <Group>
    <button />
    <Separator />
    <button />
  </Group>
</template>
```

It doesn't lay anything out itself. It sets `data-part="control-group"`,
`data-variant` and `data-orientation`, and your stylesheet does the rest.

## Examples

### Toolbar

`variant="toolbar"` makes it a `role="toolbar"` with a single tab stop. The
arrow keys move between its controls (see [Keyboard](#keyboard)).

::: preview group/Toolbar
:::

### Vertical

`orientation="vertical"` stacks it top to bottom. A `Separator` inside turns
horizontal to match.

::: preview group/Vertical
:::

### Any control inside

A text field, a select, a toggle group and a menu in one toolbar. Each keeps
working as usual: the field keeps the arrow keys for its cursor, the toggle
group moves within itself, and the select and the menu open as normal.

::: preview group/Controls
:::

### Joined

The same controls twice: as a `group`, joined with a line between
neighbors, and as a `toolbar`, spaced apart. The look comes entirely from
your stylesheet, keyed on `data-variant`.

::: preview group/Joined
:::

## Keyboard

Only with `variant="toolbar"`. The whole toolbar is one tab stop: its first
control at first, then whichever had focus last. Any focusable element inside
counts, native or a component. Disabled ones are skipped.

| Key | Does |
| --- | --- |
| <kbd>→</kbd> <kbd>←</kbd> | Next or previous control (<kbd>↓</kbd> <kbd>↑</kbd> when vertical), wrapping at the ends |
| <kbd>Home</kbd> <kbd>End</kbd> | First or last control |

A few controls keep some arrow keys for themselves:

- A text field keeps the arrows for its cursor. In a horizontal toolbar, ←
  and → move on to the next control once the cursor is at the start or end.
  In a vertical one, the field keeps ↑ and ↓ entirely.
- A control with its own arrow keys, like a
  [Toggle group](/actions/toggle-group), counts as one stop. The toolbar moves
  focus into it, and its own arrows move within it.
- A plain `Group` inside, just clustering buttons, isn't a stop of its own.
  Its buttons are part of the toolbar.

## API Reference

The element carries `data-part="control-group"`, `data-variant`,
`data-orientation`, `role="group"` or `role="toolbar"` (with
`aria-orientation`), and `label` as its `aria-label`.

::: api group/Group
:::
