# Deferred

Stands a plain element in for something heavier, and mounts the real thing
only when someone goes for it. A table with an editing popover in every row
draws one button per row, not one popover.

::: preview deferred/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { Deferred, PopoverRoot, PopoverTrigger } from '@vunset/vue';
</script>

<template>
  <Deferred>
    <template #default="{ pressed }">
      <PopoverRoot :default-open="pressed">
        <PopoverTrigger>Edit</PopoverTrigger>
        …
      </PopoverRoot>
    </template>

    <template #placeholder>
      <button type="button">Edit</button>
    </template>
  </Deferred>
</template>
```

The placeholder is one element or component, rendered with no wrapper. Make
it look like the real trigger: the swap should not show.

## When it mounts

A pointer entering the placeholder mounts the content in its place, before
the press. The press then lands on the real trigger, which opens as it always
does.

A press with no pointer first, from <kbd>Enter</kbd> or <kbd>Space</kbd>,
mounts it with `pressed` set: pass that to `default-open`, and it opens as it
mounts. A popover opened this way gives focus back to its own trigger when it
closes.

Once mounted it stays, so it can animate out. `eager` mounts it at once,
for a row that should start open.

## API Reference

### Deferred

The placeholder carries `data-part="deferred"`, unless it sets a `data-part`
of its own.

::: api deferred/Deferred
:::
