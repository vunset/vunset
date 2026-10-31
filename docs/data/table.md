# Table

A real `<table>` inside a container that scrolls. It handles the things a
plain table makes hard: a header or footer that sticks, columns pinned to an
edge, fixed widths, striping that survives sorting, and sort state that
screen readers can read.

::: preview table/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { TableRoot, TableCaption, TableHeader, TableBody, TableFooter, TableRow, TableHeadCell, TableCell } from '@vunset/vue';
</script>

<template>
  <TableRoot>
    <TableCaption />
    <TableHeader>
      <TableRow>
        <TableHeadCell />
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell />
      </TableRow>
    </TableBody>
    <TableFooter />
  </TableRoot>
</template>
```

`TableRoot` renders a `<div>` around the `<table>`. That `<div>` is what
scrolls, and your classes and attributes go on it. Give it a height or width
to scroll within. Every other part renders the element it's named after.

If you'd rather build the table from your data and get sorting, nested rows
and column controls for free, see [Data table](/data/data-table).

## Examples

### Sticky header

`sticky-header` keeps the header at the top of the container while you
scroll, and `sticky-footer` keeps the footer at the bottom. Pass a number to
keep it that many pixels from the edge, below an app bar for example. A
sticky part covers what scrolls under it, so give its cells a background.

::: preview table/Sticky
:::

### Pinned columns and sorting

Set `pinned` to `start` or `end` on a column's head cell and on each of its
cells, and the column stays put while the table scrolls sideways. Use
`offset` to push a second pinned column past the first.

`width` fixes a column's width, so the browser's table layout can't stretch
or squeeze it. A cell with a `width` gets `data-sized`.

The table doesn't sort for you, but it tells screen readers how a column is
sorted. Set `sort` on a head cell to `asc` or `desc` while you sort by it, and
`false` while you don't. Leave it out on a column that can't be sorted.

::: preview table/Pinned
:::

### Sticky and pinned together

Forty rows and ten columns in a box that scrolls both ways: the header and
footer stay on screen, and the first column stays put beside them. Toggle each
one off to see what it was holding.

::: preview table/StickyAndPinned
:::

## Striping

Give each `TableRow` its `index` in your data, and it gets `data-index` plus
`data-odd` or `data-even`. Style those instead of `:nth-child`: they stay
right when rows are filtered out or only some are rendered.

If you render only some of the rows, set `row-count` on `TableRoot` to the
full number, so screen readers know how many there are.

## API Reference

### TableRoot

::: api table/TableRoot
:::

The container carries `data-part="table-container"`, and `data-sticky-header`
and `data-sticky-footer` when they stick. The table inside it carries
`data-part="table"`, and `aria-rowcount` with `row-count`.

### TableCaption

The element carries `data-part="table-caption"`.

### TableHeader

The element carries `data-part="table-header"`, and `data-sticky` while it
sticks.

### TableBody

The element carries `data-part="table-body"`.

### TableFooter

The element carries `data-part="table-footer"`, and `data-sticky` while it
sticks.

### TableRow

The element carries `data-part="table-row"`; with an `index`, `data-index`
and `data-odd` or `data-even`; `data-selected` with `selected`; and
`data-expanded` with `expanded`.

::: api table/TableRow
:::

### TableHeadCell

The element carries `data-part="table-head-cell"`, `scope="col"`, `data-sort`
while sorted, `aria-sort`, `data-pinned` while pinned, and `data-sized` with a
`width`.

::: api table/TableHeadCell
:::

### TableCell

The element carries `data-part="table-cell"`, `data-pinned` while pinned,
and `data-sized` with a `width`.

::: api table/TableCell
:::
