<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import {
  ProgressRoot,
  ProgressLabel,
  ProgressValue,
  ProgressTrack,
  ProgressIndicator
} from '@vunset/vue';
import type { AppTone } from './AppButton.vue';

defineOptions({ name: 'AppProgress' });

withDefaults(
  defineProps<{
    /** How far along, or `null` while there is no telling: the bar then sweeps. */
    value: number | null;
    min?: number;
    max?: number;
    /** Names it, above the bar. Or use the `#label` slot. */
    label?: string;
    /** Shows the value, formatted, beside the label. */
    showValue?: boolean;
    /** How the value is shown and read out: `{ style: 'percent' }`, `{ style: 'unit', unit: 'megabyte' }`. */
    format?: Intl.NumberFormatOptions;
    locale?: Intl.LocalesArgument;
    /** What a screen reader hears for the value: "3 of 7 steps" rather than "3". */
    getValueText?: (formattedValue: string, value: number | null) => string;
    /** The bar's color. */
    tone?: AppTone;
    /** Classes for the track the bar runs in. */
    trackClass?: HTMLAttributes['class'];
  }>(),
  { showValue: true, tone: 'accent' }
);

defineSlots<{
  /** The label, in place of `label`. */
  label?(): unknown;
}>();
</script>

<template>
  <ProgressRoot
    :value="value"
    :min="min"
    :max="max"
    :format="format"
    :locale="locale"
    :get-value-text="getValueText"
    class="app-gauge app-progress"
    :data-tone="tone"
  >
    <div v-if="label || $slots.label || showValue" class="app-gauge-header">
      <ProgressLabel v-if="label || $slots.label" class="app-gauge-label">
        <slot name="label">{{ label }}</slot>
      </ProgressLabel>

      <ProgressValue v-if="showValue" class="app-gauge-value" />
    </div>

    <ProgressTrack class="app-gauge-track" :class="trackClass">
      <ProgressIndicator class="app-gauge-indicator" />
    </ProgressTrack>
  </ProgressRoot>
</template>
