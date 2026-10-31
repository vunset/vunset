# Overlay parts

`Portal`, `Positioner` and `Popup` are the building blocks of everything
that opens over the page: Select, Combobox, Datepicker, Menu, Context menu,
Menubar, Popover, Tooltip, Dialog, Drawer and Floating. You use the same three
parts in all of them.

They always belong to the closest of those components around them. So a menu
inside a dialog renders the menu's popup, not the dialog's.

## Anatomy

An overlay that opens next to a trigger (Select, Combobox, Menu, Popover,
Tooltip) uses all three:

```vue
<template>
  <Portal>
    <Positioner>
      <Popup />
    </Positioner>
  </Portal>
</template>
```

One that isn't attached to a trigger (Dialog, Drawer) leaves out the
`Positioner`. It would throw an error, since there's nothing to place it
next to:

```vue
<template>
  <Portal>
    <Popup />
  </Portal>
</template>
```

## API Reference

### Portal

Moves its content out of your layout, so a parent's `overflow: hidden` or
`z-index` can't cut it off or bury it. The content is only rendered while the
overlay is showing: from the moment it opens until its exit animation ends.
`disabled` keeps the content where it is instead.

::: api surface/Portal
:::

Without `to`, it renders into an element with `id="teleports"` if the page
has one, and at the end of `<body>` if it doesn't. An app that only runs in
the browser needs nothing set up.

#### Server rendering

A server can't look at the page, so there a `Portal` always renders into
`#teleports`. Vue collects that HTML in the SSR context's
`teleports['#teleports']`. Put it in an element with that id in your page
(Nuxt already does this):

```ts
const context = {};
const app = await renderToString(createSSRApp(App), context);
const html = `<div id="app">${app}</div><div id="teleports">${context.teleports?.['#teleports'] ?? ''}</div>`;
```

Without that element, the browser renders into `<body>` instead, which
doesn't have the server's HTML, and Vue reports a hydration mismatch.

### Positioner

Places the popup next to its trigger, and flips or shifts it to keep it on
screen. You set the placement on the component that owns it, with `side`,
`align`, `side-offset`, `align-offset` and `collision-padding`.

The element carries `data-part="positioner"` and these CSS variables, which the
popup inherits:

| Variable | Value |
| --- | --- |
| `--anchor-width` | The trigger's width. |
| `--anchor-height` | The trigger's height. |
| `--available-width` | The room left between the trigger and the viewport edge, sideways. |
| `--available-height` | The room left between the trigger and the viewport edge, up or down. |

It sits at `z-index: 50`. Set `--positioner-z-index` to change that:
`:root { --positioner-z-index: 30 }` moves every popup at once.

::: api surface/Positioner
:::

### Popup

The overlay itself: the element you style and animate. When it closes, it
stays on the page until your CSS transition or animation on it has
finished.

The element carries `data-part="popup"` and its owner's state attributes, such
as `data-open`, `data-side`, `data-enter-from` and `data-leave-to`. Each
component's page lists them under its root.

::: api surface/Popup
:::
