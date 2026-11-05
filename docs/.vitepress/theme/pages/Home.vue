<template>
  <div class="min-h-dvh relative isolate">
    <BeamShader
      :key="String(isDark)"
      :light="!isDark"
      class="absolute inset-x-0 top-0 -z-1 h-[min(68rem,130svh)] w-full mask-b-from-50%"
    />

    <Header class="sticky top-0" />

    <main class="mx-auto max-w-4xl px-4 pt-20 pb-16 md:pt-32">
      <section class="flex flex-col items-center gap-4 text-center">
        <a
          v-if="release"
          :href="withBase('/changelog')"
          style="--i: 0"
          class="home-appear pill inline-flex items-center gap-1.25 rounded-[20px] py-1 pr-2.5 pl-1 text-sm text-docs-text/50 duration-150 hover:text-docs-text"
        >
          <span class="rounded-full bg-docs-accent/15 px-2 py-0.5 font-mono text-xs/4 text-docs-accent">
            v{{ release.version }}
          </span>
          <span v-if="release.note">{{ release.note }}</span>
          <span aria-hidden="true">→</span>
        </a>

        <h1 style="--i: 1" class="home-appear text-4xl font-medium text-docs-text sm:text-5xl">{{ hero.text }}</h1>

        <p v-if="hero.tagline" style="--i: 2" class="home-appear text-lg text-docs-text/80">
          <span v-for="line in hero.tagline.split(/(?<=\.) /)" :key="line" class="sm:block">{{ line }} </span>
        </p>
      </section>

      <section
        v-if="packages.length"
        class="mt-8 has-data-hovered:*:scale-90 grid gap-2 md:grid-cols-3"
        @mouseleave="hovered = undefined"
      >
        <div
          v-for="(item, index) in packages"
          :key="item.name"
          :style="{ '--i': 3 + index }"
          class="home-appear home-card flex flex-col gap-1.5 rounded-2xl data-hovered:scale-100 p-1.5 text-docs-text backdrop-blur-xl"
          :class="item.accent ? 'relative z-1 md:scale-100' : 'scale-90'"
          :data-primary="item.accent || undefined"
          :data-hovered="item.name === hovered || undefined"
          :data-active="item.name === active || undefined"
          @mouseenter="hovered = item.name"
          @focusin="hovered = item.name"
        >
          <div class="flex items-center justify-between gap-3 py-1 pr-1 pl-2">
            <a :href="withBase(item.link)" class="font-mono text-sm font-bold">{{ item.name }}</a>

            <span
              v-if="item.badge"
              class="rounded-full bg-docs-text/10 px-2 py-0.5 text-xs font-medium text-docs-text/80"
            >
              {{ item.badge }}
            </span>
          </div>

          <div class="flex flex-1 flex-col gap-3 rounded-[11px] bg-docs-bg p-3">
            <p class="text-sm/4.5 text-docs-text/80">{{ item.details }}</p>

            <div
              v-if="item.install"
              class="mt-auto flex items-center gap-2 rounded-lg border border-docs-border bg-docs-surface py-1.5 pr-1.5 pl-3"
            >
              <code class="min-w-0 flex-1 font-mono text-xs leading-5">
                <span class="text-docs-text/50 select-none">$ </span>{{ item.install }}
              </code>

              <Copy
                :value="item.install"
                :aria-label="`Copy ${item.install}`"
                class="home-copy grid size-7 shrink-0 place-items-center rounded-md text-docs-text/50 duration-150 hover:bg-docs-border hover:text-docs-text data-copied:text-docs-accent"
              />
            </div>

            <a
              :href="withBase(item.link)"
              class="home-action grid h-9 place-items-center rounded-lg px-3.5 text-sm/5 font-medium"
            >
              {{ item.action ?? 'Get started' }}
            </a>
          </div>
        </div>
      </section>

      <section
        :style="{ '--i': 3 + packages.length }"
        class="home-appear mt-16 flex flex-col items-center gap-6 md:mt-32"
      >
        <div class="flex flex-col items-center gap-3 text-center">
          <h2 class="text-3xl font-medium text-docs-text md:text-4xl">Style it your way</h2>
          <p class="text-docs-text/80">One input, written three ways. Every one renders the same.</p>
        </div>

        <article class="w-full"><Content /></article>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useData, withBase } from 'vitepress';
import { Copy } from '@vunset/vue';
import Header from '../components/Header.vue';
import BeamShader from '../components/BeamShader.vue';

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
// the primary card's button stays lit until another card is hovered
const active = computed(() => hovered.value ?? packages.value.find((item) => item.accent)?.name);

const release = computed<{ version: string; note: string } | undefined>(() => theme.value.release);
</script>

<style>
@reference '../style.css';

@property --card-from {
  syntax: '<color>';
  inherits: false;
  initial-value: transparent;
}

@property --card-to {
  syntax: '<color>';
  inherits: false;
  initial-value: transparent;
}

@property --card-edge {
  syntax: '<color>';
  inherits: false;
  initial-value: transparent;
}

.home-card,
.home-card:before {
  --card-from: --alpha(var(--color-docs-text) / 12%);
  --card-to: --alpha(var(--color-docs-text) / 2%);
  --card-edge: --alpha(var(--color-docs-text) / 15%);
}

.home-card {
  isolation: isolate;
  background: linear-gradient(var(--card-from), var(--card-to));
  transition:
    --card-from 200ms,
    --card-to 200ms,
    --card-edge 200ms,
    scale 200ms;

  &:before {
    @apply absolute inset-0 -z-1 rounded-[inherit];
    @apply mask-b-from-20% mask-b-to-black/20;
    content: '';
    box-shadow:
      inset 0 1px 0 0 --alpha(var(--color-docs-text) / 30%),
      inset 0 0 0 1px var(--card-edge);
  }
}

.home-card[data-primary],
.home-card[data-primary]::before {
  --card-from: --alpha(var(--color-docs-text) / 40%);
  --card-edge: --alpha(var(--color-docs-text) / 50%);
}

.home-card[data-hovered],
.home-card[data-hovered]::before {
  --card-from: --alpha(var(--color-docs-accent) / 30%);
  --card-to: --alpha(var(--color-docs-accent) / 10%);
  --card-edge: --alpha(var(--color-docs-accent) / 60%);
}

html:not(.dark) {
  .home-card,
  .home-card::before {
    --card-from: --alpha(var(--color-docs-text) / 5%);
    --card-to: --alpha(var(--color-docs-text) / 2%);
    --card-edge: --alpha(var(--color-docs-text) / 8%);
  }

  .home-card[data-primary],
  .home-card[data-primary]::before {
    --card-from: --alpha(var(--color-docs-text) / 10%);
    --card-edge: --alpha(var(--color-docs-text) / 14%);
  }

  .home-card[data-hovered],
  .home-card[data-hovered]::before {
    --card-from: --alpha(var(--color-docs-accent) / 22%);
    --card-to: --alpha(var(--color-docs-accent) / 6%);
    --card-edge: --alpha(var(--color-docs-accent) / 55%);
  }

  .home-card::before {
    box-shadow:
      inset 0 1px 0 0 --alpha(var(--color-docs-accent) / 10%),
      inset 0 0 0 1px var(--card-edge);
  }

  .home-card > div:last-child {
    box-shadow: 0 1px 2px --alpha(var(--color-docs-text) / 6%);
  }

  .home-action {
    box-shadow:
      inset 0 -1px 0 0 --alpha(var(--color-docs-text) / 6%),
      inset 0 0 0 1px var(--color-docs-border);
  }
}

.home-action {
  @apply bg-docs-bg text-docs-text duration-200 hover:opacity-85;
  box-shadow:
    inset 0 1px 0 0 --alpha(var(--color-docs-text) / 20%),
    inset 0 0 0 1px var(--color-docs-border);
  transition-property: background, color, box-shadow, opacity;
}

.home-card[data-active] .home-action {
  @apply text-docs-bg;
  background: linear-gradient(--alpha(var(--color-docs-text) / 80%), var(--color-docs-text));
  box-shadow: inset 0 0 0 1px var(--color-docs-text);
}

@keyframes home-appear {
  from {
    opacity: 0;
    filter: blur(8px);
    translate: 0 8px;
  }
}

.home-appear {
  animation: home-appear 700ms cubic-bezier(0.2, 0.8, 0.2, 1) calc(var(--i, 0) * 70ms) backwards;
}

@media (prefers-reduced-motion: reduce) {
  .home-appear {
    animation: none;
  }
}

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
