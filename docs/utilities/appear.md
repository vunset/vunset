# Appear

Shows and hides its content with an enter and exit animation you write in
plain CSS. When it hides, it stays on the page until the animation has
finished, however long you make it.

::: preview appear/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { Appear } from '@vunset/vue';
</script>

<template>
  <Appear :open="visible">…</Appear>
</template>
```

`open` shows or hides it, and is `true` by default.

## Animating

The element has `data-enter-from` for the first frame it's shown, and
`data-leave-to` while it leaves. Style both as the hidden look, and add a
transition or an animation to the resting one:

```css
.appear {
  transition: opacity 200ms;
}

.appear[data-enter-from],
.appear[data-leave-to] {
  opacity: 0;
}
```

It waits for every transition and animation on it and inside it to finish
before it goes, so the timing lives only in your CSS.

## Examples

### Keep mounted

With `keep-mounted`, a hidden element stays on the page with the `hidden`
attribute instead of being removed, so whatever is inside keeps its state.
Type a note, hide it and show it again.

::: preview appear/KeepMounted
:::

### On the first render

Content that's already open on the first render animates in too. Use
`:appear="false"` to have it there from the start.

::: preview appear/FirstRender
:::

### A list that filters

Each row is its own `Appear`, open while it matches. A row the filter drops
animates out before it leaves the list, and one it brings back animates in.

::: preview appear/Filter
:::

## API Reference

### Appear

The element carries `data-part="appear"`, `data-open` or `data-closed`, and
the `data-enter-from` and `data-leave-to` above.

::: api appear/Appear
:::
