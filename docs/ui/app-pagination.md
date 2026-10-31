# AppPagination

Page numbers, previous and next arrows, and a select for how many items show
on a page. Built on [Pagination](/navigation/pagination).

::: preview ui/app-pagination/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { AppPagination } from '@vunset/ui';

const page = ref(1);
const perPage = ref(10);
</script>

<template>
  <AppPagination v-model="page" v-model:per-page="perPage" :total="230" />
</template>
```

Give it `total`, the number of items, and it works out how many pages there
are from the page size.

The page size starts at 25. Change it with `default-per-page`, or bind it
with `v-model:per-page`. The select next to the pages offers the sizes in
`per-page-options`: `10`, `25`, `50`, `100`, `500` and `1000` by default.
If the current size isn't one of them, it's added. Pass `[]` to hide the
select.

When the user picks a new size, the first item they were looking at stays on
screen. On page 3 at 10 a page they see items 21–30, so switching to 20 a
page takes them to page 2.

`per-page-label` names the select for screen readers and heads its list,
"Per page" by default.

### When the server pages the data

If your server does the paging and only tells you how many pages there are,
pass `total-pages` instead of `total`. The select still shows. A new size
comes out through `update:perPage` (or the URL, with `query`), and you
fetch that page from the server.

## Examples

### More pages around the current one

`siblings` is how many pages show on each side of the current one, and
`boundaries` how many always show at each end. Both are `1` by default.

::: preview ui/app-pagination/Pages
:::

### Links

Give `to` a function that takes a page number and returns where it goes, and
every page becomes a link. By default that's an `<a>` with the result as its
`href`. Pass `link` to render your router's link instead (`RouterLink`),
and then `to` returns its route. In Nuxt, pages are `NuxtLink`s without
setting anything. A click still emits `update:modelValue`, so the URL can
stay the source of truth.

::: preview ui/app-pagination/Links
:::

### Disabled

`disabled` turns off the pages, the arrows and the select together. Use it
while the next page loads.

::: preview ui/app-pagination/Disabled
:::

### In the URL

`query` keeps the page and the page size in the URL, as
`?page=3&perPage=50`. Page 1 and the default size are left out, to keep the
URL short. To use other names, pass them: `:query="{ page: 'p', perPage: 'size' }"`.

This needs the app to provide its route. The Nuxt module does that for you;
elsewhere, see [Pagination](/navigation/pagination#in-the-url).

```vue
<AppPagination :total="records.total" :default-per-page="100" query />
```

## Styling

| Class | On |
| --- | --- |
| `app-pagination` | The `<nav>`, with `data-disabled` |
| `app-pagination-group` | The bordered strip holding the arrows and pages |
| `app-pagination-item` | Each page and arrow, with `data-selected` on the current page and `data-disabled` |
| `app-pagination-arrow` | The arrow icons |
| `app-pagination-ellipsis` | The gaps, also an `app-pagination-item` |
| `app-pagination-per-page` | The page-size select's field |

`class` goes on the `<nav>`. `item-class` styles every page and arrow, and
`per-page-class` the select's box. See
[classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/app/app-pagination.css

## API Reference

### AppPagination

::: api app/AppPagination
:::
