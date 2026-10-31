# useInfinityFetch

`useInfinityFetch` loads a list a page at a time: the first page once the
component is in the page, the next whenever the bottom of the list scrolls into
view. It fetches with Nuxt's `$fetch`, so it's only in a Nuxt app.

```vue
<script setup lang="ts">
const list = useTemplateRef('list');
const search = ref('');

const { data: orders, status } = useInfinityFetch<Order>('/api/orders', {
  el: list,
  query: () => ({ search: search.value }),
  dataKey: 'items'
});
</script>

<template>
  <input v-model="search" type="search" />
  <ul ref="list">
    <li v-for="order in orders" :key="order.id">{{ order.number }}</li>
  </ul>
  <p v-if="status === 'pending'">Loading…</p>
  <p v-else-if="status === 'end' && orders.length === 0">No orders.</p>
</template>
```

## What it sends

Each request carries your `query` plus the page number, from `1`:
`GET /api/orders?search=…&page=2`. With `method: 'POST'`, the same goes in the
body instead.

The response is the page's items, or an object holding them under `dataKey`
(`{ items: [...], total: 120 }`). A page that comes back empty is the end:
`status` becomes `'end'` and nothing more is requested. So the last request
is always one past the final page.

## When it loads

- The first page loads once the component is mounted, so a server render
  shows the list empty. Each page is added to `data`, in order.
- The next page loads when the bottom of `el` reaches the bottom of the
  window (or, for an `el` that scrolls itself, its own scroll end), on any scroll, a scrolling container's included, and on resize.
  Only one page loads at a time.
- If the list still ends inside the window once a page is in, as on a tall
  screen, the next page loads straight away, until the list fills it.
- A change to `query` starts over from the first page, emptying `data`.
  `refresh()` does the same by hand.

## In a box that scrolls itself

A list in a box capped to a height (a table that scrolls itself, so its header
sticks, or a panel) is always in the window, so its bottom alone would load
every page at once. Pass the box itself as `el`: once it scrolls, the next page
loads as it nears its own end. A component works too, by its root element:

```vue
<script setup lang="ts">
const table = useTemplateRef('table');

const { data } = useInfinityFetch<Order>('/api/orders', { el: table, offset: 200 });
</script>

<template>
  <AppDataTable ref="table" :data :columns sticky-header class="max-h-[70dvh]" />
</template>
```

The rule is the same either way: the next page loads when `el`'s bottom is
within the window and `el` is scrolled to its own end. A list that doesn't
scroll itself is always at its end, so only the window counts; a capped box is
always in the window, so only its scroll counts. `offset` starts loading that
many pixels early.

## Options and what it returns

| Option    |                                                                                             |
| --------- | ------------------------------------------------------------------------------------------- |
| `el`      | The list: an element or a component, a template ref or a getter. Its end is what's watched. |
| `query`   | Sent with every page: an object, a ref or a getter. A change starts over.                   |
| `method`  | `'GET'`, the default, or `'POST'`.                                                          |
| `dataKey` | Where the items are in the response, when it isn't the list itself.                         |
| `offset`  | Pixels before the end at which the next page starts loading. `0` by default.                |

| Returns       |                                                                                    |
| ------------- | ---------------------------------------------------------------------------------- |
| `data`        | Every item loaded so far.                                                          |
| `status`      | `'idle'`, `'pending'` while a page loads, or `'end'` once an empty page came back. |
| `currentPage` | The next page it will ask for.                                                     |
| `refresh()`   | Empties `data` and loads the first page again.                                     |
