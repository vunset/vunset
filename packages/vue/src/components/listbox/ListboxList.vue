<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext, type RenderedOption, type RenderedSection } from '../../shared/use-listbox';

defineOptions({ name: 'ListboxList', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * Renders the rows yourself, each an `Item` given its `option`, in place of the built-in ones:
   * with your own markup, or only the rows your virtualizer picks. Keys reach every option either
   * way; scroll to `activeIndex` when your virtualizer left it out. With the root's `virtual`,
   * `options` is only the rows on screen, and the list keeps the space around them.
   */
  default?(props: { sections: RenderedSection[]; options: RenderedOption[]; activeIndex: number }): unknown;
  /** A built-in row's content. */
  option?(props: RenderedOption): unknown;
  /** The built-in "Create" row's content, in a creatable combobox. */
  create?(props: RenderedOption): unknown;
  /** A built-in group label's content. */
  group?(props: { section: RenderedSection }): unknown;
}>();

const {
  listboxProps,
  sections,
  flatOptions,
  activeIndex,
  virtualRows,
  getOptionProps,
  getGroupProps,
  getGroupLabelProps
} = useListboxContext();
const merged = usePartProps(listboxProps);
</script>

<template>
  <!-- `create` rows come only from a combobox's `creatable`. -->
  <Part :as="props.as" v-bind="merged">
    <template v-if="virtualRows">
      <div aria-hidden="true" :style="{ height: `${virtualRows.before}px` }" />
      <slot
        v-if="$slots.default"
        :sections="sections"
        :options="virtualRows.options"
        :active-index="activeIndex"
      />
      <template v-else>
        <div v-for="option in virtualRows.options" :key="option.value" v-bind="getOptionProps(option)">
          <slot v-if="option.create" name="create" v-bind="option">Create &ldquo;{{ option.label }}&rdquo;</slot>
          <slot v-else name="option" v-bind="option">{{ option.label }}</slot>
        </div>
      </template>
      <div aria-hidden="true" :style="{ height: `${virtualRows.after}px` }" />
    </template>

    <slot
      v-else-if="$slots.default"
      :sections="sections"
      :options="flatOptions"
      :active-index="activeIndex"
    />

    <template v-else>
      <div v-for="(section, index) in sections" :key="index" v-bind="getGroupProps(section)">
        <div v-if="section.label" v-bind="getGroupLabelProps(section)">
          <slot name="group" :section="section">{{ section.label }}</slot>
        </div>

        <div v-for="option in section.options" :key="option.value" v-bind="getOptionProps(option)">
          <slot v-if="option.create" name="create" v-bind="option">Create &ldquo;{{ option.label }}&rdquo;</slot>
          <slot v-else name="option" v-bind="option">{{ option.label }}</slot>
        </div>
      </div>
    </template>
  </Part>
</template>
