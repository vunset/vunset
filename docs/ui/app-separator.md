# Separator

A class, not a component. Put `app-separator` on a
[Separator](/utilities/separator) to draw a thin line in the border color,
across its parent or, when vertical, down it.

::: preview ui/app-separator/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { Separator } from '@vunset/vue';
</script>

<template>
  <Separator class="app-separator" />
  <Separator orientation="vertical" class="app-separator" />
</template>
```

A separator is horizontal by default. Inside a [Group](/layout/group) it runs
across the group's direction, so separators in a toolbar stand upright
without you setting anything. A vertical one is as tall as its row, so give
the row a height. Space it with the parent's `gap` or your own margin.

[AppMenu](/ui/app-menu)'s separators are the same line, and a `Separator`
directly inside an [AppGroup](/ui/app-group) gets it without the class.

## Styling

| Class | On |
| --- | --- |
| `app-separator` | A `Separator`, either orientation |

<<< ../../packages/ui/src/app/app-separator.css
