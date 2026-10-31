# @vunset/nuxt

The Nuxt module for Vunset. Every component and composable is available in your
pages without importing it, and the styles are already loaded.

## Install

```sh
npm install @vunset/nuxt
```

[`@vunset/vue`](https://www.npmjs.com/package/@vunset/vue),
[`@vunset/ui`](https://www.npmjs.com/package/@vunset/ui) and
[`@vunset/utils`](https://www.npmjs.com/package/@vunset/utils) come with it.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vunset/nuxt']
});
```

That's it:

```vue
<script setup lang="ts">
const { setToast } = useToast();
</script>

<template>
  <AppButton variant="solid" tone="accent" @click="setToast({ title: 'Saved' })">Save</AppButton>
  <AppToaster />
</template>
```

Charts and data tables need one more package each. Install the ones you use,
and the components show up on their own:

```sh
npm install @tanstack/charts     # ChartArea, ChartBar, ChartDual, ChartDonut
npm install @tanstack/vue-table  # DataTable, AppDataTable
```

## What you get

- Every component, headless (`DialogRoot`, `SelectTrigger`) and styled
  (`AppButton`, `FormSelect`), loaded only on the pages that use it.
- The composables (`useToast`, `useTheme`, `useClipboard`, `useInfinityFetch`, …)
  and the `@vunset/utils` helpers, auto-imported, in server routes too.
- The stylesheet, loaded before your own CSS.
- Icons from a folder of SVG files, or a sprite built from one.
- Light and dark mode, remembered across visits.
- Server rendering, toasts included.

## Options

```ts
export default defineNuxtConfig({
  modules: ['@vunset/nuxt'],
  vunset: {
    prefix: 'Vs'
  }
});
```

| Option        | Default   |                                                                      |
| ------------- | --------- | -------------------------------------------------------------------- |
| `prefix`      | `''`      | Goes in front of every component name: `'Vs'` gives `<VsAppButton>`. |
| `vue`         | `true`    | Registers the headless parts.                                        |
| `ui`          | `true`    | Registers the styled components and loads their stylesheet.          |
| `css`         | with `ui` | Loads `@vunset/ui/all.css`.                                          |
| `preflight`   | `false`   | Loads ui's CSS reset. Turn it on if you don't use Tailwind.          |
| `composables` | `true`    | Auto-imports the composables.                                        |
| `utils`       | `true`    | Auto-imports the `@vunset/utils` helpers.                            |
| `icons`       | see docs  | Where your icons live: `{ dir, spriteDir }`, both `~/assets/icons`.  |
| `theme`       | `true`    | Sets up light and dark mode. `false` leaves it to you.               |

## Documentation

[vunset.github.io/vunset/nuxt/get-started](https://vunset.github.io/vunset/nuxt/get-started)

## License

MIT
