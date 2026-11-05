<template>
  <div class="min-h-dvh relative isolate overflow-clip">
    <BeamShader
      :key="String(isDark)"
      :light="!isDark"
      class="absolute inset-x-0 top-0 -z-1 h-[min(68rem,130svh)] w-full mask-b-from-50%"
    />

    <Header />

    <main class="mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-30 text-center sm:pt-28">
      <div
        class="relative grid place-items-center rounded-docs-window border border-dashed border-docs-border px-10 py-6 pattern-diagonal backdrop-blur-2xl sm:px-16"
      >
        <span class="text-[clamp(6rem,22vw,11rem)] leading-none font-semibold tracking-tighter tabular-nums">
          404
        </span>

        <code
          class="max-w-full truncate rounded-full bg-docs-surface px-2.5 py-0.5 font-mono text-xs text-docs-text/85"
        >
          &lt;Page data-part="page" <span class="text-docs-accent">data-missing</span> /&gt;
        </code>
      </div>

      <h1 class="mt-6 text-3xl font-semibold tracking-tight text-docs-text sm:text-4xl">This page has no parts</h1>
      <p class="mt-4 max-w-110 text-lg text-docs-text/50">
        Nothing renders at
        <span class="font-mono text-base break-all text-docs-text">{{ path }}</span
        >. <br />It may have moved, or never existed.
      </p>

      <div class="mt-9 flex flex-wrap justify-center gap-3">
        <a
          :href="withBase('/')"
          class="rounded-full bg-docs-accent px-5 py-2.5 text-sm font-medium text-docs-bg duration-150 hover:bg-docs-accent/85"
        >
          Back home
        </a>
        <a
          :href="withBase('/get-started')"
          class="rounded-full border border-docs-border px-5 py-2.5 text-sm font-medium text-docs-text duration-150 hover:bg-docs-surface"
        >
          Get started
        </a>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useData, withBase } from 'vitepress';
import Header from '../components/Header.vue';
import BeamShader from '../components/BeamShader.vue';

const { isDark } = useData();

const path = ref('this address');
onMounted(() => (path.value = location.pathname));
</script>
