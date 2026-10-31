# AppButton

A button with a look: four variants, five tones, four sizes, and a loading
state, built on [Button](/actions/button). At its medium size it is a
`.form-control`'s height, so it lines up with an input beside it.

::: preview ui/app-button/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppButton } from '@vunset/ui';
</script>

<template>
  <AppButton variant="solid" tone="accent" @click="save">Save</AppButton>
</template>
```

It renders a `<button type="button">`, so it never submits a form unless it is
`type="submit"`. Attributes and listeners (`aria-label`, `href`, `@click`) land
on the element.

## Examples

### Variants and tones

`variant` is `ghost` (the default), `soft`, `outline` or `solid`; `tone` is
`neutral` (the default), `accent`, `success`, `warning` or `danger`. A tone sets
a color and the text that reads on it; the variant decides where they go.

::: preview ui/app-button/Variants
:::

### Sizes

`size` is `xs` (a badge's height, for a row beside one), `sm`, `md` (the
default, an input's height) or `lg`. An icon goes in the default slot, before
or after the label.

::: preview ui/app-button/Sizes
:::

### Loading

`loading` draws stripes sliding across the button and blocks clicks, but keeps
it focusable and announced as busy (`aria-busy`), and doesn't dim it. Under
reduced motion the stripes stay still. It draws no spinner of its own: put an
[AppSpinner](/ui/app-spinner) before the label for one.

```vue
<AppButton :loading="saving">
  <AppSpinner v-if="saving" />
  Save
</AppButton>
```

::: preview ui/app-button/Loading
:::

### Square

`square` makes it as wide as it is tall, for an icon alone. Give it an
`aria-label`: the icon has no name of its own.

::: preview ui/app-button/Square
:::

### As a link

`as="a"` (or a router link component) renders a link that looks like a button.
`class="w-full"` stretches it to the width it is given.

::: preview ui/app-button/Link
:::

### Disabled

A disabled button leaves the tab order; `focusable-when-disabled` keeps it in,
with `aria-disabled`, so a tooltip can still say why. Neither fires a click.

::: preview ui/app-button/Disabled
:::

## Keyboard

A native `<button>` brings its own keys. Rendered as anything else with `as`,
it gets `role="button"` and the same keys by hand:

| Key | Does |
| --- | --- |
| <kbd>Enter</kbd> | Press it, on key down |
| <kbd>Space</kbd> | Press it, on release, without scrolling the page |

A disabled button ignores both; with `focusable-when-disabled` it still takes
focus.

## Styling

| Class | On |
| --- | --- |
| `app-button` | The button, with `data-variant`, `data-tone`, `data-size`, `data-loading`, `data-square` and `data-disabled` |

A tone is two custom properties,
`--ui-tone` and `--ui-on-tone`, set in `base.css` for every `App*` component
that takes a `tone`: set them on a class of your own for a tone the package
doesn't have. The colors come from the `--ui-*` tokens, `--ui-success` and
`--ui-warning` among them.

<<< ../../packages/ui/src/app/app-button.css

## API Reference

### AppButton

::: api app/AppButton
:::
