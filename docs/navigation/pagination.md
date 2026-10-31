# Pagination

Page numbers with previous and next arrows. The root works out which pages to
show around the current one, with ellipses for the gaps. You get that list in
its slot and render it.

::: preview pagination/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { PaginationRoot, PaginationPrev, PaginationItem, PaginationEllipsis, PaginationNext } from '@vunset/vue';
</script>

<template>
  <PaginationRoot v-slot="{ items }">
    <PaginationPrev />
    <template v-for="item in items" :key="item.key">
      <PaginationItem v-if="item.type === 'page'" :value="item.page" />
      <PaginationEllipsis v-else />
    </template>
    <PaginationNext />
  </PaginationRoot>
</template>
```

## Examples

### Siblings and boundaries

`siblings` sets how many pages show on either side of the current one.
`boundaries` sets how many stay at each end. Everything else collapses into
an ellipsis.

::: preview pagination/Range
:::

### From a total

Give it `total` items and `per-page`, and it works out the number of pages.
95 items at 10 a page makes 10 pages.

::: preview pagination/Total
:::

### Page size

`v-model:per-page` holds the page size. Change it with the slot's
`setPerPage`, and the current page moves so the first row on screen stays in
view. Row 21 is on page 3 at 10 a page, and on page 2 at 20.

::: preview pagination/PageSize
:::

### Links

Give `to` a function that returns the address of a page, and every page
becomes a link. People can open a page in a new tab, and crawlers can follow
them. Clicking one still updates `v-model`.

By default the pages render as your app's link component, set once with
[`configureLink`](/utilities/links), or as a plain `<a>` using the address as
its `href`. Pass `link` to use another component, such as `RouterLink`. It
gets the address as `to`. Without `to`, the pages are `<button>`s.

::: preview pagination/Links
:::

### Disabled

`disabled` turns off every page and both arrows, for example while the rows
are loading.

::: preview pagination/Disabled
:::

### In the URL

`query` keeps the page and page size in the URL, as `?page=3&perPage=50`. The
pagination starts from the URL, writes every change back, and follows the URL
when it changes, so Back and Forward work.

It needs your app's route. With [`@vunset/nuxt`](/nuxt/get-started#links-and-the-router) that's done for
you. Elsewhere you provide it once, as shown for
[the data table's sort](/data/data-table#the-sort-in-the-url).

- Page 1 and the `default-per-page` size are left out of the URL.
- Changing the size, and the page it moves to, is one navigation, not two.
- `:query="{ page: 'p', perPage: 'size' }"` renames the keys.
- A bound `v-model` or `v-model:per-page` keeps its value out of the URL.

### Links that set the query

Here each page is a link to `?page=…`, and the page is read back from the URL,
with the page size beside it. Clicking a link navigates in place. Opening it
in a new tab lands on the same page.

::: preview pagination/QueryLinks
:::

## API Reference

### PaginationRoot

The element carries `data-part="pagination"`, and `aria-label="Pagination"`
to name the `<nav>`.

::: api pagination/PaginationRoot
:::

### PaginationItem

The element carries `data-part="item"`, `data-page` with its number, and
`aria-label="Page N"`. The current page also has `data-selected` and
`aria-current="page"`. Style the current page with `[data-selected]`.

::: api pagination/PaginationItem
:::

### PaginationPrev, PaginationNext

The elements carry `data-part="prev"` or `data-part="next"`, and are labeled
"Previous page" and "Next page". They're disabled on the first and last page,
with `data-disabled`.

::: api pagination/PaginationPrev
:::

::: api pagination/PaginationNext
:::

### PaginationEllipsis

The element carries `data-part="ellipsis"`. It's hidden from screen readers,
because the page labels already say where the gaps are.

::: api pagination/PaginationEllipsis
:::
