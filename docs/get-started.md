# Get Started

`@vunset/vue` gives you components that already work: keyboard, focus,
ARIA, open and close, the fiddly parts. What they look like is up to you.
Nothing ships with styles, so there's nothing to override.

If you'd rather start from something styled, take a look at
[`@vunset/ui`](/ui/get-started), which is built on top of this package.

## Install

```sh
npm install @vunset/vue
```

Using Nuxt? Install [`@vunset/nuxt`](/nuxt/get-started) instead and skip the imports
below: it registers every component for you.

## Your first component

Each component comes in parts: a root that holds the state, and the pieces
inside it. Import the ones you need and put them together:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { SwitchRoot, SwitchThumb } from '@vunset/vue';

const enabled = ref(false);
</script>

<template>
  <label>
    <SwitchRoot v-model="enabled" class="switch">
      <SwitchThumb class="switch-thumb" />
    </SwitchRoot>
    Notifications
  </label>
</template>
```

That's a working switch. You can click it, toggle it with the keyboard, and
a screen reader announces it, but it has no look yet. The root is a real
`<button>`, which is what lets the `<label>` around it name it.

## Styling

Classes go straight on the parts, like on any element. Each part also tells
you what state it's in through `data-*` attributes, so you style states with
plain CSS selectors:

```css
.switch {
  width: 2.5rem;
  border-radius: 999px;
  background: #ddd;
}

.switch[data-checked] {
  background: #16a34a;
}

.switch[data-disabled] {
  opacity: 0.5;
}
```

Most parts also carry a `data-part` attribute (`data-part="thumb"`), in case
you'd rather target that than add a class. Each component's page lists the
attributes it sets.

With Tailwind, the same attributes work as variants:

```vue
<SwitchRoot class="w-10 rounded-full bg-gray-200 data-checked:bg-green-600" />
```

## Rendering your own element

Every part takes an `as` prop for the element it renders: a tag, or a
component of your own. Your component gets all of the part's attributes and
listeners, so it keeps working:

```vue
<DialogTrigger :as="MyButton">Open</DialogTrigger>
```

## Popups

Dialogs, menus, popovers and tooltips render their popups at the end of the
`<body>`, so a parent's `overflow: hidden` can't cut them off. If your page
has an element with `id="teleports"`, they go there instead. Nuxt adds one
for you.

## Charts and data tables

These two have their own entry points, because they need an extra
library you may not want in every app:

```sh
npm install @tanstack/charts       # for @vunset/vue/chart
npm install @tanstack/vue-table    # for @vunset/vue/data-table
```

```ts
import { ChartRoot, ChartArea } from '@vunset/vue/chart';
import { DataTable } from '@vunset/vue/data-table';
```

If you don't use them, you don't need to install anything extra.

## What's next

Pick a component from the sidebar. Every page starts with a live example,
shows the parts it's made of, and ends with the props, events and attributes
you can use.
