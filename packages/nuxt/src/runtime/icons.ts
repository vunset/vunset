import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { configureIcons } from '@vunset/vue';
// The icon folders, globbed: written by the module, since a glob takes no variable.
import { inline } from '#vunset/icons';

export default defineNuxtPlugin({
  name: 'vunset:icons',
  setup() {
    const { sprite } = (useRuntimeConfig().public.vunset as { icons: { sprite?: string } }).icons;
    configureIcons({ sprite: sprite || undefined, inline });
  }
});
