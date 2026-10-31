<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { PaginationRoot, PaginationPrev, PaginationNext, PaginationItem, PaginationEllipsis } from '@vunset/vue';
import FormSelect from '../form/FormSelect.vue';
import AppIcon from './AppIcon.vue';

defineOptions({ name: 'AppPagination' });

const props = withDefaults(
  defineProps<{
    /** The current page, from 1, bound with `v-model`. */
    modelValue?: number;
    /** The page at first, when no `v-model` owns it. */
    defaultValue?: number;
    /** Total items: the page count is worked out from it and `per-page`. */
    total?: number;
    /** The page count, given directly: from a server that pages by `per-page`. */
    totalPages?: number;
    /** Items per page, bound with `v-model:per-page`. */
    perPage?: number;
    /** Items per page at first, when no `v-model:per-page` owns it. */
    defaultPerPage?: number;
    /** The sizes the per-page select offers. Empty hides it. */
    perPageOptions?: number[];
    /** Names the per-page select, and heads its list of sizes. */
    perPageLabel?: string;
    /** Pages shown either side of the current one. */
    siblings?: number;
    /** Pages always shown at each end. */
    boundaries?: number;
    disabled?: boolean;
    /** Turns pages into links: the `href`, or a `link`'s `to`, for a page number. */
    to?: (page: number) => unknown;
    /** What a page renders as with `to`: `RouterLink`, `NuxtLink`, or `configureLink`'s: `a` by default, `NuxtLink` in Nuxt. */
    link?: string | object;
    /** Keeps the page and page size in the URL, as `?page=` and `?perPage=`, or under the keys given. */
    query?: boolean | { page?: string; perPage?: string };
    /** Classes for each page and arrow. */
    itemClass?: HTMLAttributes['class'];
    /** Classes for the per-page select's trigger. */
    perPageClass?: HTMLAttributes['class'];
  }>(),
  {
    modelValue: undefined,
    defaultValue: 1,
    perPage: undefined,
    defaultPerPage: 25,
    perPageOptions: () => [10, 25, 50, 100, 500, 1000],
    perPageLabel: 'Per page',
    siblings: 1,
    boundaries: 1
  }
);

const emit = defineEmits<{
  'update:modelValue': [page: number];
  'update:perPage': [perPage: number];
}>();

// One group, headed by the label, so the open list says what the numbers are.
const sizes = (current: number) => [
  {
    label: props.perPageLabel,
    options: [...new Set([...props.perPageOptions, current])]
      .sort((a, b) => a - b)
      .map((size) => ({ value: size, label: size.toString() }))
  }
];
</script>

<template>
  <PaginationRoot
    v-slot="{ items, page, perPage: size, setPerPage }"
    class="app-pagination"
    :model-value="modelValue"
    :default-value="defaultValue"
    :total="total"
    :total-pages="totalPages"
    :per-page="perPage"
    :default-per-page="defaultPerPage"
    :siblings="siblings"
    :boundaries="boundaries"
    :disabled="disabled"
    :to="to"
    :link="link"
    :query="query"
    @update:model-value="emit('update:modelValue', $event)"
    @update:per-page="emit('update:perPage', $event)"
  >
    <div class="app-pagination-group">
      <PaginationPrev class="app-pagination-item" :class="itemClass">
        <AppIcon name="chevron-left" class="app-pagination-arrow" />
      </PaginationPrev>

      <template v-for="entry in items" :key="entry.key">
        <PaginationItem
          v-if="entry.type === 'page'"
          :value="entry.page"
          class="app-pagination-item"
          :class="itemClass"
        />

        <PaginationEllipsis v-else class="app-pagination-item app-pagination-ellipsis" />
      </template>

      <PaginationNext class="app-pagination-item" :class="itemClass">
        <AppIcon name="chevron-right" class="app-pagination-arrow" />
      </PaginationNext>
    </div>

    <FormSelect
      v-if="perPageOptions.length > 0"
      class="app-pagination-per-page"
      :control-class="perPageClass"
      :model-value="size"
      :options="sizes(size)"
      :clearable="false"
      :disabled="disabled"
      :aria-label="perPageLabel"
      align-with-trigger
      @update:model-value="setPerPage(Number($event))"
    />
  </PaginationRoot>
</template>
