# Strings and CSV

Splitting and joining lists kept in a single string, random ids, and CSV files
built from rows.

```ts
import { toSeparatedArray, formatCsv } from '@vunset/utils';

toSeparatedArray('red, green,,blue', ','); // ['red', 'green', 'blue']
formatCsv(['name', 'total'], rows); // a CSV Blob
```

They come from `@vunset/utils`. `@vunset/vue` exports them too, and
[`@vunset/nuxt`](/nuxt/get-started) imports them for you.

## Lists in a string

A list kept in one string, such as a URL parameter or a field of tags, splits
with `toSeparatedArray`. Each part is trimmed, and empty parts are dropped.
Pass `true` to keep each value once:

```ts
toSeparatedArray(' a, b,,a ', ','); // ['a', 'b', 'a']
toSeparatedArray(' a, b,,a ', ',', true); // ['a', 'b']
```

`toSeparatedString` joins one back:

```ts
toSeparatedString(['a', 'b', 'a'], ', '); // 'a, b, a'
toSeparatedString(['a', 'b', 'a'], ', ', true); // 'a, b'
```

`toSeparatedList` does both, tidying the string in place, which suits an
input's `transform`:

```ts
toSeparatedList(' a, b,,a ', ','); // 'a,b,a'
toSeparatedList(' a, b,,a ', ',', true); // 'a,b'
```

## CSV

`formatCsv` builds a CSV file from a header row and a list of rows, ready to
download. Values with a comma, a quote or a line break are quoted for you:

```ts
const csv = formatCsv(['name', 'total'], [{ name: 'Ada', total: 12 }, ['Grace, H.', 7]]);
```

```csv
name,total
Ada,12
"Grace, H.",7
```

A row can be an object or an array. Either way its values are read in order,
not matched to the headers by name: an object's keys must come in the same
order as the headers.

To save it as a file, pass it to [`useDownload`](/utilities/download), or let
[`useExportCsv`](/utilities/download) build and save it from
your rows in one call.

## API Reference

### toSeparatedArray

`(value: string, separator: string, unique?: boolean) => string[]`: the
trimmed, non-empty parts of `value`. Empty for an empty `value` or
`separator`.

### toSeparatedString

`(value: (string | number)[], separator: string, unique?: boolean) => string`:
the items joined by `separator`. Empty for no items or no `separator`.

### toSeparatedList

`(value: string, separator: string, unique?: boolean) => string`: `value`
with its parts trimmed, empty ones dropped, and rejoined by `separator`.

### getRandomString

`(length?: number) => string`: `length` letters and digits (20 by default),
from `crypto.getRandomValues`. Good for keys and ids.

### formatCsv

`(headers: string[], rows: (Record<string, unknown> | unknown[])[]) => Blob`:
a `text/csv` file, one line for the headers and one for each row. A row gets
as many values as there are headers. A missing value is an empty cell.

### escapeCsvValue

`(value: unknown) => string`: one value as a CSV cell. Quoted when it holds a
quote, a comma or a line break, with its quotes doubled. `null` and
`undefined` give an empty cell.

```ts
escapeCsvValue('Smith, J.'); // '"Smith, J."'
escapeCsvValue('say "hi"'); // '"say ""hi"""'
```
