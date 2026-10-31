import { defineNuxtPlugin, navigateTo, useRouter } from '#app';
import { routeQueryKey } from '@vunset/vue';

// The route a data table keeps its sort in, and a pagination its page, through Nuxt's router.
export default defineNuxtPlugin({
  name: 'vunset:route-query',
  setup(nuxtApp) {
    const router = useRouter();
    nuxtApp.vueApp.provide(routeQueryKey, {
      get(key) {
        const value = router.currentRoute.value.query[key];
        return typeof value === 'string' ? value : undefined;
      },
      // `undefined` leaves the key out of the URL.
      set: (key, value) => navigateTo({ query: { ...router.currentRoute.value.query, [key]: value } }),
      setMany: (entries) => navigateTo({ query: { ...router.currentRoute.value.query, ...entries } })
    });
  }
});
