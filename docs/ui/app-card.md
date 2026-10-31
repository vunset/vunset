# AppCard

A bordered panel: a header with a title, a description and actions, the body,
and a footer for the card's buttons.

::: preview ui/app-card/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppButton, AppCard } from '@vunset/ui';
</script>

<template>
  <AppCard title="Pro plan" description="Billed monthly.">
    <p>$24 / month</p>

    <template #footer>
      <AppButton variant="solid" tone="accent">Upgrade</AppButton>
    </template>
  </AppCard>
</template>
```

Each part shows only when it has something: the header with a `title`,
`description` or `#actions`, the body with the default slot, the footer with
`#footer`. The `#title` and `#description` slots take markup instead of the
props, and `#header` replaces the whole header. `class` and other attributes
go on the card, and `header-class`, `body-class` and `footer-class` on its
parts (see [classes on the inner parts](/ui/theming#classes-on-the-inner-parts)).

## Examples

### A card as a link

`as="a"` (or `button`, or a router link) makes the whole card the link; its
border lifts on hover, and it takes a focus ring.

::: preview ui/app-card/Link
:::

## Styling

| Class | On |
| --- | --- |
| `app-card` | The card |
| `app-card-header` | The header row: the heading and the actions |
| `app-card-heading` | The title and description |
| `app-card-title` | The title |
| `app-card-description` | The description |
| `app-card-actions` | The actions, at the header's end |
| `app-card-body` | The body |
| `app-card-footer` | The footer, set apart by a line, its buttons at the end |

<<< ../../packages/ui/src/app/app-card.css

## API Reference

### AppCard

::: api app/AppCard
:::
