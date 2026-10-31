# Toast

Short messages that pile up in a corner of the screen and go away on their
own. Any code can raise one with `useToast()`: a component, a store, an API
client. You mount one `ToastViewport` in your app, and it shows them all.

Want them styled already? [`AppToaster`](/ui/app-toaster) from `@vunset/ui`
is a ready-made viewport.

::: preview toast/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import {
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastProgress
} from '@vunset/vue';
</script>

<template>
  <ToastViewport>
    <ToastRoot>
      <ToastTitle />
      <ToastDescription />
      <ToastAction />
      <ToastClose />
      <ToastProgress />
    </ToastRoot>
  </ToastViewport>
</template>
```

What you put inside the viewport is a template: it's drawn once for each
toast, and the parts inside show that toast. `ToastTitle` and
`ToastDescription` show its `title` and `text`, unless you give them content
of your own.

To raise a toast, call `setToast`. It needs no component around it, so it
works from a plain module too:

```ts
import { useToast } from '@vunset/vue';

const { setToast } = useToast();

setToast({ title: 'Changes saved', text: 'Revision 3 is live.' });
```

## Examples

### Types and updates

`type` shows up as `data-type`, so you can style each kind, and your template
can branch on it. A `loading` toast never times out. Call `updateToast` to turn
it into the result, in place.

::: preview toast/Types
:::

### An action

A `ToastAction` runs your click handler, then closes the toast. To keep the
toast up, call `event.preventInternalHandler()` in your handler. Pass whatever
the action needs in the toast's `data`. Screen readers name an action by its
text, while `ToastClose` is always labeled "Close".

::: preview toast/Action
:::

### Time left

`ToastProgress` is a bar showing how long the toast has left. It sets the
timeout as `--toast-duration`, for a CSS animation to run over, and
`data-paused` while the timer is paused. It starts over whenever the timer
does (after an update or a repeat), and isn't rendered at all for a toast that
never times out.

```css
[data-part='progress'] {
  animation: shrink var(--toast-duration) linear forwards;
}

[data-part='progress'][data-paused] {
  animation-play-state: paused;
}
```

::: preview toast/Progress
:::

### Position

`position` puts the stack at the `top` or `bottom`, and the `start`, `center`
or `end`, like `bottom-end`. The viewport sets `data-side` and `data-align`
from it, and your stylesheet does the placing.

::: preview toast/Position
:::

### The same id again

Call `setToast` with the `id` of a toast that's already showing, and it
replaces that toast in place instead of stacking a copy. Its `repeatCount` goes
up, and `data-repeated` stays on until its animation ends, so you can add a
little nudge to show something happened.

::: preview toast/Repeat
:::

### A toast of its own

For the odd toast that looks nothing like the rest, pass `slot`, a render
function, and it's drawn instead of the viewport's template. It still has to
render a `ToastRoot` to take its place in the stack. The parts inside work just
as they do in the template.

::: preview toast/Custom
:::

### A mixed stack

Every kind at once: the types, a tall one, one kept up by `manualClose`, a
repeat, a replacement, a `loading` one and a custom `slot`, at any of the six
positions. Each toast is measured, so toasts of different heights still stack
neatly.

::: preview toast/MixedStack
:::

## Stacking

The newest toast is at the front. Up to `limit` (3) are in the stack. The
rest get `data-limited` and wait their turn.

While the user hovers the viewport or focuses something in it, the stack
expands (`data-expanded` on the viewport and on every toast), and every timer
pauses. When it resumes, a toast only gets the time it had left.

Your stylesheet lays out the stack, using these variables:

| Variable               | On              | Value                                                                           |
| ---------------------- | --------------- | ------------------------------------------------------------------------------- |
| `--toast-index`        | `ToastRoot`     | Its place in the stack: `0` at the front, `-1` once leaving.                    |
| `--toast-offset-y`     | `ToastRoot`     | The heights of the toasts in front of it added up: where it sits when expanded. |
| `--toast-height`       | `ToastRoot`     | Its own height, measured as if nothing constrained it.                          |
| `--toast-front-height` | `ToastViewport` | The front toast's height, for the ones behind to take while collapsed.          |
| `--toast-count`        | `ToastViewport` | How many toasts there are.                                                      |
| `--toast-repeat-count` | `ToastRoot`     | How many times it was raised again with the same `id`.                          |

Each `ToastRoot` also gets an inline `z-index`, so the front toast is on top.

## Dismissing

- **On a timer.** A toast closes itself after its `timeout`, or the
  viewport's (5 seconds). A `timeout` of `0` or less, `manualClose`, or the
  `loading` type keeps it up until it's closed by hand.
- **By swiping.** The user can swipe it away in any of `swipeDirection` (down
  or right by default), past a threshold or with a quick flick. Let go short
  and it springs back. While dragged it has `data-swiping` and follows
  `--toast-swipe-movement-x` and `-y`. Once swiped out, `data-swipe-direction`
  says which way it went. Pressing a button, link or field inside, or anything
  marked `data-swipe-ignore`, doesn't start a swipe.
- **By hand.** `ToastClose`, `ToastAction`, the `close` the slots get,
  `removeToast(id)` and `clearToasts()` all close it.

A closing toast gets `data-leave-to` and stays on the page until its exit
animation finishes. The toasts behind it close the gap right away. Once a
toast is closing, `updateToast` leaves it alone.

## Accessibility

The viewport is a `role="region"` named "Notifications" (change it with
`label`). Each toast is a `role="status"`, so screen readers announce it when
it arrives, using its title and description. `ToastClose` is labeled "Close",
and a `ToastAction` by its text.

## Server rendering

Usually there's nothing to set up. An app that renders in the browser uses
the shared store as it is. With [`@vunset/nuxt`](/nuxt/toasts), each server
request gets its own store for you.

Only an app with its own server entry (Vite SSR without Nuxt) has more to do.
On a server, the shared store would be shared by every request, so a toast
raised during a server render is ignored, with a warning in development. To
show one in the server's HTML, give each request its own store, and every
`useToast()` and viewport in the app will use it:

```ts
// entry-server.ts, once per request
import { createToastStore, provideToastStore } from '@vunset/vue';

provideToastStore(createToastStore(), app);
```

## API Reference

### useToast

Raises and dismisses toasts. `useToast(store?)` uses the store you pass,
else the one provided with `provideToastStore`, else the shared one. The
viewport picks its store the same way.

| Member        | Type                                                                                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toasts`      | `Ref<Toast[]>`<div>Every toast, newest first, including those leaving.</div>                                                                                                            |
| `setToast`    | `(options: ToastOptions) => ToastId`<div>Raises a toast, or replaces the one with the same `id`.</div>                                                                                  |
| `updateToast` | `(id: ToastId, options: ToastOptions) => void`<div>Changes a toast in place, keeping what `options` leaves out, and restarts its timeout. Does nothing once the toast is closing.</div> |
| `removeToast` | `(id: ToastId) => void`<div>Dismisses a toast.</div>                                                                                                                                    |
| `clearToasts` | `() => void`<div>Dismisses every toast.</div>                                                                                                                                           |

### ToastOptions

| Option        | Type                                                                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | `string \| number`<div>Reuse one to replace a toast that is already showing. One is generated otherwise.</div>                                                  |
| `title`       | `string`<div>What `ToastTitle` shows.</div>                                                                                                                     |
| `text`        | `string`<div>What `ToastDescription` shows.</div>                                                                                                               |
| `type`        | `string`<div>Lands on `data-type`. `loading` never times out.</div>                                                                                             |
| `timeout`     | `number`<div>Milliseconds before it closes itself, instead of the viewport's. `0` or less never closes.</div>                                                   |
| `manualClose` | `boolean`<div>Keeps it up until it is dismissed by hand.</div>                                                                                                  |
| `data`        | `unknown`<div>Anything else the template needs, as `toast.data`.</div>                                                                                          |
| `slot`        | `(toast: Toast) => VNodeChild`<div>Renders this toast instead of the viewport's template. It still has to render a `ToastRoot` to take part in the stack.</div> |
| `onClose`     | `() => void`<div>Runs as it starts to leave, however it was dismissed.</div>                                                                                    |

### ToastViewport

The element carries `data-part="viewport"`, `role="region"`, and its state as
attributes:

| Attribute       | Value                                              |
| --------------- | -------------------------------------------------- |
| `data-position` | The `position`, e.g. `bottom-end`.                 |
| `data-side`     | `top` or `bottom`.                                 |
| `data-align`    | `start`, `center` or `end`.                        |
| `data-expanded` | Present while the stack is hovered or holds focus. |
| `data-empty`    | Present while there are no toasts.                 |

::: api toast/ToastViewport
:::

### ToastRoot

The element carries `data-part="root"` and `role="status"`.

::: api toast/ToastRoot
:::

### ToastTitle

The element carries `data-part="title"` and the id the toast is labeled
by.

::: api toast/ToastTitle
:::

### ToastDescription

The element carries `data-part="description"` and the id the toast is
described by.

::: api toast/ToastDescription
:::

### ToastClose

The element carries `data-part="close"` and `aria-label="Close"`.

::: api toast/ToastClose
:::

### ToastProgress

The element carries `data-part="progress"`, `aria-hidden`, `--toast-duration`
and, while the timer is held, `data-paused`. It is not rendered for a toast
without a timeout.

::: api toast/ToastProgress
:::

### ToastAction

Closes the toast after its own click handler, like `ToastClose`, without the
"Close" label.

::: api toast/ToastAction
:::
