# Data table

A [Table](/data/table) you build from rows and column definitions. It sorts,
expands nested rows, hides, pins and resizes columns, and can draw only the
rows on screen. It runs on [TanStack Table](https://tanstack.com/table).

Every piece of state (the sort, the open rows, the visible columns) is a
`v-model`. Bind the ones you want to control and leave the rest to the table.

::: preview data-table/Basic
:::

## Installation

Data table has its own entry point, so an app that doesn't use it never loads
TanStack Table. Install it alongside:

```sh
npm install @tanstack/vue-table
```

```ts
import { DataTable, type DataTableColumn } from '@vunset/vue/data-table';
```

## Anatomy

```vue
<template>
  <DataTable :data="people" :columns="columns">
    <!-- slots per column, by its id: here a `salary` column -->
    <template #cell-salary="{ cell, row }" />
    <template #head-salary="{ column }" />
    <template #foot-salary="{ getValues }" />
    <template #empty />
  </DataTable>
</template>
```

`columns` are TanStack column definitions. A cell shows its value, or what
the column's `cell` renders. Give the column a `#cell-<id>` slot to draw it
yourself.

The table is made of the [Table](/data/table) parts, so you style it the same
way. A column with a `footer`, or a `#foot-<id>` slot, adds a footer row.

## Examples

### Nested rows

Set `nested-key` to the key that holds a row's children. The table adds an
expander column at the start. Add `expand-on-row-click` to let a press
anywhere on the row open it too.

A nested row has `data-depth` and a `--depth` variable, so you can indent it.
The expand button draws a built-in chevron; `#expander-icon` replaces it, and
`#expander` the whole button.

::: preview data-table/Nested
:::

### Columns

- **Hide columns** with `v-model:column-visibility`, a map of column ids to
  `true` or `false`. `meta.show: false` hides a column from the start.
- **Pin columns** with `meta.pin: 'start'` or `'end'`. Pinned columns stack
  side by side. Change them later with `v-model:column-pinning`.
- **Resize columns** by adding `enableResizing: true` to a column. Its head
  cell gets a strip on the edge to drag, and a double-click resets it. A
  column never gets narrower than its header.
- **Fix a width** with `size`, in pixels. Content wider than that is cut off
  instead of stretching the column, and the cell gets `data-sized` so you can
  add an ellipsis. Pinned and resizable columns need a width, so they get 150
  when you don't give one.

::: preview data-table/Columns
:::

### Column groups

Give a column a `columns` list of its own and it becomes a group. Its header
spans its children, in an extra header row above theirs.

::: preview data-table/ColumnGroups
:::

### Virtual scrolling

With `virtual`, the table draws only the rows near the viewport, so ten
thousand rows cost about as much as twenty. Every row has to be the same
height: pass that height as a number (bound, `:virtual="40"`), or `true` to
measure the first row. An object sets more: `{ rowHeight, overscan }`,
each optional. `overscan` is the rows drawn past each edge of the view (8).
A row scrolled in reuses the elements and components of one scrolled out,
so a jump builds no new cells. State a part keeps for itself, an open
popover, a mounted `Deferred`, an unbound checkbox, starts over for the new
row; a value bound to the row's data follows it.
Give the table a height and it scrolls on its own; without one it follows
whatever scrolls around it, the page or a scrolling ancestor.

Screen readers still know where they are: rows carry `aria-rowindex` and the
table `aria-rowcount`.

::: preview data-table/Virtual
:::

### Everything at once

Nested rows, a column group, a pinned and resizable first column, a sticky
header and footer, and rows that open on a press, all in a box that scrolls
both ways.

::: preview data-table/NestedPinnedSticky
:::

## Sorting

Press a sortable column's header to sort by it. The next press flips the
direction, and a third turns the sort off. Text starts A to Z, numbers start
with the largest.

- Turn sorting off for the whole table with `:enable-sorting="false"`, or for
  one column with `enableSorting: false` in its definition.
- `sortFn` on a column picks how it compares: `alphanumeric`, `text`,
  `basic`, `datetime`, or a function of your own.
- With `manual-sorting`, the table expects the rows to arrive sorted, from
  your server. Only `v-model:sorting` changes.
- A sortable header shows a built-in arrow icon. `#sort` replaces it in every
  column, `#sort-<id>` in one, and gets the `direction`.

To start sorted, use `default-sort`: `'name:asc'`, `'age:desc'`, a column
alone for ascending, or several joined by commas (`'team:asc,name:asc'`). If
you bind `v-model:sorting`, the table starts from your value instead.

### The sort in the URL

With `manual-sorting`, the table keeps its sort in the URL, as
`?sortBy=name:asc`. It reads the query on load, writes every change back, and
follows the back and forward buttons. Your server reads the same query.

For that, the table needs your router. The [Nuxt module](/nuxt/get-started#links-and-the-router) provides it
for you. In any other app, provide it once, under `routeQueryKey` from
`@vunset/vue`:

```ts
import { routeQueryKey } from '@vunset/vue';

app.provide(routeQueryKey, {
  get: (key) => router.currentRoute.value.query[key] as string | undefined,
  set: (key, value) => router.push({ query: { ...router.currentRoute.value.query, [key]: value } }),
  // Optional: several keys in one navigation, as a pagination writes its page and size.
  setMany: (entries) => router.push({ query: { ...router.currentRoute.value.query, ...entries } })
});
```

`sort-query` changes the key. Use it when two tables share a page
(`sort-query="orders"` keeps the sort in `?orders=`), or to keep a table that
sorts by itself in the URL too. `:sort-query="false"` keeps the URL out of
it. A bound `v-model:sorting` always leaves the URL alone.

To build or read that query yourself, `formatSort` turns a sort into the
string and `parseSort` turns it back. Both come from
`@vunset/vue/data-table`.

Here, ten thousand rows keep their sort in `?orders=`. Sort, then go back and
forward:

::: preview data-table/SortInURL
:::

## API Reference

### DataTable

::: api data-table/DataTable
:::

The TanStack Table instance is exposed as `table`.

#### Slots

| Slot | Props |
| --- | --- |
| `#cell-<id>` | `cell` (the cell's value), `row` (the row's data), `depth`, `isNested` (`depth > 0`), `expanded`<div>A body cell of that column. `#<id>` works too, as an older name, but it clashes with a column named like another slot (`empty`, `sort`, …), and type-checked templates only know `#cell-<id>`.</div> |
| `#head-<id>` | `column`, `getValues()`<div>The column's head cell, inside the sort button when it sorts.</div> |
| `#head-<id>-start`, `#head-<id>-end` | `getValues()`<div>Before and after the header text, keeping it: a hint icon, a total. Inside the sort button when it sorts. `#head-<id>` replaces both, with the text.</div> |
| `#foot-<id>` | `column`, `getValues()`<div>The column's foot cell. `getValues()` gives the column's value in every top-level row, in order, for a total.</div> |
| `#sort`, `#sort-<id>` | `direction`: `'asc' \| 'desc' \| false`<div>Replaces the sort icon, in every column or in one.</div> |
| `#expander` | `row`, `expanded`, `toggle()`<div>Replaces the expand button. It renders in every row's expander cell, so check `row.getCanExpand()` yourself. Here `row` is TanStack's row, not your data: your data is `row.original`.</div> |
| `#expander-icon` | `expanded`<div>Replaces the icon inside the expand button, which keeps its label and toggling.</div> |
| `#empty` | <div>Shown in a row of its own when there are no rows. That row has `data-empty`.</div> |

#### Column meta

A column definition's `meta` takes these, on that column's cells. For a class
on every cell, row or section at once, use the root's `th-class`, `td-class`,
`tf-class`, `row-class`, `header-class`, `body-class`, `footer-class` and
`table-class`.

| Key | Type |
| --- | --- |
| `class` | `string`<div>On every cell of the column: head, body and foot.</div> |
| `thClass` | `string`<div>On its head cell.</div> |
| `tdClass` | `string \| ((context) => string \| undefined)`<div>On its body cells, or worked out per cell.</div> |
| `tfClass` | `string`<div>On its foot cell.</div> |
| `show` | `boolean`<div>Whether it shows at first.</div> |
| `pin` | `'start' \| 'end'`<div>Pins it at first.</div> |

#### Attributes

On top of the [Table](/data/table#api-reference) parts' own:

| Element | Attributes |
| --- | --- |
| The container | `data-table="data"`; `data-striped` with `striped`, to tint every other row |
| Every head, body and foot cell | `data-column` (the column's id); `data-pinned-edge` on the last column pinned to the start and the first pinned to the end, to draw a line along |
| A head cell | `data-resizing` while its column is resized |
| A nested row | `data-depth` and `--depth` |
| The empty row | `data-empty` |
| `data-part="table-sort"` | The sort button. |
| `data-part="table-sort-icon"` | The default icon, with `data-direction`; its two paths carry `data-active` when that way is in use. |
| `data-part="table-resizer"` | The resize strip, with `data-resizing`. |
| `data-part="table-expander"` | The expand button, with `data-expanded` and `aria-expanded`. |
| `data-part="table-spacer"` | The rows standing in for those not drawn while `virtual`. |
