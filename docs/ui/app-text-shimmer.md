# Text shimmer

A class, not a component: a light passing over text, for something in
progress, like "Thinking…" or "Generating…". It comes with
`@vunset/ui/all.css`, or
[on its own](/ui/theming#only-the-stylesheets-you-use) as
`@vunset/ui/css/app-text-shimmer.css`.

::: preview ui/app-text-shimmer/Basic
:::

## Usage

```vue
<template>
  <p class="app-text-shimmer">Thinking…</p>
</template>
```

Everything inside shimmers, an icon too, in the text's own color. The text
stays real text, so people can select it and screen readers read it. A block
element shrinks to the width of its text, so the light crosses the words,
not empty space. Between passes, the text is at 60% strength.

`--app-text-shimmer-duration` (1.5s) sets the pace. With reduced motion, the
light stops and the text shows at full strength.

## Styling

| Class | On |
| --- | --- |
| `app-text-shimmer` | Any element with text |

<<< ../../packages/ui/src/app/app-text-shimmer.css
