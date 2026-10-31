# Vunset

A headless, unstyled Vue 3 component library, and a pre-styled UI built on it.

The components already work: keyboard, focus, ARIA, open and close, the
fiddly parts. What they look like is up to you, or you can start from the
styled set.

| Package                           | What it is                                                              |
| --------------------------------- | ----------------------------------------------------------------------- |
| [`@vunset/vue`](packages/vue)     | The headless parts. No styles, so there's nothing to override.          |
| [`@vunset/ui`](packages/ui)       | Pre-styled components, built from `@vunset/vue`'s parts.                |
| [`@vunset/utils`](packages/utils) | Plain helpers: dates, numbers, strings, CSV, chart colors, SVG parsing. |
| [`@vunset/nuxt`](packages/nuxt)   | A Nuxt module that registers all of the above, with nothing to import.  |

## Quick start

```sh
npm install @vunset/vue
```

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

Style states with the `data-*` attributes each part sets:

```css
.switch[data-checked] {
  background: #16a34a;
}
```

Using Nuxt? `npm install @vunset/nuxt` and add `@vunset/nuxt` to `modules`.
Every component, composable and helper is then available without importing it.

## Documentation

Every component has a page with examples, the parts it's made of, its keyboard
support and its full API: [vunset.github.io/vunset](https://vunset.github.io/vunset/).

## License

[MIT](LICENSE)
