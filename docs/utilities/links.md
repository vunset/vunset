# Links

A few components render links for you when you give them a `to`: the pages
of a [Pagination](/navigation/pagination), and the items of an
[AppMenu](/ui/app-menu) or [AppMenubar](/ui/app-menubar). Without a `to`,
they render buttons instead.

By default those links are plain `<a>` elements, with `to` as their `href`.
To make them router links, tell the library once, when your app starts:

```ts
import { RouterLink } from 'vue-router';
import { configureLink } from '@vunset/vue';

configureLink(RouterLink);
```

From then on every one of those links is a `RouterLink`, and it gets `to`
exactly as you wrote it: a path or a route object.

Need something different in one place? Each of those components takes a
`link` prop, which wins over `configureLink` for that component.

With Nuxt, you don't need any of this: [the module](/nuxt/get-started#links-and-the-router) sets `NuxtLink`
for you.
