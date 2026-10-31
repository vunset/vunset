<script setup lang="ts">
import { AppDotMatrix } from '@vunset/ui';
</script>

<template>
  <div class="flex items-center gap-6">
    <AppDotMatrix variant="cascade" class="size-10" />
    <AppDotMatrix variant="cascade" shape="square" class="size-10 text-(--ui-accent)" />
    <span class="flex items-center gap-2 text-sm"><AppDotMatrix label="Thinking" class="size-4" /> Thinking…</span>
  </div>
</template>
