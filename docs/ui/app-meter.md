# AppMeter

A reading within a known range, such as disk used, a score or a battery. Built
on [Meter](/feedback/meter), with [AppProgress's](/ui/app-progress) look.

::: preview ui/app-meter/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppMeter } from '@vunset/ui';
</script>

<template>
  <AppMeter :value="78" label="Photos" :format="{ style: 'unit', unit: 'percent' }" tone="warning" />
</template>
```

A meter is a `role="meter"`: it reads as a measurement, not as a task getting
done, which is what AppProgress is for. It takes the same props, less the
`null` value: a reading always has one.

`tone` is the app's to choose from the value. The demo turns it amber past 70%
and red past 90%.

## Styling

It shares AppProgress's classes, with `app-meter` on the root in place of
`app-progress`: see [AppProgress](/ui/app-progress#styling).

## API Reference

### AppMeter

::: api app/AppMeter
:::
