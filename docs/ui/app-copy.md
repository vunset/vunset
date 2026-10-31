# AppCopy

A button that copies a value to the clipboard, and says so for a moment. Built
on [Copy](/actions/copy): a ghost [AppButton](/ui/app-button), its copy icon
turning into a check once the text is on the clipboard.

::: preview ui/app-copy/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppCopy } from '@vunset/ui';
</script>

<template>
  <AppCopy value="npm install @vunset/ui" />
  <AppCopy value="https://…" label="Copy link" />
</template>
```

Without a `label`, it's a square icon button that screen readers call "Copy".
With one, the text sits next to the icon. `timeout` is how long it shows the
check, 1500 ms by default. Each press emits `copy`, with whether the text
reached the clipboard.

`variant`, `tone` and `size` work as on [AppButton](/ui/app-button). It's a
ghost, neutral button unless you change them.

The icons are ui's `copy` and `copy-done`. Add an icon with either name to
your app to replace them, here and everywhere else ui uses them (see
[AppIcon](/ui/app-icon)).

## Styling

| Class | On |
| --- | --- |
| `app-copy` | The button, an `app-button`, with `data-copied` for a moment after a copy |
| `app-copy-icon` | Each icon, `data-active` on the one showing |

<<< ../../packages/ui/src/app/app-copy.css

## API Reference

### AppCopy

::: api app/AppCopy
:::
