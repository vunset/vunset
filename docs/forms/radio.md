# Radio

A group of radios where you choose one. You style them any way you like: a
hidden native radio beside each sends the group's value with your forms, and the
state shows up as `data-*` attributes.

::: preview radio/Basic
:::

## Anatomy

A group, its radios, and the indicator that shows in the chosen one.

```vue
<script setup lang="ts">
import { RadioGroup, RadioRoot, RadioIndicator } from '@vunset/vue';
</script>

<template>
  <RadioGroup>
    <RadioRoot value="a">
      <RadioIndicator />
    </RadioRoot>
  </RadioGroup>
</template>
```

Bind the chosen value with `v-model` on the group. Give the group a name for
screen readers with `aria-label` or `aria-labelledby`.

Each `RadioRoot` is a real `<button>`, which is what lets a `<label>` around
it name the radio. Where a button can't go, inside another button or a link,
use `as="span"` and give it an `aria-label` or `aria-labelledby` instead.

## Examples

### Uncontrolled

Without `v-model`, the group keeps track of the choice itself, starting from
`default-value`. Give it a `name` and a form submits it.

::: preview radio/Uncontrolled
:::

### Disabled radio

A disabled radio can't be chosen, and arrow keys skip it.

::: preview radio/Disabled
:::

## Keyboard

The whole group is one stop when you tab through the page: the chosen radio,
or the first enabled one when nothing is chosen. The arrow keys move the
choice. In a read-only group they do nothing.

| Key | Does |
| --- | --- |
| <kbd>↓</kbd> <kbd>→</kbd> / <kbd>↑</kbd> <kbd>←</kbd> | Next or previous radio, checking it, wrapping at the ends unless `loop` is off |
| <kbd>Home</kbd> <kbd>End</kbd> | First or last radio, checking it |
| <kbd>Space</kbd> <kbd>Enter</kbd> | Check the focused radio |

## API Reference

### RadioGroup

The element carries `data-part="radio-group"` and `role="radiogroup"`.

::: api radio/RadioGroup
:::

### RadioRoot

The element carries `data-part="root"` and its value as `data-value`. The
`root` name is shared with other components, so scope a `[data-part]`
selector with a class of your own.

::: api radio/RadioRoot
:::

### RadioIndicator

The indicator is only rendered while its radio is chosen, and stays through
its exit animation. `keep-mounted` keeps it rendered all the time.

The element carries `data-part="indicator"`.

::: api radio/RadioIndicator
:::
