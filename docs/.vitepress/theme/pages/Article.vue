<template>
  <div>
    <Header class="col-span-full sticky top-0 max-lg:pb-2 max-lg:bg-canvas/85 max-lg:backdrop-blur-md" />

    <main
      class="grid lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_14rem] gap-x-6 max-w-370 mx-auto overflow-clip"
    >
      <AsideLeft class="max-lg:hidden" />

      <article class="px-4 py-12 w-full min-w-0 max-w-232 mx-auto">
        <Content />
        <PageNav />
      </article>

      <AsideRight class="max-xl:hidden" />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from '../components/Header.vue';
import AsideLeft from '../components/AsideLeft.vue';
import AsideRight from '../components/AsideRight.vue';
import PageNav from '../components/PageNav.vue';
</script>

<style>
@reference '../style.css';

article {
  & > div > div {
    & > * {
      @apply my-0;
    }

    & > * + * {
      @apply mt-4;
    }

    & > :is(p, ul, ol) + :is(p, ul, ol),
    & > h1 + * {
      @apply mt-2;
    }

    & > :is(h2, h3) + * {
      @apply mt-3;
    }

    & > h3:not(:first-child) {
      @apply mt-6;
    }

    & > :is(h2, .section-frame, :has(.section-frame)):not(:first-child) {
      @apply mt-10;
    }
  }

  h1 {
    @apply text-4xl/none text-surface-strong;
  }

  h1 + p {
    @apply text-base/relaxed mb-5;
  }

  h2 {
    @apply text-2xl;
  }

  h3 {
    @apply text-xl;
  }

  :where(h1, h2, h3, h4, h5, h6)[id] {
    @apply outline-none;
  }

  :is(h1, h2, h3) {
    @apply relative font-medium hover:[&_.header-anchor]:opacity-30;

    .header-anchor {
      @apply before:content-['#'];
      @apply opacity-0 font-normal;
      @apply duration-200 hover:opacity-100;
    }
  }

  ul {
    @apply list-disc pl-5 space-y-2 text-sm/relaxed  marker:text-muted;
  }

  p a {
    @apply text-surface border-current/30 hover:border-accent hover:text-accent duration-200;

    &:not(:has(code)) {
      @apply border-b;
    }

    & code {
      @apply hover:bg-accent/30 duration-200 border rounded border-dashed border-accent/30;
    }
  }

  :not(pre) > code {
    @apply rounded px-1.5 py-0.5 bg-chip font-mono text-[0.85em] text-surface;
    @apply whitespace-nowrap max-md:whitespace-normal max-md:[overflow-wrap:anywhere];
  }

  .line-numbers-mode {
    @apply grid grid-cols-[auto_1fr] gap-4;

    .line-numbers-wrapper {
      @apply min-w-6 tabular-nums;
      @apply select-none tabular-nums -order-1;
      @apply text-right font-mono text-xs/relaxed text-current/25;
    }

    &:not(:has(.line-number ~ .line-number)) {
      @apply block;

      .line-numbers-wrapper {
        @apply hidden;
      }
    }
  }

  [class*='language-'] {
    @apply relative p-4;

    &:not(:first-child) {
      @apply inset-card border border-edge;
    }

    .lang {
      @apply hidden;
    }

    pre {
      @apply font-mono text-xs/relaxed overflow-auto;
    }

    .copy {
      @apply absolute top-4 right-4 size-3.5 opacity-50 duration-200 cursor-copy;

      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIi8+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiIvPjwvc3ZnPg==');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;

      &.copied {
        @apply opacity-100;
        background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Im0xMiAxNSAyIDIgNC00Ii8+PHJlY3Qgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiB4PSI4IiB5PSI4IiByeD0iMiIgcnk9IjIiLz48cGF0aCBkPSJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyIi8+PC9zdmc+');
      }
    }
  }
}
</style>
