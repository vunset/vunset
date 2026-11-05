# @vunset/utils

Plain helper functions: dates, numbers, strings, CSV, math, chart colors and
SVG parsing. No dependencies, no Vue, and they run anywhere, the server
included.

## Install

```sh
npm install @vunset/utils
```

Already using [`@vunset/vue`](https://www.npmjs.com/package/@vunset/vue)? It
re-exports everything here, so you don't need this package separately. With
[`@vunset/nuxt`](https://www.npmjs.com/package/@vunset/nuxt), the helpers are
auto-imported in the app and in server routes.

## Usage

```ts
import { formatDate, formatNumber, formatCsv } from '@vunset/utils';
```

## Documentation

[vunset.com/helpers/dates](https://vunset.com/helpers/dates)

For AI assistants: [vunset.com/llms.txt](https://vunset.com/llms.txt) indexes
every page, and each page is also served as markdown at its URL plus `.md`, with
its examples' source and API tables written out.

## License

MIT
