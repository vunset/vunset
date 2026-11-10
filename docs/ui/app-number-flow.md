# AppNumberFlow

A value that animates whenever it changes. A digit that changes rolls to its
new one on a wheel, up as the value grows and down as it shrinks; a character
that's new rises into place out of a blur, and the rest slide over to make
room. Text works too: `Computing…` animates in character by character. For a
figure on a dashboard that refreshes, or a counter.

::: preview ui/app-number-flow/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppNumberFlow } from '@vunset/ui';
</script>

<template>
  <AppNumberFlow :value="revenue" :format="{ style: 'currency', currency: 'USD' }" />
</template>
```

`value` is a number or text. A number is written with `format`
(`Intl.NumberFormat` options) and `locale` (`en-US` by default), or as
`String()` writes it without them. Its digits are matched to the last value's
from the decimal point outwards, so going from `999` to `1,000` rolls the
three nines to zeros and only the `1` and the comma come in.

Figures are tabular, so the width doesn't jitter between values. Under
reduced motion nothing rolls or slides: characters only fade. Assistive
technology reads the whole value once, from a visually hidden copy; the
animated characters are hidden from it.

## Examples

### Counter

A wheel carries on past 9, or back past 0, rather than spinning back through
every digit. `trend` sets the way digits roll when the value's own direction
isn't the one you want: `1` always up, `-1` always down, `0` each digit its
shorter way.

::: preview ui/app-number-flow/Counter
:::

### Text

Text is matched from its digits too: `$1,234.56` rolls like the number would,
`3 files` rolls the `3`. Text without a digit, like `Computing…`, animates
character by character, and switching between it and a value crossfades.
For a number, prefer `value` with `format`: its decimal point is known exactly,
where text's is read from the last `.` or `,`.

::: preview ui/app-number-flow/Text
:::

## Styling

| Class | On |
| --- | --- |
| `app-number-flow` | The root, inline |
| `app-number-flow-text` | The whole value, visually hidden |
| `app-number-flow-chars` | The animated characters, hidden from assistive technology |
| `app-number-flow-char` | Each character, its position in `--app-number-flow-index` |
| `app-number-flow-digit` | A digit's window, with `data-digit` on its character |
| `app-number-flow-wheel` | The column of digits it rolls, at `--app-number-flow-at`, `data-rolling` while it moves |

The transition is `app-number-flow`, so `app-number-flow-enter-from`,
`-enter-active`, `-leave-to` and `-move` restyle it. `--app-number-flow-duration`
and `--app-number-flow-ease` time the rolls and slides.

<<< ../../packages/ui/src/app/app-number-flow.css

## API Reference

### AppNumberFlow

::: api app/AppNumberFlow
:::
