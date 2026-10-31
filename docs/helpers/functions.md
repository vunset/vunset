# Functions

## debounce

Waits for a burst of calls to stop, then runs once, with the last call's
arguments. Use it for work that should follow typing rather than every key,
such as a search request:

```ts
import { debounce } from '@vunset/utils';

const search = debounce((query: string) => fetchResults(query), 300);

search('v');
search('vu');
search('vue'); // only this one runs, 300 ms after it
```

It comes from `@vunset/utils`. `@vunset/vue` exports it too, and
[`@vunset/nuxt`](/nuxt/get-started) imports it for you.

## API Reference

### debounce

`(fn: (...args) => unknown, ms?: number) => (...args) => void`: a function
that runs `fn` once `ms` (300 by default) have passed without another call.
`fn`'s return value is dropped, since it runs later.
