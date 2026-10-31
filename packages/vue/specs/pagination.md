# Pagination: per page

How `PaginationRoot` holds its page size, and what changing it does.

- `per-page` is a value like the page: bound with `v-model:per-page`, or owned
  by the root from `default-per-page` (10). It is read only with `total`;
  `total-pages` given directly ignores it.
- `setPerPage(n)`, in the root's slot, changes it. The first item on screen
  stays on screen: on page 3 at 10 a page (items 21–30), 20 a page moves to
  page 2 (items 21–40), and 5 a page to page 5 (items 21–25).
- The new page is worked out against the new size, then clamped to the new
  last page. It's emitted after `update:perPage`, and only when it differs.
- A size below 1, or not a whole number, is floored to one of at least 1.
- Changing `per-page` from outside doesn't move the page, beyond the clamp
  every page gets: the outside chose both.
