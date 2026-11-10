# FormOtp

A one-time code or PIN, one box per character, with its label, help text and
error message. It's built on [Field](/forms/field) and
[One-time code](/forms/otp).

::: preview ui/form-otp/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormOtp } from '@vunset/ui';

const code = ref('');
</script>

<template>
  <FormOtp v-model="code" label="Verification code" @complete="verify" />
</template>
```

Typing moves along the boxes, and a paste or a code the phone offers from a
message fills them all at once. `@complete` fires with the code once every box
is filled.

## Examples

### Groups

The boxes stand apart. `groups` joins them into [AppGroup](/ui/app-group)s of
those sizes: `[6]` joins all six, `[3, 3]` makes two groups of three with
`separator` (`–`) between them. `type="alphanumeric"` takes letters too.

::: preview ui/form-otp/Groups
:::

### PIN and states

`mask` hides the characters. `error`, `read-only`, `disabled` and `size` work
as on every `Form*` field.

::: preview ui/form-otp/Pin
:::

## Styling

| Class | On |
| --- | --- |
| `form-otp` | The row of boxes, with its `data-*` state |
| `form-control` | Each box's look, shared by every `Form*` field |
| `form-otp-input` | Each box, with `data-index`, `data-filled` and `data-focused` |
| `form-otp-separator` | What's drawn between the groups |

`control-class` goes on every box.

<<< ../../packages/ui/src/form/form-otp.css

## API Reference

### FormOtp

::: api form/FormOtp
:::
