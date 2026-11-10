# Numbers

Writing numbers, money and percentages for people, reading them back, and the
sums a dashboard needs: a total, an average, a share, a change.

```ts
import { formatCurrency, formatPercentage, parseNumber, calcTotal } from '@vunset/utils';

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

## Reading numbers back

`parseNumber` reads text the way the same options write it: the locale's
grouping and decimal separators, a currency or unit sign, a percent (as the
fraction). It's what [Number field](/forms/number-field) reads typing with.
Unlike `formatNumber`, the locale is the runtime's own unless you pass one.

```ts
parseNumber('1.234,5', { locale: 'de-DE' }); // 1234.5
parseNumber('$1,234.50', { locale: 'en-US', style: 'currency', currency: 'USD' }); // 1234.5
parseNumber('12%', { locale: 'en-US', style: 'percent' }); // 0.12
parseNumber(''); // null
parseNumber('abc'); // NaN
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
calcPercentage(300, 200, true); // 100: clamped to 0–100
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

### parseNumber

`(text: string | null | undefined, options?: ParseNumberOptions) => number | null`:
the number `text` reads as under `locale` and `Intl.NumberFormat` options;
`null` for empty text, `NaN` for text that isn't a number.

### toPlainNumber

`(text: string, options?: ParseNumberOptions) => string | null`: `text` as plain
digits with `.` and `-`, a half-typed number (`'-'`, `'1.'`) kept as it is;
`null` when it holds a character no number in that format could.

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

`(a: number, b: number, clamp?: boolean) => number`: `a` as a percentage of
`b`, to two decimals. `Infinity` when `b` is 0. With `clamp`, the result is
held within `0` and `100`, so `Infinity` becomes `100`.

### calcDiffPercentage

`(a: number, b: number) => number`: how far `b` is from `a`, as a percentage
of `a`, to two decimals: negative when it went down. When `a` is 0 or less,
there's nothing to compare against, and it returns `100`.
