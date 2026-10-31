<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { Part } from '@vunset/vue';

defineOptions({ name: 'AppCard' });

withDefaults(
  defineProps<{
    title?: string;
    /** The text under the title. */
    description?: string;
    /** Classes for the header, beside its own. */
    headerClass?: HTMLAttributes['class'];
    /** Classes for the body, beside its own. */
    bodyClass?: HTMLAttributes['class'];
    /** Classes for the footer, beside its own. */
    footerClass?: HTMLAttributes['class'];
    /** Element or component to render: `section`, `article`, a link. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /** The whole header, in place of the title, description and actions. */
  header?(): unknown;
  title?(): unknown;
  description?(): unknown;
  /** Beside the title, at the end: a button, a menu. */
  actions?(): unknown;
  /** The body. */
  default?(): unknown;
  /** Under the body, apart from it: the card's buttons. */
  footer?(): unknown;
}>();
</script>

<template>
  <Part :as="as" class="app-card">
    <div
      v-if="$slots.header || title || $slots.title || description || $slots.description || $slots.actions"
      class="app-card-header"
      :class="headerClass"
    >
      <slot name="header">
        <div class="app-card-heading">
          <p v-if="title || $slots.title" class="app-card-title"><slot name="title">{{ title }}</slot></p>
          <p v-if="description || $slots.description" class="app-card-description">
            <slot name="description">{{ description }}</slot>
          </p>
        </div>
        <div v-if="$slots.actions" class="app-card-actions"><slot name="actions" /></div>
      </slot>
    </div>

    <div v-if="$slots.default" class="app-card-body" :class="bodyClass"><slot /></div>

    <div v-if="$slots.footer" class="app-card-footer" :class="footerClass"><slot name="footer" /></div>
  </Part>
</template>
