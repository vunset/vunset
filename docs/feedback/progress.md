# Progress

How far along a task is: an upload, an export, a set of steps. It's a
`role="progressbar"`. For a reading that isn't a task, like disk space, use
[Meter](/feedback/meter) instead.

::: preview progress/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { ProgressRoot, ProgressLabel, ProgressValue, ProgressTrack, ProgressIndicator } from '@vunset/vue';
</script>

<template>
  <ProgressRoot :value="40">
    <ProgressLabel />
    <ProgressValue />
    <ProgressTrack>
      <ProgressIndicator />
    </ProgressTrack>
  </ProgressRoot>
</template>
```

`value` is required (`null` counts, see below). Nothing is drawn for you:
the root sets `--gauge-percentage`, and you size the indicator from it in your
stylesheet. A ring's angle or anything else works the same way.

```css
.indicator {
  width: var(--gauge-percentage);
}
```

The root also sets `--gauge-value`, `--gauge-min` and `--gauge-max` if you
need the raw numbers.

The root, the track and the indicator all carry `data-status`, so you can
style each stage:

| `data-status` | When |
| --- | --- |
| `progressing` | Between `min` and `max` |
| `complete` | At `max` |
| `indeterminate` | `value` is `null` |

## Examples

### Indeterminate

Set `value` to `null` when you can't tell how far along it is yet. There's
no percentage then, and screen readers hear "indeterminate" instead of a
number. Animate a sweep from `[data-status="indeterminate"]` instead.

::: preview progress/Indeterminate
:::

### Value text

`min` and `max` set the range. Screen readers read out the formatted value.
To give them a sentence instead, pass `get-value-text`. What `ProgressValue`
shows on screen can be different again, through its slot.

::: preview progress/ValueText
:::

## Formatting

`format` and `locale` work the same as on Meter. See
[Meter's formatting](/feedback/meter#formatting).

## API Reference

### ProgressRoot

The element carries `data-part="gauge"`, `data-status`, `role="progressbar"`,
and `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`.
It's labeled by `ProgressLabel`.

Meter uses `data-part="gauge"` too, so to style the two differently, use a
class or `[role="progressbar"]`.

::: api progress/ProgressRoot
:::

### ProgressLabel

The element carries `data-part="label"`.

::: api progress/ProgressLabel
:::

### ProgressValue

The element carries `data-part="value"`.

::: api progress/ProgressValue
:::

### ProgressTrack

The element carries `data-part="track"` and `data-status`.

::: api progress/ProgressTrack
:::

### ProgressIndicator

The element carries `data-part="indicator"` and `data-status`.

::: api progress/ProgressIndicator
:::
