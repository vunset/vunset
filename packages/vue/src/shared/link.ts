import type { Component } from 'vue';

let link: string | Component = 'a';

/**
 * What a link the library draws renders as when it isn't told: a page of a
 * paginator, a menu item with `to`. `a` by default, with `to` as its `href`;
 * a router link takes `to` as it is. The Nuxt module sets `NuxtLink`.
 *
 * ```ts
 * configureLink(RouterLink);
 * ```
 */
export function configureLink(component: string | Component): void {
  link = component;
}

export function defaultLink(): string | Component {
  return link;
}
