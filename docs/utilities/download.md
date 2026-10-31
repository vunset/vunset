# Download

`useDownload` saves something from the page as a file, and `useExportCsv`
saves a list of rows as a CSV file. Both run straight away when you call them,
so call them from a click.

::: preview download/Basic
:::

```ts
import { useDownload, useExportCsv } from '@vunset/vue';

useExportCsv(orders, 'orders'); // orders.csv
useDownload(orders, 'orders.json'); // the rows as JSON
```

## What gets saved

`useDownload` saves a `Blob` as it is. Anything else is saved as JSON,
indented. A CSV `Blob`, such as one from [`formatCsv`](/helpers/strings#csv),
gets `.csv` added to its name when the name doesn't already end in it.

```ts
useDownload(new Blob([text], { type: 'text/plain' }), 'notes.txt');
useDownload(formatCsv(['name', 'total'], rows), 'report'); // report.csv
```

`useExportCsv` takes its columns from the first row's keys, in their order,
and writes one line for each row. It saves nothing for an empty list. For
other headers, or for only some of the columns, build the file with
`formatCsv` and pass it to `useDownload`.

Both need a browser: calling them on the server throws.

## API Reference

### useDownload

`(content: unknown, filename: string) => void`: saves `content` under
`filename`. A `Blob` is saved as it is, anything else as JSON.

### useExportCsv

`<T extends object>(data: T[], filename: string) => void`: saves `data` as a
CSV file, with the first row's keys as its headers. Adds `.csv` to
`filename` when it's missing.
