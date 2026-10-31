# AppBadge

A small pill for a status, a count or a label, built on
[Badge](/feedback/badge): three variants, the same five tones as
[AppButton](/ui/app-button), three sizes.

::: preview ui/app-badge/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppBadge } from '@vunset/ui';
</script>

<template>
  <AppBadge tone="success">Active</AppBadge>
</template>
```

An icon goes in the default slot, beside the text.

## Examples

### Variants and tones

`variant` is `soft` (the default), `solid` or `outline`; `tone` is `neutral`
(the default), `accent`, `success`, `warning` or `danger`.

::: preview ui/app-badge/Variants
:::

### Sizes

::: preview ui/app-badge/Sizes
:::

## Styling

| Class | On |
| --- | --- |
| `app-badge` | The badge, with `data-variant`, `data-tone` and `data-size` |

The tone's colors are `--ui-tone` and `--ui-on-tone`, from `base.css`, shared
with `AppButton` and `AppAlert`.

<<< ../../packages/ui/src/app/app-badge.css

## API Reference

### AppBadge

::: api app/AppBadge
:::
