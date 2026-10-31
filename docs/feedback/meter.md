# Meter

A reading within a known range: disk space, a battery level, a score. It's
a `role="meter"`, and it always has a value. To show how far along a task is,
use [Progress](/feedback/progress) instead.

::: preview meter/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { MeterRoot, MeterLabel, MeterValue, MeterTrack, MeterIndicator } from '@vunset/vue';
</script>

<template>
  <MeterRoot :value="72">
    <MeterLabel />
    <MeterValue />
    <MeterTrack>
      <MeterIndicator />
    </MeterTrack>
  </MeterRoot>
</template>
```

`value` is required. Nothing is drawn for you: the root sets
`--gauge-percentage`, and you size the indicator from it in your stylesheet,
the same way as [Progress](/feedback/progress#anatomy). The root also sets
`--gauge-value`, `--gauge-min` and `--gauge-max` if you need the raw numbers.

A meter never finishes or goes indeterminate, so its `data-status` is always
`progressing`.

## Examples

### Formatting

`format` takes `Intl.NumberFormat` options. They apply both to `MeterValue`
and to what screen readers read out, and `locale` picks the locale. To show
more than the number, use `MeterValue`'s slot, which gets the formatted value.

Watch out for percentages: `style: 'percent'` expects a fraction (`0.72`). For
a value that's already in percent (`72`), use
`{ style: 'unit', unit: 'percent' }`.

::: preview meter/Format
:::

### A ring

Just the root and the value: `--gauge-percentage` sets the angle of a conic
gradient. `MeterLabel` is still there to name it, visually hidden.

::: preview meter/Ring
:::

### Vertical

Which way it fills is up to your stylesheet. Here `--gauge-percentage` sets
the indicator's height, from the bottom of the track, instead of its width.

::: preview meter/Vertical
:::

## API Reference

### MeterRoot

The element carries `data-part="gauge"`, `data-status`, `role="meter"`, and
`aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`. It's
labeled by `MeterLabel`.

Progress uses `data-part="gauge"` too, so to style the two differently, use a
class or `[role="meter"]`.

::: api meter/MeterRoot
:::

### MeterLabel

The element carries `data-part="label"`.

::: api meter/MeterLabel
:::

### MeterValue

The element carries `data-part="value"`.

::: api meter/MeterValue
:::

### MeterTrack

The element carries `data-part="track"` and `data-status`.

::: api meter/MeterTrack
:::

### MeterIndicator

The element carries `data-part="indicator"` and `data-status`.

::: api meter/MeterIndicator
:::
