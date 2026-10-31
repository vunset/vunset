# Inline SVG

`parseInlineSvg` splits an SVG file into the attributes of its `<svg>` and the
markup inside it, so you can draw it inside an `<svg>` of your own.
[`Icon`](/utilities/icon) uses it for its `inline` icons.

```ts
import { parseInlineSvg } from '@vunset/utils';

parseInlineSvg('<svg width="24" viewBox="0 0 24 24"><path fill="#111" d="…"/></svg>');
// { attrs: { viewBox: '0 0 24 24' }, content: '<path fill="currentColor" d="…"/>' }
```

Every fill becomes `currentColor`, so one file takes the color of the text
around it. `fill="none"` stays. The root's `width`, `height`, `id`, `xmlns`
and `version` are dropped, so your own `<svg>` sets them.

It comes from `@vunset/utils`. `@vunset/vue` exports it too, and
[`@vunset/nuxt`](/nuxt/get-started) imports it for you.

## API Reference

### parseInlineSvg

`(raw: string) => InlineSvg | null`: `{ attrs, content }`, the root's
attributes as a record and its inner markup as a string. `null` when there's
no `<svg>` in `raw`.

Only double-quoted attributes on the root are read. The markup inside is
passed through as it is, apart from its fills, so only use it on SVG files
you trust.
