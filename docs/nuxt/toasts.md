# Toasts on the server

[`useToast()`](/feedback/toast) works anywhere, server rendering included. A
toast raised while the server renders a page shows up in that page's HTML and
then times out as usual in the browser. Each request gets its own toasts, so
users never see each other's.

```vue
<script setup lang="ts">
const { error } = await useFetch('/api/report');
if (error.value) useToast().setToast({ title: 'The report failed to load', type: 'error' });
</script>
```

## What survives the trip

Only plain data can travel from the server to the browser. A toast raised on
the server keeps its `title`, `text`, `type`, timing and plain `data`, but
loses functions: `onClose`, `slot`, or an action's `onClick`. You get a
warning in development if that happens.
