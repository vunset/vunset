# FormSwitch

An on/off switch with its label beside it, and help text and an error under
the label. Clicking the label toggles it too. It's built on
[Switch](/forms/switch).

No label? Give it an `aria-label`, and it goes on the switch itself.

::: preview ui/form-switch/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormSwitch } from '@vunset/ui';

const notifications = ref(true);
</script>

<template>
  <FormSwitch v-model="notifications" label="Notifications" />
</template>
```

## Examples

### Custom values

`true-value` and `false-value` set what `v-model` holds while on and off.

::: preview ui/form-switch/CustomValues
:::

### Validation

`error` shows a message under the label. `required` marks the switch and
tells screen readers it's required; the browser doesn't enforce it, so the
check is up to you.

::: preview ui/form-switch/Validation
:::

### Uncontrolled

Leave out `v-model` and the switch keeps its own state, starting from
`default-checked`.

::: preview ui/form-switch/Uncontrolled
:::

### Slots

Need a link or bold text? The `#label` and `#help` slots take markup instead
of plain text.

::: preview ui/form-switch/Slots
:::

### Read-only

A read-only switch can still be focused and is still announced, but you
can't change it.

::: preview ui/form-switch/ReadOnly
:::

### Disabled

`disabled` grays the switch out and takes it out of the form.

::: preview ui/form-switch/Disabled
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Space</kbd> | Toggle it, on release |
| <kbd>Enter</kbd> | Toggle it |

## Styling

| Class | On |
| --- | --- |
| `form-switch` | The track: a [SwitchRoot](/forms/switch), with its `data-*` state |
| `form-switch-thumb` | The thumb |

Its size comes from `--ui-switch-width` and `--ui-switch-height`
([tokens](/ui/theming#sizes)). The field around it uses the
[FormField](/ui/form-field) classes, in the `inline` layout.

To add your own classes inside, use `control-class` (the switch),
`label-class`, `help-class` and `error-class`. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-switch.css

## API Reference

### FormSwitch

::: api form/FormSwitch
:::
