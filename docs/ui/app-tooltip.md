# AppTooltip

A short label that shows while the pointer rests on its trigger, or while the
trigger has focus. It's drawn in the page's colors, inverted. Built on
[Tooltip](/overlays/tooltip).

::: preview ui/app-tooltip/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppTooltip } from '@vunset/ui';
</script>

<template>
  <AppTooltip trigger="SLA" content="Service level agreement" />
</template>
```

`trigger` is the text the tooltip explains. To explain something else, wrap
it in the default slot instead. A single element or component there becomes
the trigger itself, with the tooltip's attributes added to it:

```vue
<AppTooltip content="Longer session">
  <AppButton variant="solid" type="submit" @click="extend">
    <AppIcon name="clock" />
  </AppButton>
</AppTooltip>
```

When the trigger is plain text, it's rendered as a button with a dotted
underline that reads as part of the sentence. `content` is the tooltip's own
text. Use the `#content` slot for markup:

```vue
<AppTooltip>
  SLA
  <template #content><strong>99.9%</strong> uptime, or credit back.</template>
</AppTooltip>
```

## The trigger

`as` renders the trigger as something else: an [AppButton](/ui/app-button),
an [AppIcon](/ui/app-icon), a tag. Any attribute that isn't one of the
tooltip's props (`aria-label`, `name`, an `AppButton`'s `variant`) goes to the
trigger, so you write it as if you were writing the trigger itself:

```vue
<AppTooltip content="Copy" :as="AppButton" square variant="outline" aria-label="Copy">
  <AppIcon name="copy" />
</AppTooltip>

<AppTooltip content="3 unread" :as="AppIcon" name="bell" aria-label="Notifications" />
```

`clock` and `bell` in these samples are icons of your app's own; ui ships only
a few.

Keyboard users need to reach a tooltip too, so a trigger given by `as` gets
`tabindex="0"`, which makes even an icon focusable. Pass your own `tabindex`
to change that. The tooltip describes the trigger but doesn't name it, so an
icon or an icon-only button still needs its own `aria-label`.

A popover, menu or dialog in the slot works too: the tooltip goes on its
button.

```vue
<AppTooltip content="Bid floor, in USD">
  <AppPopover :as="AppButton" trigger="Bid">…</AppPopover>
</AppTooltip>
```

## Examples

### As a button or an icon

With `as`, the trigger can be a button or an icon instead of text.

::: preview ui/app-tooltip/As
:::

### Sides

`side` is `top` (the default), `right`, `bottom` or `left`. The tooltip flips
to stay on screen. `delay` and `close-delay` set the timing.

::: preview ui/app-tooltip/Sides
:::

### A group

A tooltip waits `delay` before it first shows. Once one is up, the others
open straight away. Move along the toolbar below: only the first tooltip
waits.

All tooltips share this behavior, with a 600 ms delay. To give a set of
tooltips their own timing, wrap them in a `TooltipGroup` from
`@vunset/vue`. It takes `delay` for the first one, `close-delay`, and
`timeout`: how long after the last one hides the others still open at
once.

::: preview ui/app-tooltip/Group
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Tab</kbd> | Focus on the trigger shows it |
| <kbd>Esc</kbd> | Hides it |

## Styling

| Class | On |
| --- | --- |
| `app-tooltip` | The tooltip, with `data-side` and `data-align` |
| `app-tooltip-trigger` | The default trigger, given no `as`: a text button |
| `app-tooltip-arrow` | The arrow, with `data-side` |

For classes on the inner parts, use `trigger-class` and `popup-class` (the
tooltip). See [classes on the inner parts](/ui/theming#classes-on-the-inner-parts).
To fit your own layers above or below it, see [stacking](/ui/theming#stacking).

<<< ../../packages/ui/src/app/app-tooltip.css

## API Reference

### AppTooltip

::: api app/AppTooltip
:::
