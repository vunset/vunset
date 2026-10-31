# Badge

A small label, like a count or a status. It renders a `span` with
`data-part="badge"`, and leaves its look to you.

::: preview badge/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { Badge } from '@vunset/vue';
</script>

<template>
  <Badge />
</template>
```

## Examples

### Your own look

The badge has no variants or sizes of its own: name yours in an attribute or a
class, and style that. These demos use `data-variant`, so
`[data-variant="soft"]` and the like:

```vue
<Badge data-variant="soft">Beta</Badge>
```

## API Reference

The element carries `data-part="badge"`.

::: api badge/Badge
:::
