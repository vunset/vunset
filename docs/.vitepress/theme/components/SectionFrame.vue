<script setup lang="ts">
defineSlots<{ title(): unknown; meta?(): unknown; aside?(): unknown; default(): unknown }>();
</script>

<!-- A page section as a window: its `##` heading beside, its content in a card -->
<template>
  <section class="section-frame @container">
    <div
      class="grid gap-2 p-2 items-start rounded-[28px] bg-canvas-subtle border border-edge @2xl:grid-cols-[10rem_minmax(0,1fr)]"
    >
      <div class="flex flex-col gap-3 min-w-0 pt-1 @2xl:sticky @2xl:top-3">
        <div class="section-title flex flex-wrap items-baseline gap-x-3 gap-y-1 px-2">
          <slot name="title" />
          <span v-if="$slots.meta" class="font-mono text-xs text-muted"><slot name="meta" /></span>
        </div>

        <slot name="aside" />
      </div>

      <div class="min-w-0"><slot /></div>
    </div>
  </section>
</template>
