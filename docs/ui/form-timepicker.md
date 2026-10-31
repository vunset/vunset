# FormTimepicker

A field for a time of day, with its label, help text and error message. Type
the hours and minutes, or press the clock to pick them from columns. It's
built on [Timepicker](/forms/timepicker).

Attributes like `aria-label` or `data-*` go on the segments' group.

::: preview ui/form-timepicker/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormTimepicker } from '@vunset/ui';

const time = ref<string | null>(null);
</script>

<template>
  <FormTimepicker v-model="time" label="Meeting" />
</template>
```

The value is `'HH:mm'`, 24-hour, or `null` while empty. It's written once
both hours and minutes are filled. There's no clear button by default: add
`clearable` to show one while there's a value.

The columns open as soon as the field gets focus, and you can keep typing
while they follow. The clock opens them too, moving focus into the hours
column. `:open-on-focus="false"` leaves opening to the clock alone.

The columns snap, so scrolling always comes to rest with a value in the
middle. Scrolling only looks around: a click or a key picks.

## Examples

### Seconds

`seconds` adds a seconds segment and column, and the value becomes
`'HH:mm:ss'`.

::: preview ui/form-timepicker/Seconds
:::

### 12-hour

`:hour-cycle="12"` shows the hour as 12, 01–11 with an AM/PM segment and
column. The value is still 24-hour, `'19:15'` for 07:15 PM, and is written
once AM or PM is set. Type <kbd>A</kbd> or <kbd>P</kbd> on it; `period-labels`
renames them.

::: preview ui/form-timepicker/TwelveHour
:::

### Min and max

`min` and `max` disable the column values outside them, and the arrows skip
those values. A time typed outside is kept, and the field shows as invalid
until it's back inside.

::: preview ui/form-timepicker/Bounds
:::

### Disabled, read-only and required

Disabled ignores everything. Read-only shows the time and lets you move
between the segments, but changes nothing and opens no popup.

::: preview ui/form-timepicker/States
:::

## API Reference

### FormTimepicker

The box carries `form-control form-timepicker`. The popup carries
`form-timepicker-popup`, its columns `form-timepicker-column`, and the
colons between them `form-timepicker-separator`.

::: api form/FormTimepicker
:::
