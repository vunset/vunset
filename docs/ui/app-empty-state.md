# AppEmptyState

What a list or a page shows when there is nothing in it yet: an icon, a title,
a line of text, and what to do about it. AppAsyncState draws its loading,
empty and error views with it.

::: preview ui/app-empty-state/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppButton, AppEmptyState } from '@vunset/ui';
</script>

<template>
  <AppEmptyState icon="inbox" title="No projects yet" description="Projects you create show up here.">
    <template #actions>
      <AppButton variant="solid" tone="accent">New project</AppButton>
    </template>
  </AppEmptyState>
</template>
```

Everything is optional.

- `icon` names an [AppIcon](/ui/app-icon), drawn in a soft circle. `inbox`
  above is an icon of your app's own; ui ships only a few. The `#icon` slot
  takes anything instead, like a spinner or an illustration.
- `title` and `description` have slots of the same names.
- The default slot goes under the text.
- `#actions` is a row of buttons at the bottom.

## Examples

### Tones

`tone` colors the icon and its circle, as on a button: `neutral` (muted, the
default), `accent`, `success`, `warning` or `danger`.

::: preview ui/app-empty-state/Tones
:::

## Styling

| Class | On |
| --- | --- |
| `app-empty-state` | The root, with `data-tone` |
| `app-empty-state-icon` | The circle around the icon |
| `app-empty-state-title` | The title |
| `app-empty-state-description` | The text |
| `app-empty-state-actions` | The row of buttons |

<<< ../../packages/ui/src/app/app-empty-state.css

## API Reference

### AppEmptyState

::: api app/AppEmptyState
:::
