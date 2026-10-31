<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import {
  MenuRoot,
  MenuTrigger,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItemIndicator,
  Separator,
  Portal,
  Positioner,
  Popup
} from '@vunset/vue';
import type { Component } from 'vue';
import { linkProps, type AppMenuAction, type AppMenuEntry } from './app-menu';
import AppIcon from './AppIcon.vue';

// The styled items of a menu, and of each submenu in it: AppMenu's list, for any menu popup.
defineOptions({ name: 'AppMenuItems' });

defineProps<{
  /** Items, `separator`s, `group`s, `checkbox`es and `radio` sets; an item with `items` opens a submenu. */
  items: AppMenuEntry[];
  /** Classes for every item. */
  itemClass?: HTMLAttributes['class'];
  /** Classes for each submenu. */
  popupClass?: HTMLAttributes['class'];
  /** What an item with `to` renders as: `RouterLink`, `NuxtLink`, or `a` by default. */
  link?: string | Component;
}>();

const emit = defineEmits<{
  /** A plain item was chosen, after its own `onSelect`. */
  select: [item: AppMenuAction, event: Event];
}>();

defineSlots<{
  /** An item's label, in place of `label`. */
  item?(props: { item: AppMenuAction }): unknown;
}>();

function choose(item: AppMenuAction, event: Event) {
  item.onSelect?.(event);
  emit('select', item, event);
}
</script>

<template>
  <template v-for="(entry, index) in items" :key="index">
    <Separator v-if="entry.type === 'separator'" class="app-separator app-menu-separator" />

    <MenuGroup v-else-if="entry.type === 'group'" class="app-menu-group">
      <MenuGroupLabel class="app-menu-group-label">{{ entry.label }}</MenuGroupLabel>

      <AppMenuItems
        :items="entry.items"
        :item-class="itemClass"
        :popup-class="popupClass"
        :link="link"
        @select="(item, event) => emit('select', item, event)"
      >
        <template v-if="$slots.item" #item="scope"><slot name="item" v-bind="scope" /></template>
      </AppMenuItems>
    </MenuGroup>

    <MenuCheckboxItem
      v-else-if="entry.type === 'checkbox'"
      v-bind="'checked' in entry ? { modelValue: entry.checked } : {}"
      :disabled="entry.disabled"
      :close-on-click="entry.closeOnClick"
      class="app-menu-item"
      :class="itemClass"
      @update:model-value="entry.onChange?.($event)"
    >
      <MenuItemIndicator keep-mounted class="app-menu-indicator">
        <AppIcon name="check" />
      </MenuItemIndicator>

      <span class="app-menu-text">{{ entry.label }}</span>
    </MenuCheckboxItem>

    <MenuRadioGroup
      v-else-if="entry.type === 'radio'"
      v-bind="'value' in entry ? { modelValue: entry.value } : {}"
      :disabled="entry.disabled"
      class="app-menu-group"
      @update:model-value="entry.onChange?.($event)"
    >
      <MenuGroupLabel v-if="entry.label" class="app-menu-group-label">{{ entry.label }}</MenuGroupLabel>

      <MenuRadioItem
        v-for="option in entry.options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
        :close-on-click="entry.closeOnClick"
        class="app-menu-item"
        :class="itemClass"
      >
        <MenuItemIndicator keep-mounted class="app-menu-indicator" data-radio>
          <AppIcon name="dot" />
        </MenuItemIndicator>

        <span class="app-menu-text">{{ option.label }}</span>
      </MenuRadioItem>
    </MenuRadioGroup>

    <MenuRoot v-else-if="entry.items">
      <MenuTrigger
        :disabled="entry.disabled"
        class="app-menu-item"
        :class="[itemClass, entry.class]"
        :data-tone="entry.tone"
      >
        <AppIcon v-if="typeof entry.icon === 'string'" :name="entry.icon" class="app-menu-icon" />
        <component :is="entry.icon" v-else-if="entry.icon" class="app-menu-icon" aria-hidden="true" />

        <span class="app-menu-text">
          <slot name="item" :item="entry">{{ entry.label }}</slot>
        </span>

        <AppIcon name="chevron-right" class="app-menu-chevron" />
      </MenuTrigger>

      <Portal>
        <Positioner>
          <Popup class="app-surface app-menu" :class="popupClass">
            <AppMenuItems
              :items="entry.items"
              :item-class="itemClass"
              :popup-class="popupClass"
              :link="link"
              @select="(item, event) => emit('select', item, event)"
            >
              <template v-if="$slots.item" #item="scope"><slot name="item" v-bind="scope" /></template>
            </AppMenuItems>
          </Popup>
        </Positioner>
      </Portal>
    </MenuRoot>

    <MenuItem
      v-else
      v-bind="entry.to === undefined ? {} : linkProps(link, entry.to, entry.disabled)"
      :disabled="entry.disabled"
      :close-on-click="entry.closeOnClick"
      class="app-menu-item"
      :class="[itemClass, entry.class]"
      :data-tone="entry.tone"
      @select="choose(entry, $event)"
    >
      <AppIcon v-if="typeof entry.icon === 'string'" :name="entry.icon" class="app-menu-icon" />
      <component :is="entry.icon" v-else-if="entry.icon" class="app-menu-icon" aria-hidden="true" />

      <span class="app-menu-text">
        <slot name="item" :item="entry">{{ entry.label }}</slot>
      </span>

      <kbd v-if="entry.shortcut">{{ entry.shortcut }}</kbd>
    </MenuItem>
  </template>
</template>
