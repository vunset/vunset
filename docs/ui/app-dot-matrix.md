# AppDotMatrix

A loader made of five by five dots that light up in one of ten patterns. The
dots are the text's color, faint until their turn.

::: preview ui/app-dot-matrix/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppDotMatrix } from '@vunset/ui';
</script>

<template>
  <AppDotMatrix variant="cascade" class="size-8" />
</template>
```

`variant` picks the pattern: `spiral`, `columns`, `waves`, `helix`,
`chaotic`, `dna`, `romb`, `cascade`, `orbit` (two rings turning against each
other) or `heart` (a heart beating twice). `APP_DOT_MATRIX_VARIANTS` lists
them. The default, `random`, picks one in the browser; a server-rendered page
shows `spiral` until then.

It's 1.5rem square. Size it with a class.

Like [AppSpinner](/ui/app-spinner), it's decoration next to text that says
what's loading. On its own, give it a `label` so screen readers announce it.

## Examples

### Shapes

`shape` makes the dots `circle`s or `square`s.

::: preview ui/app-dot-matrix/Shapes
:::

## Styling

| Class | On |
| --- | --- |
| `app-dot-matrix` | The grid, with `data-variant` and `data-shape`; its dots are its `<span>`s, and one a pattern leaves out has `data-rest` |

<<< ../../packages/ui/src/app/app-dot-matrix.css

## API Reference

### AppDotMatrix

::: api app/AppDotMatrix
:::
