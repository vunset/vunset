<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue';
import { MenubarRoot, MenubarLink } from '@vunset/vue';
import AppMenu from './AppMenu.vue';
import { linkProps, type AppMenuAction, type AppMenubarEntry, type AppMenubarMenu } from './app-menu';

defineOptions({ name: 'AppMenubar' });

defineProps<{
  /** The bar, in order: menus as `{ label, items }`, each `items` as AppMenu takes them, and links as `{ label, to }`. */
  items: AppMenubarEntry[];
  /** What a link, in the bar or in a menu, renders as: `RouterLink`, `NuxtLink`, or `configureLink`'s: `a` by default, `NuxtLink` in Nuxt. */
  link?: string | Component;
  /** Disables every menu in the bar. */
  disabled?: boolean;
  /** Whether Left and Right wrap past the first and last menu. */
  loop?: boolean;
  /** Opens a menu on hover, without a first click. */
  openOnHover?: boolean;
  /** Classes for each menu's trigger, and each link, in the bar. */
  triggerClass?: HTMLAttributes['class'];
  /** Classes for every menu and submenu. */
  popupClass?: HTMLAttributes['class'];
  /** Classes for every item. */
  itemClass?: HTMLAttributes['class'];
}>();

const emit = defineEmits<{
  /** A plain item was chosen, in any menu, after its own `onSelect`. */
  select: [item: AppMenuAction, event: Event];
}>();

defineSlots<{
  /** A trigger's or a link's content, in place of its label. */
  trigger?(props: { menu: AppMenubarEntry }): unknown;
  /** An item's label, in place of `label`. */
  item?(props: { item: AppMenuAction }): unknown;
}>();

const isMenu = (entry: AppMenubarEntry): entry is AppMenubarMenu => 'items' in entry;
</script>

<template>
  <!-- Each AppMenu is a menu root, and joins the bar it sits in; a link takes its turn between them. -->
  <MenubarRoot class="app-menubar" :disabled="disabled" :loop="loop" :open-on-hover="openOnHover">
    <template v-for="menu in items" :key="menu.label">
      <AppMenu
        v-if="isMenu(menu)"
        as="button"
        :trigger="menu.label"
        :items="menu.items"
        :disabled="menu.disabled"
        :link="link"
        :trigger-class="['app-menubar-trigger', triggerClass]"
        :popup-class="popupClass"
        :item-class="itemClass"
        @select="(item, event) => emit('select', item, event)"
      >
        <template v-if="$slots.trigger" #trigger><slot name="trigger" :menu="menu" /></template>
        <template v-if="$slots.item" #item="scope"><slot name="item" v-bind="scope" /></template>
      </AppMenu>

      <MenubarLink
        v-else
        v-bind="linkProps(link, menu.to, menu.disabled)"
        :disabled="menu.disabled"
        class="app-menubar-trigger"
        :class="[triggerClass, menu.class]"
      >
        <slot name="trigger" :menu="menu">{{ menu.label }}</slot>
      </MenubarLink>
    </template>
  </MenubarRoot>
</template>
