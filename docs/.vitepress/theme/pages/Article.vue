<template>
  <div>
    <Header class="sticky top-0" />

    <main
      class="grid lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[minmax(12rem,1fr)_minmax(0,48rem)_minmax(12rem,1fr)] gap-x-8 max-w-7xl mx-auto overflow-clip"
    >
      <AsideLeft class="max-lg:hidden" />

      <article class="px-4 xl:px-0 py-6 w-full min-w-0 max-w-200 xl:max-w-3xl mx-auto">
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
      @apply mt-6;
    }

    & > :is(p, ul, ol) + :is(p, ul, ol) {
      @apply mt-[1lh];
    }

    & > h1 + * {
      @apply mt-1;
    }

    & > :is(h2, h3) + * {
      @apply mt-3;
    }
  }

  & > div > div > :is(p, ul, ol) {
    @apply text-base/[1.4];
  }

  h1 {
    @apply text-4xl/normal font-normal text-docs-text;
  }

  h2 {
    @apply text-2xl font-normal;
  }

  h3 {
    @apply text-xl font-normal;
  }

  :where(h1, h2, h3, h4, h5, h6)[id] {
    @apply outline-none;
  }

  :is(h1, h2, h3) {
    @apply relative hover:[&_.header-anchor]:opacity-30;

    .header-anchor {
      @apply before:content-['#'];
      @apply opacity-0 font-normal;
      @apply duration-200 hover:opacity-100;
    }
  }

  ul {
    @apply list-disc pl-5 space-y-2 marker:text-docs-text/50;
  }

  p a {
    @apply text-docs-text border-current/30 hover:border-docs-accent hover:text-docs-accent duration-200;

    &:not(:has(code)) {
      @apply border-b;
    }

    & code {
      @apply hover:bg-docs-accent/30 duration-200 border rounded border-dashed border-docs-accent/30;
    }
  }

  :not(pre) > code {
    @apply rounded px-1.5 py-0.5 bg-current/10 font-mono text-[0.85em] text-docs-text;
    @apply whitespace-nowrap max-md:whitespace-normal max-md:wrap-anywhere;
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
    @apply card relative py-3 px-4;

    .lang {
      @apply hidden;
    }

    pre {
      @apply font-mono text-xs/relaxed overflow-auto scrollbar-thin scrollbar-thumb-current/20;
    }

    .copy {
      @apply absolute top-3.5 right-3.5 size-3.5 opacity-50 duration-200 cursor-copy hover:opacity-100;

      background-color: currentColor;
      mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIi8+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiIvPjwvc3ZnPg==');
      mask-repeat: no-repeat;
      mask-position: center;
      mask-size: cover;

      &.copied {
        @apply opacity-100;
        mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Im0xMiAxNSAyIDIgNC00Ii8+PHJlY3Qgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiB4PSI4IiB5PSI4IiByeD0iMiIgcnk9IjIiLz48cGF0aCBkPSJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyIi8+PC9zdmc+');
      }
    }
  }
}
</style>
