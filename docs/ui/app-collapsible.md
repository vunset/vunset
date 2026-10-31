# AppCollapsible

A row that opens to show more, and closes again. For a set where only one is
open at a time, use [AppAccordion](/ui/app-accordion). Built on
[Collapsible](/layout/collapsible).

::: preview ui/app-collapsible/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppCollapsible } from '@vunset/ui';
</script>

<template>
  <AppCollapsible title="Order details">…</AppCollapsible>
</template>
```

`title` is the row's text. The `#trigger` slot takes markup instead, and
`#icon` replaces the chevron; both get `open`. A replacement leaves the
chevron's class behind, so it is neither muted nor turned unless you style it.
The default slot is what opens.

Bind `v-model:open` to control it, or pass `default-open` to start it open.
The panel slides and the chevron turns, unless the user prefers reduced
motion.

The content is removed from the page while closed. Add `keep-mounted` to
keep it, so find-in-page reaches it or its state survives.

## Examples

### Text in place of the chevron

::: preview ui/app-collapsible/Icon
:::

## Styling

| Class | On |
| --- | --- |
| `app-collapsible` | The root |
| `app-collapsible-trigger` | The trigger row, with `data-open` |
| `app-collapsible-title` | Its text |
| `app-collapsible-chevron` | The chevron, an [AppIcon](/ui/app-icon) `chevron-down`, turned while open |
| `app-collapsible-panel` | The panel, which slides by `--collapsible-panel-height` |
| `app-collapsible-content` | The content's padding |

`trigger-class` and `panel-class` add classes to the trigger row and the
content. See [classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/app/app-collapsible.css

## API Reference

### AppCollapsible

::: api app/AppCollapsible
:::
