# AppProgress

How far along a task is: a label, its value, and a bar. Built on
[Progress](/feedback/progress); [AppMeter](/ui/app-meter) has the same look
for a reading that isn't progress.

::: preview ui/app-progress/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppProgress } from '@vunset/ui';
</script>

<template>
  <AppProgress :value="done" :max="24" label="Uploading files" />
</template>
```

`value` runs from `min` (0) to `max` (100). `null` means there's no telling how
far along it is: the bar sweeps across, and it leaves out `aria-valuenow`,
which is how a screen reader knows a progress bar is indeterminate.

`label` names it, for a screen reader too, and `show-value` (on by default)
writes the value beside it, in `format`'s style: `{ style: 'percent' }` with
a `max` of 1, `{ style: 'unit', unit: 'megabyte' }`. `get-value-text` changes
what a screen reader hears: "3 of 24 files" rather than "3". `tone` colors the
bar.

## Styling

| Class | On |
| --- | --- |
| `app-gauge`, `app-progress` | The root, with `data-tone` and `--gauge-percentage` |
| `app-gauge-header` | The label and value row |
| `app-gauge-label` | The label |
| `app-gauge-value` | The value |
| `app-gauge-track` | The track |
| `app-gauge-indicator` | The bar, with `data-status`: `indeterminate`, `progressing`, `complete` |

`track-class` adds classes of your own to the track: `class="h-1"` for a
thinner bar. The stylesheet is shared with AppMeter.

<<< ../../packages/ui/src/app/app-gauge.css

## API Reference

### AppProgress

::: api app/AppProgress
:::
