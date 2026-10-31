# Accordion

A stack of sections that open and close. Opening one closes the others,
unless you set `multiple`. Each item works like a
[Collapsible](/layout/collapsible), and the arrow keys move between them.

::: preview accordion/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel } from '@vunset/vue';
</script>

<template>
  <AccordionRoot>
    <AccordionItem value="a">
      <AccordionHeader>
        <AccordionTrigger />
      </AccordionHeader>
      <AccordionPanel />
    </AccordionItem>
  </AccordionRoot>
</template>
```

Which items are open is always an array of their `value`s, even when only
one can be open. Bind it with `v-model`, or start from `default-value`:

```vue
<AccordionRoot v-model="open">…</AccordionRoot>
<!-- const open = ref(['a']) -->
```

The panels animate their height the same way as a
[Collapsible's](/layout/collapsible#animating-the-height).

Every part has a `data-part`: `accordion`, `accordion-item`,
`accordion-header`, `accordion-trigger` and `accordion-panel`. The item, its
header, trigger and panel also carry `data-open` or `data-closed`, and
`data-disabled` when the item is disabled.

## Examples

### Multiple

With `multiple`, opening an item leaves the others as they are.

::: preview accordion/Multiple
:::

### Disabled item

A disabled item can't be opened or closed, and the arrow keys skip it.

::: preview accordion/Disabled
:::

## Keyboard

Each trigger is its own tab stop.

| Key | Does |
| --- | --- |
| <kbd>↓</kbd> <kbd>↑</kbd> | Next or previous trigger (<kbd>→</kbd> <kbd>←</kbd> when horizontal). Wraps around at the ends, unless `loop` is `false` |
| <kbd>Home</kbd> <kbd>End</kbd> | First or last trigger |
| <kbd>Enter</kbd> <kbd>Space</kbd> | Open or close the focused item |

## API Reference

### AccordionRoot

::: api accordion/AccordionRoot
:::

### AccordionItem

::: api accordion/AccordionItem
:::

### AccordionHeader

A heading around the trigger, so the sections show up in the page's outline.
Set `as` to the heading level that fits your page. The element carries
`data-part="accordion-header"`.

::: api accordion/AccordionHeader
:::

### AccordionTrigger

Works like the [Collapsible's trigger](/layout/collapsible), and carries
`data-part="accordion-trigger"`.

::: api collapsible/CollapsibleTrigger
:::

### AccordionPanel

Works like the [Collapsible's panel](/layout/collapsible), and carries
`data-part="accordion-panel"`. It's also a `role="region"`, labeled by its
trigger.

::: api collapsible/CollapsiblePanel
:::
