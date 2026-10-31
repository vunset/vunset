# Button

A button that renders a real `<button>`, or anything else that should act
like one. It brings the behavior (keys, disabled, links) and no look: its
disabled state shows up as `data-disabled`, and the rest is yours.

::: preview button/Basic
:::

## Anatomy

A single part. Use it as it is, or wrap it in a button component of your own.

```vue
<script setup lang="ts">
import { Button } from '@vunset/vue';
</script>

<template>
  <Button />
</template>
```

## Examples

### Your own look

The button has no variants or sizes of its own: name yours in an attribute or
a class, and style that. These demos use `data-variant`:

```vue
<Button data-variant="ghost">Cancel</Button>
```

```css
[data-part='button'][data-variant='ghost'] { background: none; }
```

### Disabled

A disabled button gets the native `disabled` attribute and `data-disabled`,
and you can't tab to it. Add `focusable-when-disabled` to keep it focusable:
it's marked `aria-disabled` instead, so a tooltip or a screen reader can
still reach it.

::: preview button/Disabled
:::

### Link

`as="a"` renders a link with the same styling hooks. A link can't be
disabled, so a disabled one renders as a disabled `<button>` without its
`href`.

::: preview button/Link
:::

### In a group

Buttons inside a `Group`, one of them with a `Badge`.

::: preview button/Group
:::


## Keyboard

A real `<button>` brings its own keys. If you render something else with
`as`, it gets `role="button"` and the same keys:

| Key | Does |
| --- | --- |
| <kbd>Enter</kbd> | Presses it, on key down |
| <kbd>Space</kbd> | Presses it, on release, without scrolling the page |

A disabled button ignores both. With `focusable-when-disabled` it still takes
focus.

## API Reference

The element carries `data-part="button"` and `data-disabled`.

::: api button/Button
:::

Any other attribute or listener goes to the rendered element. With `href` or
`to` it's a link: no `role`, and the browser handles the keys.
