# Icon

An SVG icon by name, from a sprite or from a folder of SVG files. It takes
the color of the text around it, and screen readers skip it unless you give
it a name.

::: preview icon/Sprite
:::

## Setup

Tell `Icon` where your icons are, once, when your app starts:

```ts
import { configureIcons } from '@vunset/vue';

configureIcons({
  // a sprite of <symbol id="name"> elements, one request for the whole set
  sprite: '/sprite.svg',
  // a folder of SVG files, for `inline` icons
  inline: import.meta.glob('./assets/icons/*.svg', { query: '?raw', import: 'default' })
});
```

Write the `import.meta.glob` in your own code, not as a path string: your
bundler needs to see it to find the files.

With Nuxt, [`@vunset/nuxt`](/nuxt/icons) calls it for you from `nuxt.config`.

## Examples

### From a folder

With `inline`, the icon's SVG file is put straight into the page instead of
pointing at the sprite. Each file loads the first time it's needed, once for
every icon of that name. Its fills become `currentColor`, so one file works
in any color.

Any one icon can point at a different sprite with its own `sprite` prop.

::: preview icon/Inline
:::

### Named icons

An icon next to a label is only decoration, so it's hidden from screen
readers. An icon on its own needs a name: give it `aria-label` or
`aria-labelledby`, and it becomes an image screen readers announce.

::: preview icon/Labeled
:::

### In a button

A button with text is named by its text, and its icon stays hidden. A button
with only an icon needs a name of its own: put `aria-label` on the button,
not on the icon.

::: preview icon/InButton
:::

### Sprite or file, switched

The same `Icon` switches between the sprite and the file when `inline`
changes.

::: preview icon/SpriteToInline
:::

### Defaults under the app's icons

A library that ships its own icons can register them with
`registerDefaultIcons`, as SVG markup. Your own folder always wins: if it has
an icon with the same name, yours is drawn. Defaults are drawn right away,
in a server render too. [`@vunset/ui`](/ui/app-icon) registers its icons
this way.

Defaults only apply to `inline` icons. An icon drawn from the sprite never
looks at them.

```ts
import { registerDefaultIcons, hasIcon } from '@vunset/vue';

registerDefaultIcons({ close: '<svg viewBox="0 0 16 16">…</svg>' });
hasIcon('close'); // true: the folder or the defaults have it
```

`hasIcon` can't check the sprite, since a sprite can't be asked what it
holds.

## API Reference

The element carries `data-part="icon"` and `data-name`.

::: api icon/Icon
:::

### configureIcons

| Option   | Type                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| `sprite` | `string`<div>Where the sprite is served from. `/sprite.svg` by default.</div>                                 |
| `inline` | `Record<string, () => Promise<string>>`<div>The folder of SVG files, already globbed, read as raw text.</div> |

### registerDefaultIcons

`(icons: Record<string, string>) => void`: icons by name, as SVG markup, under
the app's folder. A later call's name replaces an earlier one's.

### hasIcon

`(name: string) => boolean`: whether the inline folder or the defaults have
`name`.
