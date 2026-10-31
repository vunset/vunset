# AppIcon

An [Icon](/utilities/icon) as tall as the line it sits in. Every icon in
`@vunset/ui`, from a close button to a chevron, is an `AppIcon`. ui ships
its own small set, so there's nothing to configure. If your app has an icon
with the same name, it replaces ui's everywhere.

::: preview ui/app-icon/Set
:::

## Usage

```vue
<script setup lang="ts">
import { AppIcon } from '@vunset/ui';
</script>

<template>
  <AppIcon name="check" />
</template>
```

Your own icons come from your sprite, so a page with hundreds of them still
references one file. Pass `inline` to put an icon's file from your icons
folder in the page instead. ui's own names in the set above are always drawn
inline, since your sprite doesn't have them. If a name is in neither your
folder nor ui's set, it shows the default slot, if you gave one, and
otherwise the symbol from your sprite.

## Your icons over ui's

Add a file with the same name as one of ui's icons, and every component
uses yours instead. A `close.svg` in your icons folder changes the close
button on every dialog, drawer, alert and toast.

Icons only one component uses have names of their own (`listbox-indicator`,
`copy-done`), so a generic icon of yours doesn't replace them by accident.
`alert-info`, `alert-success`, `alert-warning` and `alert-danger` are used by
AppAlert and the toaster.

```ts
import { configureIcons } from '@vunset/vue';

configureIcons({
  inline: import.meta.glob('./icons/*.svg', { query: '?raw', import: 'default' })
});
// ./icons/chevron-down.svg and ./icons/close.svg now replace ui's, wherever ui draws them
```

This works only with inline icons, not a sprite, because there's no way to
ask a sprite which icons it has. Names that only your sprite has still come
from it.

## Sizing

The icon is `1lh` square, as tall as the line around it, so it matches the
text in a button, a heading or a caption without you sizing it. Set another
size with a class (`class="size-4"`). Browsers that don't support `lh` get
`1em`.

::: preview ui/app-icon/Sizing
:::

## Styling

| Class | On |
| --- | --- |
| `app-icon` | The icon: `1lh` square |

The icons are stroked with `currentColor`, so they take the text's color.

## API Reference

### AppIcon

::: api app/AppIcon
:::
