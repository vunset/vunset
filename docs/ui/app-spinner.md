# AppSpinner

A spinner: ui's `spinner` icon, turning, as tall as the line of text and in
its color. [AppToaster](/ui/app-toaster) uses it for loading toasts. In an
[AppButton](/ui/app-button#loading), put it before the label while the button
is `loading`.

::: preview ui/app-spinner/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppSpinner } from '@vunset/ui';
</script>

<template>
  <span><AppSpinner /> Loading orders…</span>
</template>
```

Next to text that says what's loading, it's decoration and screen readers
skip it. On its own, give it a `label` so it's announced. Set its size and
color with a class (`size-8`, a text color). With reduced motion turned on,
it still turns, just slowly.

For something livelier, try [AppDotMatrix](/ui/app-dot-matrix). To use your
own spinner icon, add an icon named `spinner` to your app
([AppIcon](/ui/app-icon)).

## Styling

| Class | On |
| --- | --- |
| `app-spinner` | The icon, turning |

<<< ../../packages/ui/src/app/app-spinner.css

## API Reference

### AppSpinner

::: api app/AppSpinner
:::
