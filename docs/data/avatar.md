# Avatar

A picture of a person, with a fallback such as their initials while it loads
or when it can't. The image is loaded before it's shown, so a broken one never
appears.

::: preview avatar/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { AvatarRoot, AvatarImage, AvatarFallback } from '@vunset/vue';
</script>

<template>
  <AvatarRoot>
    <AvatarImage src="/ada.png" alt="Ada Lovelace" />
    <AvatarFallback>AL</AvatarFallback>
  </AvatarRoot>
</template>
```

`AvatarImage` renders only once its image has loaded, and `AvatarFallback`
only until then. Leave the image out for an avatar of initials alone. Every
part carries `data-status`:

| `data-status` | When |
| --- | --- |
| `idle` | There's no `AvatarImage` |
| `loading` | The image is on its way |
| `loaded` | The image is shown |
| `error` | `src` is empty or the image failed to load |

Give the image an `alt`. The fallback is read out as its text, so initials
alone say little: a `title` or visually hidden name helps.

## Examples

### Status and delay

`@status-change` reports each step. `delay` holds the fallback back for that
many milliseconds, so an image that arrives quickly never flashes it first. A
cached image is shown at once.

::: preview avatar/Status
:::

On the server, the fallback is rendered: the image is loaded in the browser.

## API Reference

### AvatarRoot

The element carries `data-part="avatar"` and `data-status`.

::: api avatar/AvatarRoot
:::

### AvatarImage

The element carries `data-part="image"` and `data-status`. `srcset`, `sizes`,
`crossorigin` and `referrerpolicy` are used to load the image as well as to
render it, so the one loaded is the one shown.

::: api avatar/AvatarImage
:::

### AvatarFallback

The element carries `data-part="fallback"` and `data-status`.

::: api avatar/AvatarFallback
:::
