<script setup lang="ts">
import { AppPopover, AppButton } from '@vunset/ui';
</script>

<template>
  <div class="relative h-24 w-72 overflow-hidden rounded border border-dotted border-(--ui-border) p-2">
    <AppPopover inline trigger="Filters" :as="AppButton" variant="outline" side="right" popup-class="p-3">
      Rendered inside the box, so its overflow clips it.
    </AppPopover>
  </div>
</template>
