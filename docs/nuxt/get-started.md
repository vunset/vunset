# Get Started

`@vunset/nuxt` sets everything up for a Nuxt app. Every component and
composable is available in your pages without importing it, and the styles
are already loaded.

## Install

```sh
npm install @vunset/nuxt
```

`@vunset/vue` and `@vunset/ui` come with it, so you don't install them
separately.

Add the module to your config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vunset/nuxt']
});
```

That's it. Use anything straight away:

```vue
<script setup lang="ts">
const { setToast } = useToast();
</script>

<template>
  <AppButton variant="solid" tone="accent" @click="setToast({ title: 'Saved' })">Save</AppButton>
  <AppToaster />
</template>
```

### Charts and data tables

These need one more package each. Install the ones you use, and the
components show up on their own:

```sh
npm install @tanstack/charts     # ChartRoot and its parts, AppChartArea, AppChartBar, …
npm install @tanstack/vue-table  # DataTable, AppDataTable
```

## What you get

- **Every component**: the headless parts (`DialogRoot`, `SelectTrigger`, …)
  and the styled ones (`AppButton`, `FormSelect`, …), under their own names.
  A page loads only the components it uses. If you have a component with the
  same name, yours wins.
- **The composables**: `useToast`, `useTheme`, `useClipboard`, `useValidate`,
  [`useClickOutside`](/utilities/click-outside), [`useVirtualList`](/utilities/virtual-list),
  [`useLocalStorage`](/utilities/local-storage), [`useDownload` and
  `useExportCsv`](/utilities/download), plus
  [`useInfinityFetch`](/nuxt/use-infinity-fetch), which loads a list a page at
  a time as you scroll.
- **The helpers** from `@vunset/utils`, in the app and in server routes:
  [`formatDate`](/helpers/dates), [`formatNumber`](/helpers/numbers),
  `calcTotal`, [`formatCsv`](/helpers/strings), … A helper of your own with the
  same name wins.
- **The types you write yourself**, like `ListboxOption`, `ToastOptions`,
  `AppMenuEntry` or `DataTableColumn`, without importing them.
- **The stylesheet**, `@vunset/ui/all.css`, loaded before your own CSS. Don't
  import it again.
- **Icons** from a folder of SVG files, or a sprite built from one.
  [Icons and sprites](/nuxt/icons).
- **Light and dark mode**, remembered across visits. [Theme](/nuxt/theme).
- **Server rendering** works as is, toasts included.
  [Toasts on the server](/nuxt/toasts).

## Links and the router

A menu item's or a paginator's `to` renders as `NuxtLink`, with nothing to
set up. A pagination's page and a data table's sort can be kept in the URL,
since the module hands them Nuxt's router. See [the sort in the
URL](/data/data-table#the-sort-in-the-url) and [the page in the
URL](/navigation/pagination#in-the-url).

## Options

```ts
export default defineNuxtConfig({
  modules: ['@vunset/nuxt'],
  vunset: {
    prefix: 'Vs'
  }
});
```

| Option        | Default   |                                                                                                                             |
| ------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `prefix`      | `''`      | Goes in front of every component name: `'Vs'` gives you `<VsDialogRoot>` and `<VsAppButton>`.                               |
| `vue`         | `true`    | Registers the headless parts. The composables are imported either way.                                                      |
| `ui`          | `true`    | Registers the styled components and loads their stylesheet. Set it to `false` if you only want the headless parts.          |
| `css`         | with `ui` | Loads `@vunset/ui/all.css`. Turn it off to import [only the stylesheets you use](/ui/theming#only-the-stylesheets-you-use). |
| `preflight`   | `false`   | Loads ui's [CSS reset](/ui/get-started#without-tailwind). Turn it on if you don't use Tailwind.                             |
| `composables` | `true`    | Auto-imports the composables.                                                                                               |
| `utils`       | `true`    | Auto-imports the `@vunset/utils` helpers.                                                                                   |
| `icons`       |           | Where your icons live. [Icons and sprites](/nuxt/icons).                                                                    |
| `theme`       | `true`    | Sets up light and dark mode. [Theme](/nuxt/theme). `false` leaves it to you.                                                |
