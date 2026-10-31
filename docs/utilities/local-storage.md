# Local storage

`useLocalStorage()` keeps values in `localStorage` as JSON, and is safe to
call where there's no storage: on the server, or in a browser that blocks it.
There, reads find nothing and writes do nothing, instead of throwing.

::: preview local-storage/Basic
:::

```ts
import { useLocalStorage } from '@vunset/vue';

const storage = useLocalStorage();

storage.setItem('filters', { status: 'open', page: 2 });
storage.getItem<{ status: string; page: number }>('filters'); // { status: 'open', page: 2 }
storage.removeItem('filters');
```

## Empty values

Storing nothing removes the key, so an empty value never sits in storage:
`null`, `undefined` and an empty list all do what `removeItem` does.

```ts
storage.setItem('tags', []); // removes 'tags'
storage.getItem('tags'); // undefined
```

A stored value that isn't valid JSON, such as one another script wrote, reads
as `undefined` and is removed, so it can't break the next read too.

## On the server

A server has no `localStorage`, so `getItem` returns `undefined` there. Read
a stored value in `onMounted`, not in `setup`. Otherwise the browser renders
something different from the server, and Vue reports a hydration mismatch.
The demo above does this.

## API Reference

### useLocalStorage

`() => UseLocalStorageReturn`

| Method | |
| --- | --- |
| `getItem<T>(key)` | `T \| undefined`<div>The stored value, parsed. `undefined` when there's none, or it isn't JSON.</div> |
| `setItem(key, data)` | `void`<div>Stores `data` as JSON. `null`, `undefined` or `[]` removes the key instead.</div> |
| `removeItem(key)` | `void` |
