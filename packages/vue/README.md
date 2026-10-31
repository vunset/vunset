# @vunset/vue

Headless, unstyled Vue 3 components. They already work: keyboard, focus,
ARIA, open and close, the fiddly parts. What they look like is up to you.
Nothing ships with styles, so there's nothing to override.

If you'd rather start from something styled, see
[`@vunset/ui`](https://www.npmjs.com/package/@vunset/ui), which is built on this
package.

## Install

```sh
npm install @vunset/vue
```

Using Nuxt? Install [`@vunset/nuxt`](https://www.npmjs.com/package/@vunset/nuxt)
instead: it registers every component for you.

## Usage

Each component comes in parts: a root that holds the state, and the pieces
inside it.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { SwitchRoot, SwitchThumb } from '@vunset/vue';

const enabled = ref(false);
</script>

<template>
  <label>
    <SwitchRoot v-model="enabled" native class="switch">
      <SwitchThumb class="switch-thumb" />
    </SwitchRoot>
    Notifications
  </label>
</template>
```

Every part reports its state through `data-*` attributes, so you style it with
plain CSS, or as Tailwind variants:

```css
.switch[data-checked] {
  background: #16a34a;
}
```

```vue
<SwitchRoot class="w-10 rounded-full bg-gray-200 data-checked:bg-green-600" />
```

Every part takes an `as` prop for the element it renders: a tag, or a component
of your own.

## Charts and data tables

These have their own entry points, because they need a library you may not want
in every app. Install it only if you use them:

```sh
npm install @tanstack/charts       # for @vunset/vue/chart
npm install @tanstack/vue-table    # for @vunset/vue/data-table
```

```ts
import { ChartArea } from '@vunset/vue/chart';
import { DataTable } from '@vunset/vue/data-table';
```

## Helpers

`@vunset/vue` re-exports everything in
[`@vunset/utils`](https://www.npmjs.com/package/@vunset/utils), so
`formatDate`, `formatNumber` and the rest import from here too.

## Documentation

[vunset.github.io/vunset/get-started](https://vunset.github.io/vunset/get-started)

## License

MIT
