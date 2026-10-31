# AppToaster

Where toasts appear: a stack in a corner of the screen, styled, for the toasts
`useToast()` sets. Built on [Toast](/feedback/toast).

::: preview ui/app-toaster/Basic
:::

## Usage

Mount it **once**, at the root of the app:

```vue
<!-- App.vue -->
<script setup lang="ts">
import { AppToaster } from '@vunset/ui';
</script>

<template>
  <RouterView />
  <AppToaster />
</template>
```

Then set toasts from anywhere, a component or not, with `useToast()` from
`@vunset/vue`:

```ts
import { useToast } from '@vunset/vue';

const { setToast } = useToast();
setToast({ title: 'Changes saved', text: 'Revision 4 is live.', type: 'success' });
```

There's no provider to set up. `useToast()` writes to one shared list, and
the toaster shows what's in it. So with no toaster mounted nothing shows, and
with two every toast shows twice.

If you really want a second, separate set of toasts, make a store with
`createToastStore()` and pass it to both `useToast(store)` and
`<AppToaster :store="store">`.

What the toaster reads from a toast:

| Field | Draws |
| --- | --- |
| `title`, `text` | The title, and the line under it |
| `type` | `success`, `error`, `warning`, `info` or `loading`: the icon and its color. Any other, or none, draws no icon |
| `data.action` | `{ label, onClick, props? }`: a button beside the text, which closes the toast after `onClick`. `props` go to its AppButton (`variant`, `tone`, `size`, any attr), over its `sm` `outline` default |

The rest of `setToast`'s options (`id`, `timeout`, `manualClose`, `onClose`, a
`slot` of its own) work as on [Toast](/feedback/toast). `clearToasts()` closes
every toast at once.

## Examples

### Loading, then done

A `loading` toast stays up until it is updated by its id; `updateToast` turns
it into the result.

::: preview ui/app-toaster/Loading
:::

### An action

`data.action` puts a button on the toast, here an undo. Typing `setToast` with
`AppToastData` checks its shape.

::: preview ui/app-toaster/Action
:::

### Time left

`progress` draws a bar along each toast's bottom edge, in its type's color,
running down the time it has left. It holds while the stack is hovered, as the
timer does, and a toast that never times out has none.

::: preview ui/app-toaster/Progress
:::

## Styling

| Class | On |
| --- | --- |
| `app-toaster` | The region, with `data-side`, `data-align` and `data-expanded` while hovered |
| `app-toast` | Each toast, with `data-type`, `data-front`, `data-index`, `data-swipe-direction` |
| `app-toast-icon` | The type's icon, colored by `--ui-tone`: AppAlert's `alert-success`, `alert-danger`, `alert-warning` or `alert-info`, or a turning `spinner` for `loading` |
| `app-toast-body` | The title and the text |
| `app-toast-title` | The title |
| `app-toast-description` | The text |
| `app-toast-actions` | The action button |
| `app-toast-close` | The close button |
| `app-toast-progress` | The bar `progress` draws, with `data-paused` while held, over `--toast-duration` |

`class` goes on the region, and `toast-class` on each toast (see
[classes on the inner parts](/ui/theming#classes-on-the-inner-parts)). The
default slot replaces a toast's title and text, `#icon` its icon, and
`#actions` its action button. Each slot gets the `toast`. To fit your own
layers above or below the toasts, see [stacking](/ui/theming#stacking).

<<< ../../packages/ui/src/app/app-toaster.css

## API Reference

### AppToaster

::: api app/AppToaster
:::
