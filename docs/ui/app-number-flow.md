# AppNumberFlow

A value that animates in a character at a time whenever it changes: each one
rises into place out of a blur, a few milliseconds after the one before it.
For a figure on a dashboard that refreshes.

::: preview ui/app-number-flow/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppNumberFlow } from '@vunset/ui';
import { formatCurrency } from '@vunset/utils';
</script>

<template>
  <AppNumberFlow :value="formatCurrency(revenue)" />
</template>
```

`value` is a number or text already formatted; every character animates,
so `$`, separators and spaces flow with the digits. The old value goes at
once. `appear` animates the first value too. Figures are tabular, so the
width doesn't jitter between values; under reduced motion it only fades.

Assistive technology reads the whole value once, from a visually hidden copy;
the animated characters are hidden from it.

## Styling

| Class | On |
| --- | --- |
| `app-number-flow` | The root, inline |
| `app-number-flow-text` | The whole value, visually hidden |
| `app-number-flow-chars` | The animated characters, hidden from assistive technology |
| `app-number-flow-char` | Each character, its position in `--app-number-flow-index` |

The transition is `app-number-flow`, so `app-number-flow-enter-from` and
`-enter-active` restyle it.

<<< ../../packages/ui/src/app/app-number-flow.css

## API Reference

### AppNumberFlow

::: api app/AppNumberFlow
:::
