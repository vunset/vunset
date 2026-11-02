<template>
  <div class="min-h-dvh relative isolate">
    <Header class="sticky top-0" />

    <main class="mx-auto max-w-5xl px-6 pt-24 pb-30">
      <section class="max-w-130">
        <a
          v-if="release"
          :href="withBase('/changelog')"
          class="mb-6 inline-flex items-center gap-2.5 rounded-full border border-docs-border-subtle bg-docs-bg/60 py-1 pr-3 pl-1 text-sm text-docs-muted duration-150 hover:border-docs-accent/40 hover:text-docs-text"
        >
          <span class="rounded-full bg-docs-accent/15 px-2 py-0.5 font-mono text-xs font-medium text-docs-accent">
            v{{ release.version }}
          </span>
          <span v-if="release.note">{{ release.note }}</span>
          <span aria-hidden="true">→</span>
        </a>

        <h1 class="text-4xl font-semibold tracking-tight text-docs-text sm:text-5xl">{{ hero.text }}</h1>
        <p v-if="hero.tagline" class="mt-5 text-lg text-docs-muted">{{ hero.tagline }}</p>
      </section>

      <section v-if="packages.length" class="mt-10 grid gap-3 md:grid-cols-3" @mouseleave="hovered = undefined">
        <div
          v-for="item in packages"
          :key="item.name"
          class="flex flex-col gap-4 rounded-2xl border p-5 bg-docs-bg/50 duration-150 backdrop-blur-xl"
          :class="item.name === active ? 'border-docs-accent/50' : 'border-docs-border-subtle/50'"
          @mouseenter="hovered = item.name"
        >
          <div class="flex items-center justify-between gap-3">
            <a :href="withBase(item.link)" class="font-mono text-sm font-medium text-docs-text hover:text-docs-accent">
              {{ item.name }}
            </a>

            <span
              v-if="item.badge"
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="item.name === active ? 'bg-docs-accent/15 text-docs-accent' : 'bg-docs-chip text-docs-muted'"
            >
              {{ item.badge }}
            </span>
          </div>

          <p class="text-sm text-docs-muted">{{ item.details }}</p>

          <div
            v-if="item.install"
            class="mt-auto flex items-center gap-2 rounded-lg border border-docs-border bg-docs-bg-subtle py-1.5 pr-1.5 pl-3"
          >
            <code class="min-w-0 flex-1 font-mono text-xs leading-5 text-docs-text">
              <span class="text-docs-muted select-none">$ </span>{{ item.install }}
            </code>

            <Copy
              :value="item.install"
              :aria-label="`Copy ${item.install}`"
              class="home-copy grid size-7 shrink-0 place-items-center rounded-md text-docs-muted duration-150 hover:bg-docs-chip hover:text-docs-text data-copied:text-docs-accent"
            />
          </div>

          <a
            :href="withBase(item.link)"
            class="self-start rounded-full border px-4 py-2 text-sm font-medium duration-150"
            :class="
              item.name === active
                ? 'border-docs-accent bg-docs-accent text-docs-bg hover:bg-docs-accent/85'
                : 'border-docs-border-subtle text-docs-text hover:bg-docs-bg-subtle'
            "
          >
            {{ item.action ?? 'Get started' }}
          </a>
        </div>
      </section>

      <section class="mt-24">
        <h2 class="text-2xl font-semibold tracking-tight text-docs-text">Style it your way</h2>
        <p class="mt-2 mb-6 text-docs-muted">One switch, written three ways.</p>
        <article><Content /></article>
      </section>
    </main>

    <PrismRays :key="String(isDark)" :light="!isDark" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useData, withBase } from 'vitepress';
import { Copy } from '@vunset/vue';
import Header from '../components/Header.vue';
import PrismRays from '../components/PrismRays.vue';

interface Package {
  name: string;
  badge?: string;
  details: string;
  install?: string;
  link: string;
  action?: string;
  accent?: boolean;
}

const { frontmatter, site, theme, isDark } = useData();

const hero = computed<{ text: string; tagline?: string }>(
  () => frontmatter.value.hero ?? { text: site.value.title, tagline: site.value.description }
);

const packages = computed<Package[]>(() => frontmatter.value.packages ?? []);

const hovered = ref<string>();
const active = computed(() => hovered.value ?? packages.value.find((item) => item.accent)?.name);

const release = computed<{ version: string; note: string } | undefined>(() => theme.value.release);
</script>

<style>
@reference '../style.css';

.home-copy [data-part='copy-icons'] {
  @apply grid size-3.5;
}

.home-copy [data-part='copy-icon'] {
  @apply col-start-1 row-start-1 size-full;
}

.home-copy [data-part='copy-icon']:not([data-active]) {
  @apply invisible;
}
</style>
