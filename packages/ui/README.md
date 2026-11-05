# @vunset/ui

[![npm](https://img.shields.io/npm/v/@vunset/ui/latest)](https://www.npmjs.com/package/@vunset/ui)
[![License: MIT](https://img.shields.io/npm/l/@vunset/ui)](https://github.com/vunset/vunset/blob/main/LICENSE)

Pre-styled Vue 3 components. A `FormInput` is the label, the input,
the help text and the error, all in one. They're built from
[`@vunset/vue`](https://www.npmjs.com/package/@vunset/vue)'s headless parts, so
everything is accessible, and you can restyle any of it.

## Install

```sh
npm install @vunset/ui @vunset/vue
```

Then import the stylesheet once, before your own CSS:

```ts
import '@vunset/ui/all.css';
```

Using Nuxt? Install [`@vunset/nuxt`](https://www.npmjs.com/package/@vunset/nuxt)
instead. It registers the components and loads the stylesheet for you.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormInput, AppButton } from '@vunset/ui';

const email = ref('');
</script>

<template>
  <FormInput v-model="email" label="Email" help="We'll never share it." />
  <AppButton variant="solid" tone="accent">Subscribe</AppButton>
</template>
```

`Form*` components hold a value a form submits (`FormInput`, `FormSelect`);
`App*` are everything else (`AppButton`, `AppDialog`). CSS classes follow the
name: `FormSwitch` is `.form-switch`.

## Setup notes

**With Tailwind**, import ui next to it. Tailwind classes on a component win
over ui's own styles:

```css
@import 'tailwindcss';
@import '@vunset/ui/all.css';
```

**Without Tailwind**, the components need a CSS reset underneath. Import ui's
before the stylesheet:

```ts
import '@vunset/ui/preflight.css';
import '@vunset/ui/all.css';
```

**With Vite**, keep `light-dark()` as it is, or the colors break in a
production build:

```ts
import { Features } from 'lightningcss';

export default defineConfig({
  css: { lightningcss: { exclude: Features.LightDark } }
});
```

## Data table

`AppDataTable` has its own entry point, and needs `@tanstack/vue-table`:

```sh
npm install @tanstack/vue-table
```

```ts
import { AppDataTable } from '@vunset/ui/data-table';
```

## Documentation

[vunset.com/ui/get-started](https://vunset.com/ui/get-started)

For AI assistants: [vunset.com/llms.txt](https://vunset.com/llms.txt) indexes
every page, and each page is also served as markdown at its URL plus `.md`, with
its examples' source and API tables written out.

## License

MIT
