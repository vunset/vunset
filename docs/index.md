---
layout: home

hero:
  text: Headless Vue components, done right
  tagline: Accessible, keyboard-ready parts with no styles attached. Bring your own design, or start pre-styled.

packages:
  - name: '@vunset/vue'
    badge: Primitives
    details: Headless parts with no styles at all. Style them with classes and the data-* attributes they set.
    install: npm i @vunset/vue
    link: /get-started
    action: Get started
    accent: true
  - name: '@vunset/ui'
    badge: Pre-styled
    details: The same parts, put together and styled. Change colors and sizes with CSS variables.
    install: npm i @vunset/ui
    link: /ui/get-started
    action: Browse components
  - name: '@vunset/nuxt'
    badge: Module
    details: One module. Every component and composable is ready to use, with no imports.
    install: npm i @vunset/nuxt
    link: /nuxt/get-started
    action: Set up Nuxt
---

<HomeExample>
<template #tailwind>

<<< @/.vitepress/demos/home/SwitchTailwind.vue

</template>
<template #css>

<<< @/.vitepress/demos/home/SwitchCss.vue

</template>
<template #ui>

<<< @/.vitepress/demos/home/SwitchUi.vue

</template>
</HomeExample>
