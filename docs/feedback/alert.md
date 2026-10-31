# Alert

A message on the page, like something that just happened or something the
user should know. Screen readers announce it as soon as it appears. It's a
`role="alert"`, named by its title and described by its description.

::: preview alert/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { AlertRoot, AlertTitle, AlertDescription } from '@vunset/vue';
</script>

<template>
  <AlertRoot>
    <AlertTitle />
    <AlertDescription />
  </AlertRoot>
</template>
```

An alert is announced when it's added to the page. So render it when the
message comes up, rather than keeping it on the page hidden and showing it
later.

If the message isn't urgent, pass `role="status"` yourself. Screen readers then
wait until the user is idle before reading it:

```vue
<AlertRoot role="status">…</AlertRoot>
```

## Examples

### Kinds of message

What kind of message it is, like info, success or error, is yours to name.
Put it in an attribute or a class, and style that, like `[data-variant="error"]`:

```vue
<AlertRoot data-variant="error">…</AlertRoot>
```

### An icon and a heading

Put an icon inside, beside the title. `AlertTitle` renders a `div`. Give it
`as="h3"` to make it a real heading, so the alert shows up in the page's
outline.

::: preview alert/Icon
:::

## API Reference

### AlertRoot

The element carries `data-part="alert"` and `role="alert"`.

::: api alert/AlertRoot
:::

### AlertTitle

The element carries `data-part="title"` and the id the alert is labeled by.

::: api alert/AlertTitle
:::

### AlertDescription

The element carries `data-part="description"` and the id the alert is
described by.

::: api alert/AlertDescription
:::
