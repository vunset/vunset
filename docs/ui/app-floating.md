# AppFloating

A panel that floats over the page, like an inspector or a notes window:
dragged by its header, pulled by its edges, and kept inside the viewport.
Built on [Floating](/overlays/floating); it isn't modal.

::: preview ui/app-floating/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { AppFloating } from '@vunset/ui';

const open = ref(false);
</script>

<template>
  <AppFloating v-model:open="open" title="Inspector" :left="40" :top="120">
    …
  </AppFloating>
</template>
```

It has no trigger of its own. Open it from any button with `v-model:open`.

- The default slot is the body. It scrolls when the panel is shorter than
  its content.
- `#footer` adds a row of actions under the body.
- `#actions` puts buttons in the header, before the close button.
  `:closable="false"` removes the close button.

The body and footer slots get a `close()` function.

Drag the header to move the panel, and double-click it to put the panel back.
`@drag` reports where it moved to.

By default you can resize it from every edge and corner. Set `resize` to `x`,
`y` or `none` to limit that. It stays within `min-width` (240),
`min-height` (120), `max-width` and `max-height`, and `@resize` reports the new
size.

`width` and `height` set its starting size. Without them it fits its content,
but never narrower than 240px. For a smaller `min-width`, also add a class
like `min-w-0`. Every other attribute goes on the panel.

## Examples

### Anchored to a corner

`left`, `right`, `top` and `bottom` open it that far from the edges of the
window. It stays there as the window resizes, until someone drags it.

::: preview ui/app-floating/Anchored
:::

## Styling

| Class | On |
| --- | --- |
| `app-floating` | The panel, with `data-dragging` and `data-resizing` |
| `app-floating-header` | The header, the drag handle |
| `app-floating-title` | The title |
| `app-floating-actions` | The header's buttons |
| `app-floating-body` | The body, which scrolls |
| `app-floating-footer` | The footer |
| `app-floating-resizer` | Each edge and corner handle, with `data-handle` |

`class` goes on the panel. `header-class` and `body-class` add classes to the
header and body. See [classes on the inner parts](/ui/theming#classes-on-the-inner-parts).
To fit your own layers above or below it, see [stacking](/ui/theming#stacking).

<<< ../../packages/ui/src/app/app-floating.css

## API Reference

### AppFloating

::: api app/AppFloating
:::
