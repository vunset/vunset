# AppAppear

Content that fades in, rising a little, and fades out again. Built on
[Appear](/utilities/appear).

::: preview ui/app-appear/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppAppear } from '@vunset/ui';
</script>

<template>
  <AppAppear :open="saved">
    <AppAlert tone="success" title="Draft saved" />
  </AppAppear>
</template>
```

`open` shows and hides it. It's `true` by default, so an `<AppAppear>` under
a `v-if` animates in as it mounts, and out before it's removed.

Hidden content is removed from the page. Add `keep-mounted` to keep it there
with the `hidden` attribute instead. `as` renders another element. The
animation takes `--ui-duration`, and with reduced motion it only fades.

## Examples

### First render

Content that's already open when it mounts animates in too. Pass
`:appear="false"` to show it without animating.

::: preview ui/app-appear/FirstRender
:::

### The class alone

Put `app-appear` on an [Appear](/utilities/appear) you already have to give
it the same animation.

::: preview ui/app-appear/Class
:::

## Styling

| Class | On |
| --- | --- |
| `app-appear` | The element, with Appear's `data-open`, `data-enter-from` and `data-leave-to` |

<<< ../../packages/ui/src/app/app-appear.css

## API Reference

### AppAppear

::: api app/AppAppear
:::
