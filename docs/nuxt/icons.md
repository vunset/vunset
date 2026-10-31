# Icons and sprites

Put your SVG files in `~/assets/icons` and [`Icon`](/utilities/icon) and
[`AppIcon`](/ui/app-icon) find them by name, inline or from a sprite the
module builds out of the same folder. There's no
[`configureIcons`](/utilities/icon#setup) call to write.

Elsewhere, tell the module where they are:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vunset/nuxt'],
  vunset: {
    icons: {
      dir: '~/assets/icons',
      spriteDir: '~/assets/sprite' // Optional
    }
  }
});
```

There are three settings, and you can combine them:

| `icons` option | Default            |                                                                                      |
| -------------- | ------------------ | ------------------------------------------------------------------------------------ |
| `dir`          | `'~/assets/icons'` | A folder of SVG files, drawn inline. A list looks in several folders.                |
| `spriteDir`    | `'~/assets/icons'` | A folder of SVG files to build a sprite from. A list builds one sprite from several. |
| `sprite`       | `'/sprite.svg'`    | Where the sprite is: a path the app serves, or a URL.                                |

A default folder counts only where it exists, and `spriteDir`'s only while
`sprite` isn't set. `icons: false` leaves icons to you.

Icons pick up the text color, so `color` and Tailwind's `text-*` classes
work on them. Stroke icons keep their stroke.

## Icons from a folder

With `dir`, an icon drawn with `inline` puts its SVG file straight into the
page:

```vue
<Icon name="home" inline />
```

Each file loads the first time it's needed, once for every icon of that
name. Give `dir` a list to look in several folders: the first that has the
name wins. A file with the same name as one of ui's icons (`close.svg`)
replaces it everywhere.

## Building a sprite

A sprite is one file holding every icon, so a page asks for all of them in a
single request. Point `spriteDir` at a folder of SVG files and the module
builds the sprite for you, and serves it at `sprite`:

```vue
<Icon name="home" />
```

- **One symbol per file.** `home.svg` becomes `<symbol id="home">`, so the
  file's name is the icon's name. With a list of folders, the first that has
  a name wins.
- **Ready to color.** Fills become `currentColor`, and a shape with no fill
  of its own is filled, as it is when the file is opened alone. The file's own
  `viewBox`, and a stroke set on its `<svg>`, move to the symbol.
- **Served with the app.** In development it comes from the dev server; a
  build copies it into the output, whichever host you deploy to. `sprite` has
  to be a path then, like `/icons.svg`, not a URL.
- **Rebuilt as you edit.** In development, adding or changing a file rebuilds
  the sprite. Reload the page to see it. This needs the folder inside your
  app, where Nuxt watches for changes.

A file with no `<svg>` in it is left out, with a warning in the terminal, and
so is a folder that doesn't exist.

## A sprite of your own

With `sprite` set and no `spriteDir`, `sprite` points at a sprite you made yourself: a file in
`public/`, or one on a CDN. It holds a `<symbol id="name">` for each icon.

```ts
export default defineNuxtConfig({
  modules: ['@vunset/nuxt'],
  vunset: {
    icons: { sprite: 'https://cdn.example.com/icons.svg' }
  }
});
```

It's runtime config, so you can change it without a rebuild through
`NUXT_PUBLIC_VUNSET_ICONS_SPRITE`. Any one icon can point at another sprite
with its own `sprite` prop.
