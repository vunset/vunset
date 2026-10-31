# AppAccordion

Sections that open one at a time, or several at once: an FAQ, a settings
list. It looks like [AppCollapsible](/ui/app-collapsible). Built on
[Accordion](/layout/accordion).

::: preview ui/app-accordion/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppAccordion } from '@vunset/ui';

const sections = [
  { value: 'shipping', title: 'How long does shipping take?' },
  { value: 'returns', title: 'Can I return an order?' }
];
</script>

<template>
  <AppAccordion :sections="sections" :default-value="['shipping']">
    <template #shipping>…</template>
    <template #returns>…</template>
  </AppAccordion>
</template>
```

Each section is `{ value, title, disabled }`. Its content goes in the slot
named after its `value`. The `#panel` slot covers any section without its
own slot, `#title` replaces a section's heading and `#icon` its chevron. Each
gets the `section` and whether it's `open`.

`v-model` holds the values of the open sections, always as an array, even
when only one can be open. Opening a section closes the others, unless you
pass `multiple`. Up and Down move between the headings, Home and End jump to
the first and last.

## Styling

| Class | On |
| --- | --- |
| `app-accordion` | The root |
| `app-accordion-section` | Each section, ruled off below |
| `app-accordion-header` | The heading around a trigger |

The heading row, chevron and panel use [AppCollapsible's classes](/ui/app-collapsible#styling).
`section-class`, `trigger-class` and `panel-class` add classes to each
section, heading row and content. See
[classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

## API Reference

### AppAccordion

::: api app/AppAccordion
:::
