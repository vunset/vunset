<template>
  <div class="min-h-dvh">
    <Header class="sticky top-0" />

    <main class="mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-30 text-center sm:pt-28">
      <div
        class="relative grid place-items-center rounded-[28px] border border-dashed border-edge-subtle px-10 py-6 pattern-diagonal backdrop-blur-2xl sm:px-16"
      >
        <span class="text-[clamp(6rem,22vw,11rem)] leading-none font-semibold tracking-tighter tabular-nums">
          404
        </span>

        <code class="pill max-w-full truncate">
          &lt;Page data-part="page" <span class="text-accent">data-missing</span> /&gt;
        </code>
      </div>

      <h1 class="mt-6 text-3xl font-semibold tracking-tight text-surface-strong sm:text-4xl">This page has no parts</h1>
      <p class="mt-4 max-w-110 text-lg text-muted">
        Nothing renders at
        <span class="font-mono text-base break-all text-surface">{{ path }}</span
        >. <br />It may have moved, or never existed.
      </p>

      <div class="mt-9 flex flex-wrap justify-center gap-3">
        <a
          :href="withBase('/')"
          class="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-canvas duration-150 hover:bg-accent/85"
        >
          Back home
        </a>
        <a
          :href="withBase('/get-started')"
          class="rounded-full border border-edge-subtle px-5 py-2.5 text-sm font-medium text-surface duration-150 hover:bg-canvas-subtle"
        >
          Get started
        </a>
      </div>
    </main>

    <PrismRays />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { withBase } from 'vitepress';
import Header from '../components/Header.vue';
import PrismRays from '../components/PrismRays.vue';

const path = ref('this address');
onMounted(() => (path.value = location.pathname));
</script>
