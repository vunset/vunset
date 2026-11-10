# Media query

`useMediaQuery` tells you whether a CSS media query matches, and keeps the
answer up to date as the window resizes or a system setting changes.

::: preview media-query/Basic
:::

```ts
import { useMediaQuery } from '@vunset/vue';

const narrow = useMediaQuery('(max-width: 1024px)');
const dark = useMediaQuery('(prefers-color-scheme: dark)');
```

Resize the window to see the first line change.

## A query that changes

The query can be a ref or a getter. When it changes, the composable reads
the new one and listens to it instead.

```ts
const breakpoint = ref(1024);
const narrow = useMediaQuery(() => `(max-width: ${breakpoint.value}px)`);
```

## Server rendering

The server has no window to measure, so there the value is `ssrValue`
(`false` by default). In a component, the value stays `ssrValue` until the
component mounts, so hydration renders what the server did. It then reads the
real answer before the browser paints. Set `ssrValue` to whatever most of your
visitors will match:

```ts
const narrow = useMediaQuery('(max-width: 1024px)', { ssrValue: true });
```

Called outside a component, it reads the query straight away. It stops
listening when its component unmounts or its effect scope is disposed.

## API Reference

### useMediaQuery

`(query: MaybeRefOrGetter<string>, options?) => Readonly<Ref<boolean>>`

| Option | Default | |
| --- | --- | --- |
| `ssrValue` | `false` | The value on the server, and in a component until it mounts. |
