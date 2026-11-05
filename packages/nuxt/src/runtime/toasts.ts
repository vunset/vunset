import { defineNuxtPlugin, useState } from '#app';
import { createToastStore, defaultToastStore, provideToastStore, type Toast, type ToastOptions } from '@vunset/vue';

// A store per server request, handed to the page's shared store through the payload.
export default defineNuxtPlugin({
  name: 'vunset:toasts',
  setup(nuxtApp) {
    const carried = useState<ToastOptions[]>('vunset:toasts', () => []);

    if (import.meta.server) {
      const store = provideToastStore(createToastStore(), nuxtApp.vueApp);
      nuxtApp.hook('app:rendered', () => {
        carried.value = store.toasts.value.filter((toast) => toast.transitionStatus !== 'leave').map(plain);
      });
      return;
    }

    // Before the app mounts, so the page hydrates with the toasts the server drew.
    for (const toast of carried.value.slice().reverse()) defaultToastStore.add(toast);
    carried.value = [];
  }
});

// Functions don't survive the payload: `onClose`, `slot` and a `data` holding one stay behind.
function plain({ id, title, text, type, manualClose, timeout, data, onClose, slot }: Toast<any>): ToastOptions {
  const toast: ToastOptions = { id, title, text, type, manualClose, timeout };
  let dropped = Boolean(onClose || slot);
  if (data !== undefined) {
    try {
      toast.data = structuredClone(data);
    } catch {
      dropped = true;
    }
  }
  if (dropped && import.meta.dev) {
    console.warn(
      `[vunset] The toast \`${title ?? id}\` set during a server render reaches the page without its functions (\`onClose\`, \`slot\`, or one in \`data\`).`
    );
  }
  return toast;
}
