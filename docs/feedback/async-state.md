# Async state

Loaded data is always in one of a few states: not asked for yet, loading,
empty, failed, or there. `AsyncState` takes the request's `status` and its
`data`, and shows the right view for you, one at a time.

::: preview async-state/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { AsyncState } from '@vunset/vue';
</script>

<template>
  <AsyncState :status="status" :data="data">
    <!-- the content -->
    <template #idle />
    <template #pending />
    <template #empty />
    <template #error />
    <template #overlay />
  </AsyncState>
</template>
```

`status` is required. Every slot is optional: a view you don't fill in
renders nothing.

## Which view shows

Once there's data, you keep seeing it. A failed reload doesn't wipe what was
on screen: the content stays, and the slot's `status` tells you the request
failed. The one exception is loading: a reload swaps the content for
`#pending`, unless you turn on `soft-loading`.

| `status` | No data | Data |
| --- | --- | --- |
| `idle` | `#idle` | content |
| `pending` | `#pending` | `#pending`, or content under `#overlay` with `soft-loading` |
| `success` | `#empty` | content |
| `error` | `#error` | content |

What counts as "no data": `null`, `undefined`, and an empty array, map, set or
plain object. If `data` can't tell (say, a paginated result that's never empty
itself), pass `has-data` yourself.

## Examples

### Soft loading

With `soft-loading`, a reload keeps the content on screen and lays
`#overlay` over it, instead of swapping it for `#pending`. The first load
still shows `#pending`, because there's nothing to keep yet.

::: preview async-state/SoftLoading
:::

### Views of your own

Each slot takes any markup: a title, a line of text, an icon, a spinner.
Here `soft-loading` is on, so the first load shows `#pending` and a reload
keeps the table under the overlay's spinner.

::: preview async-state/Views
:::

## Accessibility

While loading, the element has `aria-busy`. The `#pending` and `#empty`
views are a `role="status"`, which screen readers announce politely. `#error`
is a `role="alert"`, announced at once. The overlay is hidden from screen
readers, since `aria-busy` already says it's loading.

## API Reference

### AsyncState

The element carries `data-part="async-state"`, plus its state for styling:
`data-status` (the `status` you gave it), `data-view` (`content`, `idle`,
`pending`, `empty` or `error`) and `data-refreshing` while a soft reload runs.

Any view other than the content is wrapped in an element with
`data-part="async-state-message"` and `data-view`. The overlay is an
[Appear](/utilities/appear) with `data-part="async-state-overlay"`, shown while
refreshing, and it animates the same way.

::: api async-state/AsyncState
:::
