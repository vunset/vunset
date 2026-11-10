# One-time code

A short code typed one character per box: a sign-in code from a message, a
PIN. It's one value, `v-model` holds the whole code, and the boxes are parts
you place. Put them in a [Group](/layout/group) to join them.

::: preview otp/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { OtpRoot, OtpInput } from '@vunset/vue';
</script>

<template>
  <OtpRoot v-slot="{ length }" v-model="code">
    <OtpInput v-for="index in length" :key="index" :index="index - 1" />
  </OtpRoot>
</template>
```

Each `OtpInput` is an `<input>` holding the character at its `index`. `length`
(6 by default) is how many there are; the root's slot hands it back.

- Typing moves to the next box, Backspace back through the code, and the arrow
  keys between boxes. Focus never lands past the first empty box, so the code
  is always typed from the start.
- A paste, or a code the phone offers from a message, fills every box at once.
  The first box has `autocomplete="one-time-code"` for that.
- `@complete` fires with the code once every box is filled.

## Examples

### Joined, in groups

The boxes are plain siblings. A `Group` around some of them joins them, here
two groups of three around a dash. `type="alphanumeric"` takes letters as well
as digits.

::: preview otp/Joined
:::

### In a field

Inside a [Field](/forms/field) the label focuses the first box, and the field's
`name` submits the whole code through a hidden input. `mask` hides the
characters.

::: preview otp/InField
:::

## What a box takes

`type` is `numeric` (digits, the default) or `alphanumeric`. For anything else,
`filter` tests one character: a regex source, a RegExp or a function. Anything
it refuses is dropped, from typing, pasting or autofill alike.

```vue
<OtpRoot filter="[A-F0-9]" />
```

## Accessibility

The root is a `role="group"`, labeled by its field. Each box is named by
`get-input-label`, `Character 1 of 6` by default; pass your own to translate
it:

```vue
<OtpRoot :get-input-label="(index, length) => `Ziffer ${index + 1} von ${length}`" />
```

## API Reference

### OtpRoot

The element carries `data-part="otp"`, `role="group"`, and `data-filled`,
`data-complete`, `data-focused`, `data-invalid`, `data-disabled`,
`data-readonly` and `data-required`.

::: api otp/OtpRoot
:::

### OtpInput

The element carries `data-part="input"`, `data-index`, the root's state, and
its own `data-filled` and `data-focused`.

::: api otp/OtpInput
:::
