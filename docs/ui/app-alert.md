# AppAlert

A message in a tinted panel: an icon, a title and a description, with room for
actions and a close button. Built on [Alert](/feedback/alert), in the same
five tones as [AppButton](/ui/app-button).

::: preview ui/app-alert/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppAlert } from '@vunset/ui';
</script>

<template>
  <AppAlert tone="danger" title="Payment failed" description="Your card was declined." />
</template>
```

`title` is the alert's heading and `description` (or the default slot) its
text. Screen readers get both as its name and description. The `#title` and
`#icon` slots replace those parts, and `:icon="false"` leaves the icon out.

An alert has `role="alert"`, so a screen reader reads it out as soon as it
appears. That suits a message that just arrived, like a failed save. For one
that's simply part of the page, pass `role="status"` or `role="none"`.

## Examples

### Tones

`tone` is `neutral` (the default), `accent`, `success`, `warning` or `danger`.
Each draws its own icon. Leave out the title and the description reads as the
whole message.

::: preview ui/app-alert/Tones
:::

### Actions

`#actions` puts buttons under the text.

::: preview ui/app-alert/Actions
:::

### Closable

`closable` adds a close button, labeled by `close-label` ("Dismiss" by
default). Clicking it emits `close`, and removing the alert is up to you.

::: preview ui/app-alert/Closable
:::

## Styling

| Class | On |
| --- | --- |
| `app-alert` | The panel, with `data-tone` |
| `app-alert-icon` | The icon |
| `app-alert-body` | The title, description and actions |
| `app-alert-title` | The title |
| `app-alert-description` | The description |
| `app-alert-actions` | The actions |
| `app-alert-close` | The close button, a plain `<button>` |

<<< ../../packages/ui/src/app/app-alert.css

## API Reference

### AppAlert

::: api app/AppAlert
:::
