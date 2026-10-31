# Click outside

`useClickOutside` calls your function when a press lands outside an element:
the usual way to close a panel, a search's results or an inline editor that
isn't one of the library's own overlays.

::: preview click-outside/Basic
:::

```ts
import { ref } from 'vue';
import { useClickOutside } from '@vunset/vue';

const panel = ref<HTMLElement>();
const toggle = ref<HTMLElement>();
const open = ref(false);

useClickOutside(panel, () => (open.value = false), {
  ignore: [toggle],
  enabled: open
});
```

The [library's overlays](/utilities/overlay) close on an outside press on
their own. Use this for elements of your own.

## What counts as outside

It reacts to the start of a press (`pointerdown`), as the library's overlays
do, so a panel and a menu inside it close on the same press.

- **Inside the target** is inside, however deep, inside a shadow root too.
- **Inside an open overlay** is inside too. A Select, Menu or Popover opened
  from the panel draws its popup elsewhere on the page, but picking an option
  there doesn't close the panel. That holds for any open overlay of this
  library, not only those opened from the target.
- **Whatever `ignore` lists** is inside.
- **While the target isn't on the page**, as with a closed panel behind a
  `v-if`, nothing fires.

### The button that opens it

A button that toggles the panel is outside it. Without `ignore`, pressing it
to close the panel closes it on the press, then the button's click opens it
again. Put the button in `ignore`, as above, and leave the closing to its
click.

## Stopping

It stops listening when the component unmounts. To stop earlier, call the
function it returns:

```ts
const stop = useClickOutside(panel, close);

stop();
```

`enabled` pauses it instead, as long as it's `false`. Called on the server, it
does nothing.

## API Reference

### useClickOutside

`(target, handler: (event: PointerEvent) => void, options?) => () => void`

`target` is an element, a component, or a list of either: a template ref, a
getter or the value itself. `handler` gets the `pointerdown` event.

| Option | Default | |
| --- | --- | --- |
| `ignore` | | Elements or components that count as inside, in the same forms as `target` |
| `enabled` | `true` | `MaybeRefOrGetter<boolean>`<div>`false` pauses it.</div> |
