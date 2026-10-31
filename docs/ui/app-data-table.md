# AppDataTable

A table built from your rows and a list of columns. You get sorting from the
headers, nested rows, pinned and resizable columns, a footer, and virtual
scrolling for long lists. It's [Data table](/data/data-table) with ui's
table look, ui's icons and an empty message.

::: preview ui/app-data-table/Basic
:::

## Installation

AppDataTable has its own entry point, so apps that don't use it never load
TanStack Table. Install it alongside:

```sh
npm install @tanstack/vue-table
```

```ts
import { AppDataTable, type DataTableColumn } from '@vunset/ui/data-table';
```

Its styles come with `@vunset/ui/all.css`. If you
[load stylesheets one by one](/ui/theming#only-the-stylesheets-you-use),
import `app-table.css` and then `app-data-table.css`.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { AppDataTable, type DataTableColumn } from '@vunset/ui/data-table';

const sorting = ref([]);

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'salary', header: 'Salary', meta: { class: 'app-table-numeric' } }
];
</script>

<template>
  <AppDataTable v-model:sorting="sorting" :data="people" :columns="columns">
    <template #cell-salary="{ cell }">{{ usd(cell) }}</template>
  </AppDataTable>
</template>
```

`columns` are TanStack Table column definitions. Every prop, `v-model` and
slot of [Data table](/data/data-table#api-reference) works the same here.

### Drawing cells

A column's cells show their value as text. To draw them yourself, use a slot
named after the column: `#cell-<id>` for its body cells, `#head-<id>` for its
header, `#foot-<id>` for its footer.

To right-align a column of numbers with all digits the same width, put
`app-table-numeric` in its `meta.class`.

### Classes on the parts

`class` lands on the scrolling container, and the cells take their alignment
from it, so `class="text-center"` centers the whole table. For the parts
inside, `table-class`, `header-class`, `body-class` and `footer-class` go on
the `<table>`, `<thead>`, `<tbody>` and `<tfoot>`. `row-class` goes on every
body row, and `th-class`, `td-class` and `tf-class` on every head, body and
foot cell, beside a column's own `meta` classes.

```vue
<template>
  <AppDataTable :data="rows" :columns="columns" class="text-center" th-class="uppercase" row-class="h-12" />
</template>
```

### Sorting

Click a header to sort by that column. To start sorted without binding
`v-model:sorting`, pass `default-sort="name:asc"`.

If your server sorts the data, add `manual-sorting`. The table then only
tracks the sort and keeps it in [the URL](/data/data-table#the-sort-in-the-url)
as `?sortBy=name:asc`. In Nuxt that works out of the box. Elsewhere your
app provides its route first.

### Resizing columns

Set `enableResizing: true` on a column to put a drag strip on its header's
edge. Drag it to resize; double-click it to reset. A column never gets
narrower than its header. Bind `v-model:column-sizing` to keep the widths.
In the table above, Name and Role resize.

A column with a `size` stays that wide. A longer value is cut off with an
ellipsis instead of widening the column.

## Examples

### Nested rows

`nested-key` names the key that holds a row's children. An expand button
appears at the start of each row that has some, and nested rows are indented
by their depth. With `expand-on-row-click`, clicking anywhere on the row opens
it too.

::: preview ui/app-data-table/Nested
:::

### Column groups

A column with `columns` of its own becomes a group: its header spans its
children's, in a row above them. Give it an `id`, since it has no accessor to
take one from.

::: preview ui/app-data-table/ColumnGroups
:::

### Nested, grouped and pinned

Everything together: nested rows, a column group, a pinned and resizable
first column, a sticky header and footer, and sorting. A footer cell's
`getValues()` adds up its column.

::: preview ui/app-data-table/NestedGroupsPinned
:::

### Virtual scrolling

`virtual` renders only the rows in view, so ten thousand rows cost about as
much as twenty. Give the table a height to scroll within (`max-h-96`), or
leave it to follow the page as it scrolls, and add `sticky-header` to keep the header in view. `striped` tints every other
row; it's Data table's prop, passed through.

Each row here is heavy on purpose: a copy button, a badge, a checkbox, an
editing popover and a delete confirm. The popover and the confirm are
`lazy` (see [AppPopover](/ui/app-popover#in-every-row)). Fling it, or drag
the scrollbar.

::: preview ui/app-data-table/Virtual
:::

`virtual` takes three forms:

```vue
<AppDataTable virtual />           <!-- the first row's height, measured -->
<AppDataTable :virtual="40" />     <!-- 40px rows; bound, or "40" is a string -->
<AppDataTable :virtual="{ rowHeight: 40, overscan: 12 }" />
```

Every field of the object is optional. `overscan` is how many rows are drawn
past each edge of the view (8).

As it scrolls, a row coming into view takes over the elements and
components of one going out, its cells handed the new row's values, so even
a jump of a screenful builds nothing new. What a cell's parts hold of their
own, an open popover, a checked box with no `v-model`, starts over for the
new row; bind a value to the row's data to keep it.

### Empty

With no rows, the table shows `empty-text` across its columns. Use the
`#empty` slot to show something else.

::: preview ui/app-data-table/Empty
:::

## Keyboard

| Key                                | Does                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------- |
| <kbd>Tab</kbd>                     | Moves through the sort buttons and expand buttons.                          |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | On a header, cycles its sort; on an expand button, opens or closes the row. |

## Styling

| Class                  | On                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `app-table`            | The container: a bordered box that scrolls. Its cells, header and footer are styled through it |
| `app-data-table`       | The container too: the sort buttons, resize strips, expand buttons, nested rows and column groups |
| `app-table-striped`    | Add it to the table, or pass `striped`: every other body row tinted                       |
| `app-table-numeric`    | Add it to a column (`meta.class`): right-aligned, tabular figures                        |
| `app-data-table-empty` | The empty text                                                                            |

The cells' background, stripe, hover and selected colors are
`--ui-table-bg`, `--ui-table-stripe`, `--ui-table-hover` and
`--ui-table-selected`; see [Theming](/ui/theming#tables).

`class` and other attributes go on the container. The cells carry Data
table's attributes (`data-column`, `data-pinned`, `data-sort`, `data-depth`,
…) for anything a class doesn't cover.

The sort and expand icons are Data table's own, styled through
`.app-data-table`. The sort icon's arrows stay faint until their direction is
in use (`data-active`), and the expand chevron turns while its row is open
(`data-expanded`). The `#sort`, `#sort-<id>` and `#expander-icon` slots
replace them.

<<< ../../packages/ui/src/app/app-table.css

<<< ../../packages/ui/src/app/app-data-table.css

## API Reference

### AppDataTable

::: api app/AppDataTable
:::

The TanStack Table instance is exposed as `table`.

#### Slots

| Slot                                 | Props                                                                                                                                                                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#cell-<id>`                         | `cell` (the cell's value), `row` (the row's data), `depth`, `isNested` (`depth > 0`), `expanded`<div>A body cell of that column. `#<id>`, the bare column id, works too, and wins if both are given; avoid ids that clash with the other slots here (`empty`, `sort`, `expander`).</div> |
| `#head-<id>`                         | `column`, `getValues()`<div>The column's head cell, inside the sort button when it sorts.</div>                                                                                                                                   |
| `#head-<id>-start`, `#head-<id>-end` | `getValues()`<div>Before and after the column's header text, keeping the text: a hint icon, a total. Inside the sort button when it sorts. `#head-<id>` replaces both along with the text.</div>                                |
| `#foot-<id>`                         | `column`, `getValues()`<div>The column's foot cell. `getValues()` is the column's value in every top-level row, for a total.</div>                                                                                                |
| `#sort`, `#sort-<id>`                | `direction`: `'asc' \| 'desc' \| false`<div>Replaces the sort icon, in every column or in one.</div>                                                                                                                              |
| `#expander`                          | `row` (TanStack's row, not your data), `expanded`, `toggle()`<div>Replaces the expand button. It renders on every row, so check `row.getCanExpand()` yourself.</div>                                                             |
| `#expander-icon`                     | `expanded`<div>Replaces the chevron inside the expand button.</div>                                                                                                                                                               |
| `#empty`                             | <div>Replaces the empty text. Its row carries `data-empty`.</div>                                                                                                                                                                 |
