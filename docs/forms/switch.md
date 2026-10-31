# Switch

An on/off switch you style any way you like. A hidden checkbox beside it sends
its value with your forms, and its state shows up as `data-*` attributes.

::: preview switch/Basic
:::

## Anatomy

A root and the thumb that slides inside it.

```vue
<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from '@vunset/vue';
</script>

<template>
  <SwitchRoot>
    <SwitchThumb />
  </SwitchRoot>
</template>
```

The root is a real `<button>`, which is what lets a `<label>` around it name
the switch. Where a button can't go, inside another button or a link, use
`as="span"` and give it an `aria-label` or `aria-labelledby` instead.

## Examples

### Controlled

`v-model` owns the state. Without it, the switch keeps its own, starting from
`default-checked`.

::: preview switch/Controlled
:::

### Custom values

`true-value` and `false-value` set what `v-model` holds while on and off.

In a form, give it a `name`: while it's on, it submits `value` (`on` by
default). It submits nothing while it's off, unless you set
`unchecked-value`.

::: preview switch/CustomValues
:::

### Read-only

A read-only switch stays focusable and announced, but can't be changed.

::: preview switch/ReadOnly
:::

### Disabled

A disabled switch can't be changed, and isn't sent with the form.

::: preview switch/Disabled
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Space</kbd> | Toggle it, on release |
| <kbd>Enter</kbd> | Toggle it |

## API Reference

Inside a `FieldRoot`, the switch takes the field's `name`, id, and disabled,
read-only and invalid state.

### SwitchRoot

The element carries `data-part="root"`.

A hidden `<input>` right after it carries the value to a form. It's rendered only
when the switch has a `name` or sits inside a `<label>`, so an unnamed one, like
a table's row checkbox, adds nothing to the page. The input is positioned
absolutely, so give the root's parent `position: relative` to keep it
inside a scrolling container.

::: api switch/SwitchRoot
:::

### SwitchThumb

The element carries `data-part="thumb"`.

::: api switch/SwitchThumb
:::
