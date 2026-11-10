# AppAvatar

A round picture of a person, built on [Avatar](/data/avatar). When the image
is missing or fails, it shows the initials of `title`, a `fallback` text, or
`N/A`.

::: preview ui/app-avatar/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppAvatar } from '@vunset/ui';
</script>

<template>
  <AppAvatar src="/ada.png" title="Ada Love" initials />
</template>
```

`title` says whose avatar it is: it's the hover text, and what a screen reader
hears, for the image and the fallback alike. Pass `alt` when that should be
something else.

## Examples

### Fallbacks

What shows without an image, first match wins:

1. the `#fallback` slot;
2. the initials of `title`, with `initials`: the first and the last word's, so
   `Ada King Love` is `AL`;
3. `fallback`, `N/A` unless you pass your own.

```vue
<AppAvatar src="/broken.png" title="Ada Love" initials /> <!-- AL -->
<AppAvatar title="Ada Love" initials />                   <!-- AL -->
<AppAvatar fallback="AL" />                                <!-- AL -->
<AppAvatar src="/broken.png" />                            <!-- N/A -->
```

::: preview ui/app-avatar/Fallbacks
:::

The initials come from `getInitials` in [`@vunset/utils`](/helpers/strings#initials),
if you need them elsewhere.

### Sizes and shape

`size` is `sm`, `md` (the default) or `lg`. Add the `app-avatar-square` class
for rounded corners in place of a circle.

::: preview ui/app-avatar/Sizes
:::

## Styling

| Class | On |
| --- | --- |
| `app-avatar` | The avatar, with `data-size` and `data-status` |
| `app-avatar-square` | Add it for a rounded square |
| `app-avatar-image` | The image; add yours with `image-class` |
| `app-avatar-fallback` | The fallback; add yours with `fallback-class` |

<<< ../../packages/ui/src/app/app-avatar.css

## API Reference

### AppAvatar

::: api app/AppAvatar
:::
