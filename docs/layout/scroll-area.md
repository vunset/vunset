# Scroll area

A normal scrolling box that tells you where there's more content: which
edges have more past them, and how much. You can style those edges, or turn on
a fade. The scrollbars stay the browser's own.

::: preview scroll-area/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { ScrollArea } from '@vunset/vue';
</script>

<template>
  <ScrollArea />
</template>
```

It's a single element, the box that scrolls. Give it a height or a width to
scroll within. While there's something to scroll, it's in the tab order, so
keyboard users can scroll it too.

## Examples

### Horizontal

`axis` picks which way it scrolls: `x`, `y` or `both` (the default). The
other direction is clipped. `fade` is off by default. Turn it on with `true`
for every edge, or `x` or `y` for one axis. `fade-size` sets how far the fade
reaches.

::: preview scroll-area/Horizontal
:::

### Both axes

With `axis="both"`, the content can scroll in both directions.

::: preview scroll-area/BothAxes
:::

### Styling the edges

Instead of fading, you can draw the edges yourself, using the attributes for
each edge (listed [below](#scrollarea)). Here a line appears under the header
once the list scrolls under it, and a hint shows while there's more below.
`overflow-threshold` waits a few pixels before an edge counts.

::: preview scroll-area/Edges
:::

### Fade sizes

Pick a `fade-size` to see how far the fade reaches on each axis.

::: preview scroll-area/FadeSizes
:::

## The fade

`fade` fades the content out towards each edge that has more past it. The
fade grows as you scroll away from an edge, up to `fade-size`, so an edge
you're resting against stays sharp.

The fade is a CSS mask, so it fades the element's border and background too.
Put those on a wrapper around it.

## API Reference

### ScrollArea

The element carries `data-part="scroll-area"`, and these attributes while
they're true:

| Attribute | When |
| --- | --- |
| `data-has-overflow-x`, `data-has-overflow-y` | The content is wider or taller than the box. |
| `data-overflow-x-start`, `data-overflow-x-end` | There's more content past the start or end edge. |
| `data-overflow-y-start`, `data-overflow-y-end` | There's more content past the top or bottom. |

And these CSS variables:

| Variable | Value |
| --- | --- |
| `--scroll-area-overflow-x-start` | How far, in pixels, the content runs past the start edge. |
| `--scroll-area-overflow-x-end` | How far it runs past the end edge. |
| `--scroll-area-overflow-y-start` | How far it runs past the top. |
| `--scroll-area-overflow-y-end` | How far it runs past the bottom. |
| `--scroll-area-fade-size` | Set by `fade-size`, or by your stylesheet, which is the better place for a theme-wide value. |

::: api scroll-area/ScrollArea
:::
