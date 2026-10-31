# AppPopover

A panel attached to its trigger, for a short form or a few choices. It
doesn't dim the page or trap focus, unless you pass `modal`. Built on
[Popover](/overlays/popover).

::: preview ui/app-popover/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppPopover, AppButton } from '@vunset/ui';
</script>

<template>
  <AppPopover title="Share" trigger="Share" :as="AppButton" variant="outline">
    …
  </AppPopover>
</template>
```

The trigger works as on [AppDialog](/ui/app-dialog#usage): `trigger` is its
text, `as` renders it as an [AppButton](/ui/app-button) or anything else, and
attributes that aren't the popover's props go to it. Without `as`, it's an
underlined button that reads as part of the sentence. To open the popover from
somewhere else, leave out the trigger and use `v-model:open`.

`title` and `description` add a heading and a line of text at the top.

`side`, `align` and `side-offset` place the panel, and it flips and shifts to
stay on screen. `arrow` adds an arrow pointing at the trigger.

## Examples

### A text trigger

Without `as`, the trigger sits inside a sentence like a link.

::: preview ui/app-popover/Text
:::

### Open on hover

`open-on-hover` also opens it when the mouse rests on the trigger, and keeps
it open while the mouse is over the popover. `delay` and `close-delay` set the
timing. A tap still opens it. [More](/overlays/popover#open-on-hover).

```vue
<AppPopover :as="AppButton" trigger="Bid" open-on-hover>…</AppPopover>
```

### Inline

By default the panel is moved to the end of the page, so nothing can clip
it. `inline` keeps it where you wrote it instead, so it moves with a
scrolling panel around it. The catch: a parent with `overflow` set can now
clip it, as the box below does.

::: preview ui/app-popover/Inline
:::

### Closing from inside

The body slot gets a `close()` function, for a choice that's done once
it's made.

::: preview ui/app-popover/Close
:::

### In every row

`lazy` draws only the trigger until a pointer reaches it or it's pressed, and
mounts the popover then, in its place. A table with one in each row stays
light to scroll. It works the same: a key opens it, and focus comes back to
the trigger. Built on [Deferred](/utilities/deferred).

::: preview ui/app-popover/Lazy
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Esc</kbd> | Closes it, and focus goes back to the trigger |

When it opens, focus moves to the first control inside. Clicking outside
closes it.

## Styling

| Class | On |
| --- | --- |
| `app-popover` | The panel, with `data-side` and `data-align` |
| `app-popover-arrow` | The arrow, with `data-side` |
| `app-popover-trigger` | The default trigger, given no `as`: an underlined text button |
| `app-surface` | The panel's look, shared by `AppDialog`, `AppDrawer` and `AppPopover` |
| `app-overlay-header` | The title and description |
| `app-overlay-title` | The title |
| `app-overlay-description` | The description |

For classes on the inner parts, use `trigger-class`, `popup-class` and
`header-class`. See
[classes on the inner parts](/ui/theming#classes-on-the-inner-parts). To fit
your own layers above or below it, see [stacking](/ui/theming#stacking).

<<< ../../packages/ui/src/app/app-popover.css

## API Reference

### AppPopover

::: api app/AppPopover
:::
