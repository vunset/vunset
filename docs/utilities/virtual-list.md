# Virtual list

`useVirtualList` draws only the items near the viewport of a long list, with
empty space standing in for the rest. Ten thousand rows scroll like fifty.
[Select](/forms/select), [Combobox](/forms/combobox) and the
[data table](/data/data-table) use it for their `virtual` option. Use it
yourself for a list of your own.

::: preview virtual-list/Basic
:::

## Anatomy

Give it your items and their height. It returns the items to draw, and the
space to leave before and after them:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useVirtualList } from '@vunset/vue';

const scroller = ref<HTMLElement>();
const list = ref<HTMLElement>();

const { visible, before, after } = useVirtualList({
  items: people,
  itemHeight: 36,
  scroller,
  list
});
</script>

<template>
  <div ref="scroller" style="height: 240px; overflow-y: auto">
    <ul ref="list" :style="{ paddingTop: `${before}px`, paddingBottom: `${after}px` }">
      <li v-for="person in visible" :key="person.id" style="height: 36px">{{ person.name }}</li>
    </ul>
  </div>
</template>

`before` and `after` keep the list its full height, so the scrollbar stays
true to the whole list. Padding, as here, or spacer elements both work. In a
table, use a spacer row, since a `<tbody>` can't take padding.

## The rules

- **Every item is the same height.** Measure it once and pass it in as
  `itemHeight`; it isn't read from the page. An item taller or shorter than
  that throws the positions off.
- **`scroller` is the element that scrolls.** Leave it out when the page
  itself scrolls, and the list follows the window. A `scroller` with no
  height of its own, which grows to hold every item, works too: the list
  follows the ancestor that does scroll it, or the page.
- **`list` is where the first item is drawn.** Inside a `scroller`, it lets
  the list sit lower, under a heading or a toolbar; without it, the list is
  taken to start at the top. Without a `scroller`, `list` is required: it's
  how the list finds where it is on the page.

It redraws on scroll, at most once a frame, and only when the viewport gets
within `threshold` items of the edge of what's drawn. A change in the number
of items, or in `itemHeight`, redraws at once.

## Jumping to an item

`scrollToIndex` scrolls an item to the top of the viewport, whether it's
drawn or not. The demo's button uses it.

```ts
const { scrollToIndex } = useVirtualList({ items, itemHeight: 36, scroller });

scrollToIndex(4999); // the 5,000th item
```

## Turning it off

With `enabled: false`, every item is drawn, `before` and `after` are `0`, and
nothing listens to the scroll. A short list, or a print view, can draw the
same template unvirtualized.

## API Reference

### useVirtualList

`<T>(options: UseVirtualListOptions<T>) => UseVirtualListReturn<T>`. Call it
in `setup`: it listens once mounted and stops when the component unmounts.

| Option | Default | |
| --- | --- | --- |
| `items` | | `MaybeRefOrGetter<T[]>`<div>The whole list.</div> |
| `itemHeight` | | `MaybeRefOrGetter<number>`<div>Every item's height, in pixels.</div> |
| `scroller` | the window | `Ref<HTMLElement>`<div>The element that scrolls.</div> |
| `list` | | `Ref<HTMLElement>`<div>The element the first item is drawn at the top of.</div> |
| `enabled` | `true` | `MaybeRefOrGetter<boolean>`<div>`false` draws every item.</div> |
| `overscan` | `20` | `number`<div>Items drawn past each edge of the viewport.</div> |
| `threshold` | `10` | `number`<div>How near the edge of what's drawn the viewport gets before it redraws, in items.</div> |

| Returns | |
| --- | --- |
| `visible` | `ComputedRef<T[]>`<div>The items to draw.</div> |
| `before`, `after` | `ComputedRef<number>`<div>The space to leave before and after them, in pixels.</div> |
| `start`, `end` | `ComputedRef<number>`<div>The index of the first item drawn, and the index after the last.</div> |
| `scrollToIndex` | `(index: number) => void`<div>Scrolls that item to the top of the viewport.</div> |
