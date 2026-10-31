<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext } from '../../shared/use-listbox';

defineOptions({ name: 'ListboxPresets', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const {
  presetSections,
  presetsProps,
  getPresetItemProps,
  getPresetProps,
  getPresetReplaceProps,
  getPresetGroupProps,
  getPresetGroupLabelProps,
  getPresetGroupTriggerProps,
  getPresetGroupPanelProps,
  state
} = useListboxContext();
const merged = usePartProps(presetsProps);
</script>

<template>
  <Part :as="props.as" v-if="presetSections.length" v-bind="merged">
    <!-- Keyed by label, so a search that drops a section doesn't hand its element, and its fold, to the next. -->
    <div
      v-for="(section, index) in presetSections"
      :key="section.label ?? `loose-${index}`"
      v-bind="getPresetGroupProps(section)"
    >
      <button v-if="section.label" v-bind="getPresetGroupTriggerProps(section)">
        <span v-bind="getPresetGroupLabelProps(section)">
          <slot name="group" :section="section" :open="section.open">{{ section.label }}</slot>
        </span>
        <slot name="group-indicator" :section="section" :open="section.open" />
      </button>

      <div v-bind="getPresetGroupPanelProps(section)">
        <div v-for="preset in section.presets" :key="preset.label" v-bind="getPresetItemProps(preset)">
          <button v-bind="getPresetProps(preset)">
            <slot name="preset" v-bind="preset">{{ preset.label }}</slot>
          </button>
          <button v-if="$slots.replace" v-bind="getPresetReplaceProps(preset)">
            <slot name="replace" v-bind="preset" />
          </button>
        </div>
      </div>
    </div>

    <slot v-bind="state" />
  </Part>
</template>
