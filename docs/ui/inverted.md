# Inverted

A class, not a component: an element in the opposite color scheme to the
one around it, dark on a light page and light on a dark one. It comes with
`@vunset/ui/all.css`, or
[on its own](/ui/theming#only-the-stylesheets-you-use) as
`@vunset/ui/css/inverted.css`.

::: preview ui/inverted/Basic
:::

## Usage

```vue
<template>
  <AppCard class="inverted" title="Invite a teammate">…</AppCard>
  <section class="inverted">…</section>
</template>
```

Every `light-dark()` color inside flips: ui's tokens, your own colors, and
the browser's scrollbars and controls. An element with no background of its
own gets `--ui-bg` and `--ui-text`. A component that has its own background
keeps it.

It flips whatever scheme is around it, however that was set: `useTheme()`,
the system's setting, or `color-scheme` on any parent. Nest it and it flips
back.

::: preview ui/inverted/Nested
:::

## Limits

- A popup opened from inside, like a menu, a select's list or a tooltip, is
  rendered at the end of `<body>`, outside the element, so it uses the page's
  scheme.
- Firefox before version 151 can't tell which scheme is around the element.
  It assumes light and draws an `inverted` element dark.

## Styling

| Class      | On          |
| ---------- | ----------- |
| `inverted` | Any element |

<<< ../../packages/ui/src/inverted.css
