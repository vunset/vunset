# Textarea

A multi-line [Input](/forms/input): the same `v-model`, state attributes,
`maxLength` and `filter`, and the same wiring inside a
[Field](/forms/field). `autosize` lets it grow with what's typed.

::: preview textarea/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { Textarea } from '@vunset/vue';
</script>

<template>
  <Textarea />
</template>
```

Renders a `<textarea>`. Native attributes like `rows`, `placeholder` and
`wrap` pass through.

Give it an `id` and point a `<label>` at it, or put it in a
[Field](/forms/field), which does the wiring for it.

## Examples

### Autosize

With `autosize`, the height follows the content: it grows as lines are added,
shrinks as they go, and never drops below `rows`. `maxRows` caps it, and past
that it scrolls. It measures again when its width changes, since a narrower box
wraps more lines.

::: preview textarea/Autosize
:::

The height is set inline, so a stylesheet shouldn't set one of its own.
`data-autosize` is there to turn off the resize handle, which the height would
fight:

```css
textarea[data-autosize] {
  resize: none;
}
```

## API Reference

### Textarea

The element carries `data-part="textarea"`, and `data-autosize` with
`autosize`. Through a template ref you get its `value` ref and `focus()`.

::: api textarea/Textarea
:::

Its state, as attributes on the element:

| Attribute | Present while |
| --- | --- |
| `data-disabled` | it ignores interaction |
| `data-readonly` | the value can be read but not edited |
| `data-required` | a value is asked for (announced as `aria-required`, not enforced by the browser) |
| `data-invalid` | the value is invalid |
| `data-filled` | it holds a non-empty value |
| `data-focused` | it has focus |
