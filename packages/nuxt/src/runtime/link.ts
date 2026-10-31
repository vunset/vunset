import { defineNuxtPlugin } from '#app';
import { NuxtLink } from '#components';
import { configureLink } from '@vunset/vue';

// Every `to` the library turns into a link goes through NuxtLink, unless a component is told otherwise.
export default defineNuxtPlugin({
  name: 'vunset:link',
  setup() {
    configureLink(NuxtLink);
  }
});
