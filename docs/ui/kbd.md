# Kbd

A stylesheet, not a component: every `<kbd>` on the page drawn as a key cap,
in ui's colors.

::: preview ui/kbd/Basic
:::

## Usage

```vue
<template>
  <p>Press <kbd>Esc</kbd> to close.</p>
  <p>Search with <kbd><kbd>⌘</kbd><kbd>K</kbd></kbd>.</p>
</template>
```

A `<kbd>` with others inside is a key combination, the way HTML marks one. It
draws no cap of its own and lines its keys up. The caps are sized in `em`, so
they follow the text around them.

It comes with `@vunset/ui/all.css`. If you
[load stylesheets one by one](/ui/theming#only-the-stylesheets-you-use), it's
`@vunset/ui/css/kbd.css`; leave it out to keep the browser's look. Your own
`kbd` styles win over it.

## Styling

<<< ../../packages/ui/src/kbd.css
