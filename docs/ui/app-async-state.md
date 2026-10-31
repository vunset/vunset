# AppAsyncState

Everything a list or panel that loads data needs to show: a loader while it
loads, the content, an empty message, or the error with a retry button.
Built on [Async state](/feedback/async-state).

::: preview ui/app-async-state/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppAsyncState } from '@vunset/ui';
</script>

<template>
  <AppAsyncState :status="status" :data="orders" empty-title="No orders yet" @retry="load">
    <OrderList :orders="orders" />
  </AppAsyncState>
</template>
```

Pass the request's `status` (`idle`, `pending`, `success` or `error`) and
the `data` it returned. `null` and an empty array, map, set or object count as
no data. If `data` can't tell, pass `has-data` yourself. The default slot is
your content. It shows whenever there's data, unless a reload is running
without `soft-loading`.

| View    | When                                 | Drawn                                                                          |
| ------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| loading | `pending`, unless `soft-loading` keeps the data on screen | A loader, `loading-title` and `loading-text` |
| empty   | `success` with no data               | `empty-title`, `empty-text`, and the `#empty-actions` slot                     |
| error   | `error` with no data to keep showing | `error-title`, `error-text`, and a retry button while `@retry` is listened for |
| idle    | before anything is asked for         | `idle-title` and `idle-text`, or the `#idle` slot; nothing without either      |

With `soft-loading`, a reload keeps the content on screen, dimmed under the
loader, instead of switching to the loading view. Each view's slot
(`#pending`, `#empty`, `#error`, `#idle`) replaces that view entirely. Screen
readers announce the loading and empty views politely and the error right
away.

## Styling

| Class                    | On                                                          |
| ------------------------ | ----------------------------------------------------------- |
| `app-async-state`        | The root, with `data-status` and `data-view`                |
| `app-async-state-loader` | The loader, in the loading view and over reloading content  |

The loading, empty and error views are [AppEmptyState](/ui/app-empty-state)s,
styled by its classes (`app-empty-state-title`, `-description`, `-actions`),
the loader an [AppDotMatrix](/ui/app-dot-matrix).

<<< ../../packages/ui/src/app/app-async-state.css

## API Reference

### AppAsyncState

::: api app/AppAsyncState
:::
