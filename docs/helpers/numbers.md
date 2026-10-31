# Numbers

Writing numbers, money and percentages for people, and the sums a dashboard
needs: a total, an average, a share, a change.

```ts
import { formatCurrency, formatPercentage, calcTotal } from '@vunset/utils';

formatCurrency(1234.5); // '$1,234.50'
formatPercentage(0.125); // '12.5%'
calcTotal(orders, 'amount'); // the sum of every order's amount
```

They come from `@vunset/utils`. `@vunset/vue` exports them too, and
[`@vunset/nuxt`](/nuxt/get-started) imports them for you.

## Formatting

`formatNumber` writes a number through `Intl.NumberFormat`. It takes a number
or a numeric string, and any of `Intl`'s own options:

```ts
formatNumber(1234.5); // '1,234.5'
formatNumber('1234.5', { maximumFractionDigits: 0 }); // '1,235'
formatNumber(1234567, { notation: 'compact' }); // '1.2M'
formatNumber(1234.5, { locale: 'de-DE' }); // '1.234,5'
```

`formatCurrency` is the same in US dollars, or the `currency` you give it.
`formatNumber` with a `currency` does the same:

```ts
formatCurrency(1234.5); // '$1,234.50'
formatCurrency(1234.5, { currency: 'EUR', locale: 'de-DE' }); // '1.234,50 €'
formatNumber(5, { currency: 'EUR' }); // '€5.00'
```

`formatPercentage` takes a fraction, as `Intl` does: `0.125` is `12.5%`. It
shows one decimal, unless you pass number options of your own:

```ts
formatPercentage(0.125); // '12.5%'
formatPercentage(0.125, { maximumFractionDigits: 0 }); // '13%'
```

All three write `'N/A'`, or your `fallback`, for `null`, `undefined`, `''` or
anything that isn't a finite number. A table full of gaps stays readable:

```ts
formatNumber('abc'); // 'N/A'
formatCurrency(null, { fallback: '—' }); // '—'
```

## Totals and changes

`calcTotal` and `calcAvg` add up a list of numbers, or one key of a list of
objects. Numeric strings count as numbers, and a missing value counts as 0:

```ts
const orders = [{ amount: 10 }, { amount: '5' }, { amount: null }];

calcTotal([1, 2, 3]); // 6
calcTotal(orders, 'amount'); // 15
calcAvg(orders, 'amount'); // 5
```

`calcPercentage` and `calcDiffPercentage` return percentages as plain numbers,
rounded to two decimals, ready to format or compare:

```ts
calcPercentage(25, 200); // 12.5: 25 is 12.5% of 200
calcDiffPercentage(200, 150); // -25: from 200 to 150 is down 25%
calcDiffPercentage(200, 250); // 25
```

These are percentages, not fractions: format them with `formatNumber` and a
`%`, not with `formatPercentage`.

## API Reference

### formatNumber

`(value: NumberInput, options?: FormatNumberOptions) => string`

`NumberInput` is `number | string | null | undefined`. The options are
`Intl.NumberFormatOptions`, plus:

| Option | Default | |
| --- | --- | --- |
| `locale` | `'en-US'` | |
| `fallback` | `'N/A'` | What a missing or unreadable number gives |

A `currency` alone is enough: the style becomes `'currency'` on its own.

### formatCurrency

`(value: NumberInput, options?: FormatNumberOptions) => string`:
`formatNumber` as money, in `'USD'` unless you set `currency`.

### formatPercentage

`(value: NumberInput, options?: FormatNumberOptions) => string`: a fraction as
a percentage. One decimal by default. Any number options you pass replace
that default rather than being added to it.

### toFixedNumber

`(value: number, precision?: number) => number`: rounded to `precision`
decimals (2 by default), as a number rather than `toFixed`'s string:
`toFixedNumber(3.14159)` is `3.14`. It rounds the way `toFixed` does, so
`toFixedNumber(1.005, 2)` is `1`.

### calcTotal

`<T>(data: T[], key?: keyof T) => number`: the sum of the items, or of each
item's `key`. Each value is read with `Number()`, and a missing one counts as
0.

### calcAvg

`<T>(data: T[], key?: keyof T) => number`: the mean, read the same way. `0`
for an empty list.

### calcPercentage

`(a: number, b: number) => number`: `a` as a percentage of `b`, to two
decimals. `Infinity` when `b` is 0.

### calcDiffPercentage

`(a: number, b: number) => number`: how far `b` is from `a`, as a percentage
of `a`, to two decimals: negative when it went down. When `a` is 0 or less,
there's nothing to compare against, and it returns `100`.
