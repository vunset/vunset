# AppTable

A table you write out yourself, row by row, in ui's look: a bordered box
that scrolls, with the header, rows, footer and caption styled for you. The
parts inside need no classes. Built on [Table](/data/table).

::: preview ui/app-table/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@vunset/vue';
import { AppTable } from '@vunset/ui';
</script>

<template>
  <AppTable>
    <TableHeader>
      <TableRow>
        <TableHeadCell>Client</TableHeadCell>
        <TableHeadCell class="app-table-numeric">Amount</TableHeadCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="(invoice, index) in invoices" :key="invoice.id" :index="index">
        <TableCell>{{ invoice.client }}</TableCell>
        <TableCell class="app-table-numeric">{{ invoice.amount }}</TableCell>
      </TableRow>
    </TableBody>
  </AppTable>
</template>
```

AppTable is the outer box, and `class` and other attributes go on it; the
cells take their alignment from it, so `class="text-center"` centers them
all. `table-class` goes on the `<table>` inside. Inside
go the [Table](/data/table) parts: `TableCaption`, `TableHeader`,
`TableBody`, `TableFooter`, and their rows and cells.

A body row highlights on hover only when you give it an `index`, and gets the
accent's tint while `selected`. Put `app-table-numeric` on a column's head
cell and cells to right-align it, with all digits the same width. The hover,
selected and stripe colors are [variables](/ui/theming#tables) you can set.

For a table built from rows and column definitions, with sorting and nested
rows, see [AppDataTable](/ui/app-data-table).

## Examples

### Scrolling

Give the table a height (`max-h-56`), and `sticky-header` keeps the header in
view. A column `pinned` to the start, with a `width`, stays put as the table
scrolls sideways. The header, footer and pinned cells have a background, so
rows don't show through them. `app-table-striped` tints every other row,
counted by `index`.

::: preview ui/app-table/Scrolling
:::

## Styling

| Class | On |
| --- | --- |
| `app-table` | The container: a bordered box that scrolls, its cells, header, footer and caption. On a raw `TableRoot`, the same look |
| `app-table-striped` | Add it to the table: every other body row tinted |
| `app-table-numeric` | A column's head cell and cells: right-aligned, tabular figures |

<<< ../../packages/ui/src/app/app-table.css

## API Reference

### AppTable

::: api app/AppTable
:::
