<template>
  <header class="max-w-370 z-5 flex mx-auto px-4 md:px-6 pt-4 pointer-events-none">
    <div
      class="flex justify-between md:grid md:grid-cols-[1fr_auto_1fr] gap-x-6 md:px-2 items-center w-full pointer-events-auto"
    >
      <a href="/" class="inline-flex w-fit items-center gap-2">
        <svg
          class="h-8 w-10.5"
          width="57"
          height="44"
          viewBox="0 0 57 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M31 12V9L45 0.5L55 6L55 13L40 28L38 27M40 28L41 14M41 14L55 6M41 14L31 9" stroke="white" />
          <path d="M38 16L28 22M0 6L0.5 13L28 42L38 31V16L10 0.5L0 6ZM28 22V42M28 22L0 6" stroke="white" />
        </svg>

        VUNSET
      </a>

      <TooltipGroup :delay="600">
        <nav
          class="flex max-md:hidden bg-canvas-subtle items-center shadow-lg shadow-black/20 border mx-auto -my-1 border-edge-subtle rounded-full p-0.5"
          :class="page.relativePath === 'index.md' ? 'invisible' : ''"
        >
          <TooltipRoot v-for="item in site.themeConfig.nav" :key="item.text">
            <TooltipTrigger
              as="a"
              :href="item.link"
              class="px-3 py-1 rounded-full duration-150"
              :class="section(item.link) === section(path) ? 'bg-chip' : 'text-muted hover:text-surface'"
            >
              {{ item.text }}
            </TooltipTrigger>

            <Portal>
              <Positioner>
                <Popup class="bg-canvas rounded-lg px-2 py-0.5 text-xs border-edge border">{{ item.tooltip }}</Popup>
              </Positioner>
            </Portal>
          </TooltipRoot>
        </nav>
      </TooltipGroup>

      <div class="flex items-center justify-end gap-0.5 pointer-events-auto">
        <SearchDialog />

        <a
          :href="site.themeConfig.socialLinks[0].link"
          target="_blank"
          class="size-8 rounded-full shrink-0 grid hover:bg-chip p-1 duration-150"
          title="GitHub"
        >
          <svg class="size-4 m-auto" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18.6586 4.97771C17.7643 3.4464 16.5514 2.23406 15.0194 1.34042C13.4871 0.44673 11.8144 0 9.99991 0C8.18569 0 6.51238 0.446867 4.98046 1.34042C3.4483 2.23402 2.23539 3.4464 1.34116 4.97771C0.447068 6.50897 0 8.18112 0 9.99412C0 12.1719 0.635737 14.1303 1.90753 15.8697C3.17919 17.6092 4.82198 18.8129 6.83577 19.4808C7.07018 19.5243 7.24371 19.4937 7.35654 19.3899C7.46941 19.2858 7.52578 19.1556 7.52578 18.9996C7.52578 18.9736 7.52354 18.7394 7.51921 18.2969C7.5151 17.9109 7.51291 17.5249 7.51264 17.1389L7.21315 17.1907C7.0222 17.2256 6.78132 17.2404 6.49049 17.2362C6.19981 17.2322 5.89804 17.2017 5.58559 17.1451C5.27302 17.089 4.98228 16.9589 4.71317 16.755C4.44419 16.5511 4.25324 16.2843 4.14036 15.9548L4.01016 15.6553C3.92337 15.456 3.78674 15.2345 3.60008 14.9917C3.41342 14.7488 3.22466 14.584 3.03371 14.4973L2.94254 14.4321C2.8818 14.3887 2.82543 14.3364 2.7733 14.2758C2.72122 14.2151 2.68223 14.1544 2.65619 14.0936C2.6301 14.0327 2.65172 13.9828 2.72127 13.9437C2.79081 13.9045 2.9165 13.8855 3.09888 13.8855L3.35919 13.9244C3.53281 13.9592 3.74757 14.0631 4.00373 14.2367C4.25976 14.4101 4.47023 14.6357 4.63518 14.9132C4.83493 15.269 5.07559 15.5401 5.35784 15.7266C5.63986 15.9132 5.92421 16.0063 6.21061 16.0063C6.49702 16.0063 6.74438 15.9846 6.95279 15.9415C7.16098 15.8981 7.35631 15.8328 7.53868 15.7461C7.61681 15.1646 7.82951 14.7179 8.17661 14.4056C7.68189 14.3537 7.2371 14.2754 6.84202 14.1713C6.44717 14.0672 6.03914 13.898 5.6182 13.6636C5.19704 13.4294 4.84766 13.1387 4.56997 12.7918C4.29223 12.4448 4.06429 11.9892 3.88648 11.4254C3.70857 10.8614 3.6196 10.2108 3.6196 9.47336C3.6196 8.42343 3.96255 7.52997 4.64832 6.79248C4.32707 6.00312 4.3574 5.11823 4.73939 4.1379C4.99113 4.05973 5.36445 4.11839 5.85918 4.31352C6.354 4.50874 6.71628 4.67597 6.94641 4.81462C7.17653 4.95323 7.36092 5.07069 7.49983 5.16596C8.30727 4.94047 9.14052 4.8277 9.99982 4.8277C10.8591 4.8277 11.6925 4.94047 12.5 5.16596L12.9948 4.85378C13.3332 4.64548 13.7327 4.45459 14.1925 4.28106C14.6526 4.10763 15.0044 4.05986 15.2475 4.13803C15.638 5.11841 15.6728 6.00326 15.3515 6.79262C16.0372 7.5301 16.3803 8.42379 16.3803 9.4735C16.3803 10.2109 16.291 10.8636 16.1133 11.4319C15.9355 12.0003 15.7056 12.4555 15.4236 12.7983C15.1412 13.1411 14.7896 13.4296 14.3687 13.6637C13.9476 13.898 13.5395 14.0671 13.1446 14.1713C12.7496 14.2755 12.3048 14.3538 11.8101 14.4059C12.2613 14.7961 12.4869 15.4121 12.4869 16.2536V18.9992C12.4869 19.1552 12.5412 19.2854 12.6498 19.3895C12.7583 19.4934 12.9297 19.524 13.1641 19.4804C15.1782 18.8125 16.8209 17.6088 18.0926 15.8693C19.364 14.1299 20 12.1716 20 9.99375C19.9995 8.18099 19.5522 6.50897 18.6586 4.97771Z"
              fill="currentColor"
            />
          </svg>
        </a>

        <MenuRoot side="bottom" align="end">
          <MenuTrigger
            class="h-8 rounded-full flex max-md:hidden items-center gap-2 hover:bg-chip data-open:bg-chip py-1 pl-3 pr-2 duration-150"
            aria-label="Packages on npm"
          >
            <svg class="size-3.5" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0V10H8V2H5V10H0V0H10Z" fill="currentColor" />
            </svg>

            <span class="text-xs font-medium">{{ site.themeConfig.version }}</span>

            <svg class="size-3 -ml-1 text-muted" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </MenuTrigger>

          <Portal>
            <Positioner class="z-50">
              <Popup
                class="w-fit flex flex-col p-1 bg-canvas-subtle border border-edge-subtle rounded-xl shadow-lg shadow-black/30 outline-none duration-150 data-enter-from:opacity-0 data-enter-from:scale-95 data-leave-to:opacity-0 data-leave-to:scale-95"
              >
                <MenuItem
                  v-for="item in packages"
                  :key="item.name"
                  as="a"
                  :href="`https://www.npmjs.com/package/${item.name}`"
                  target="_blank"
                  class="flex flex-col gap-0.5 px-3 py-2 rounded-lg outline-none duration-150 hover:bg-chip focus:bg-chip"
                >
                  <span class="font-mono text-xs font-medium text-surface">{{ item.name }}</span>
                  <span class="text-xs text-muted">{{ item.details }}</span>
                </MenuItem>
              </Popup>
            </Positioner>
          </Portal>
        </MenuRoot>

        <MobileMenu class="lg:hidden" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import SearchDialog from './SearchDialog.vue';
import MobileMenu from './MobileMenu.vue';
import { section } from '../sidebar';
import {
  TooltipGroup,
  TooltipRoot,
  TooltipTrigger,
  MenuRoot,
  MenuTrigger,
  MenuItem,
  Portal,
  Positioner,
  Popup
} from '@vunset/vue';

const { site, page } = useData();

const packages = [
  { name: '@vunset/vue', details: 'Headless primitives' },
  { name: '@vunset/ui', details: 'Pre-styled components' },
  { name: '@vunset/nuxt', details: 'Nuxt module' },
  { name: '@vunset/utils', details: 'Plain helpers' }
];

const path = computed(() => '/' + page.value.relativePath);
</script>
