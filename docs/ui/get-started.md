# Get Started

`@vunset/ui` is pre-styled Vue 3 components. A `FormInput` is the
label, the input, the help text and the error, all in one. Under the hood
it's built from [`@vunset/vue`](/get-started)'s parts, so everything is
accessible, and you can restyle any of it.

## Install

```sh
npm install @vunset/ui @vunset/vue
```

Then import the stylesheet once, before your own CSS:

```ts
import '@vunset/ui/all.css';
```

Using Nuxt? Install [`@vunset/nuxt`](/nuxt/get-started) instead. It registers the
components and adds the stylesheet for you, so skip this page's setup.

## Your first component

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

## With Tailwind

Import ui next to Tailwind; the order doesn't matter. Tailwind classes on a
component win over ui's own styles:

```css
@import 'tailwindcss';
@import '@vunset/ui/all.css';
```

```vue
<AppButton class="rounded-full">Subscribe</AppButton>
```

## Without Tailwind

The components expect a CSS reset underneath, the kind that strips a
button's default border and background. Tailwind includes one. Without
Tailwind, import ui's before the stylesheet:

```ts
import '@vunset/ui/preflight.css';
import '@vunset/ui/all.css';
```

It touches only what the components need. The page's font, the `body` margin
and your headings stay yours.

## With Vite

Add this to `vite.config.ts`, or the colors break in a production build:

```ts
import { Features } from 'lightningcss';

export default defineConfig({
  css: { lightningcss: { exclude: Features.LightDark } }
});
```

The colors use `light-dark()`, and by default Vite rewrites it for old
browsers in a way that only works when the color scheme is set in the same
CSS. Every browser ui supports reads `light-dark()` as it is.

## Names

- `Form*` components hold a value a form submits: `FormInput`, `FormSelect`,
  `FormCheckbox`.
- `App*` are everything else: `AppButton`, `AppDialog`, `AppToaster`.

CSS classes follow the name: `FormSwitch` is `.form-switch`, and its thumb
is `.form-switch-thumb`.

## v-model

Bind a `Form*` component with `v-model` and it always shows your ref, even
while the ref is `undefined`. Without `v-model` it keeps its own value,
starting from `default-value`.

When the user clears a field, the value goes back to `''`, `[]` or `null`.
Add `.optional` to get `undefined` instead, which is handy for filters: an
empty one simply drops out of the query.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const companies = ref<number[]>(); // undefined until something is picked
</script>

<template>
  <FormSelect v-model.optional="companies" multiple :options="COMPANIES" />
</template>
```

`.trim` and `.number` work on `FormInput` and `FormTextarea` the same way they
do on an `<input>`.

## What's next

- [Theming](/ui/theming): colors, sizes, dark mode, and loading only the CSS
  you use.
- Or pick a component from the sidebar.
