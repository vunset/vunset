<script lang="ts">
import type { AccordionValue } from '@vunset/vue';

export interface AppAccordionSection {
  value: AccordionValue;
  /** The trigger's text. */
  title?: string;
  disabled?: boolean;
  [key: string]: unknown;
}
</script>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel, isPropBound } from '@vunset/vue';
import AppIcon from './AppIcon.vue';

defineOptions({ name: 'AppAccordion' });

// Forwarded only when bound, so one without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

withDefaults(
  defineProps<{
    /** The open sections' values, bound with `v-model`: always an array. */
    modelValue?: AccordionValue[];
    defaultValue?: AccordionValue[];
    /** The sections: `{ value, title, disabled }`. Each content is the slot named after a value: `#shipping`. */
    sections: AppAccordionSection[];
    /** Lets more than one be open; otherwise opening one closes the rest. */
    multiple?: boolean;
    disabled?: boolean;
    /** Keeps closed sections' content in the page, hidden. */
    keepMounted?: boolean;
    /** Which arrow keys move between the triggers. */
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
    /** Classes for each section. */
    sectionClass?: HTMLAttributes['class'];
    /** Classes for each trigger row. */
    triggerClass?: HTMLAttributes['class'];
    /** Classes for each panel's content. */
    panelClass?: HTMLAttributes['class'];
  }>(),
  { modelValue: undefined, defaultValue: undefined, loop: undefined }
);

const emit = defineEmits<{
  'update:modelValue': [value: AccordionValue[]];
}>();

type SectionSlot = (props: { section: AppAccordionSection; open: boolean }) => unknown;

defineSlots<{
  /** A trigger's content, in place of its `title`. */
  title?: SectionSlot;
  /** A trigger's icon, in place of the chevron. */
  icon?: SectionSlot;
  /** Any section's content without a slot of its own. */
  panel?: SectionSlot;
  /** Contents by value: `#shipping`, `#returns`. */
  [value: string]: SectionSlot | undefined;
}>();
</script>

<template>
  <AccordionRoot
    v-bind="modelBound ? { modelValue } : {}"
    :default-value="defaultValue"
    :multiple="multiple"
    :disabled="disabled"
    :orientation="orientation"
    :loop="loop"
    class="app-accordion"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AccordionItem
      v-for="section in sections"
      :key="section.value"
      v-slot="{ open }"
      :value="section.value"
      :disabled="section.disabled"
      class="app-accordion-section"
      :class="sectionClass"
    >
      <AccordionHeader class="app-accordion-header">
        <AccordionTrigger class="app-collapsible-trigger" :class="triggerClass">
          <span class="app-collapsible-title">
            <slot name="title" :section="section" :open="open">{{ section.title }}</slot>
          </span>

          <slot name="icon" :section="section" :open="open">
            <AppIcon name="chevron-down" class="app-collapsible-chevron" />
          </slot>
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionPanel :keep-mounted="keepMounted" class="app-collapsible-panel">
        <div class="app-collapsible-content" :class="panelClass">
          <slot :name="String(section.value)" :section="section" :open="open">
            <slot name="panel" :section="section" :open="open" />
          </slot>
        </div>
      </AccordionPanel>
    </AccordionItem>
  </AccordionRoot>
</template>
