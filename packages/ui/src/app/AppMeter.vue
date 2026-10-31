<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { MeterRoot, MeterLabel, MeterValue, MeterTrack, MeterIndicator } from '@vunset/vue';
import type { AppTone } from './AppButton.vue';

defineOptions({ name: 'AppMeter' });

withDefaults(
  defineProps<{
    /** The reading. */
    value: number;
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
  <MeterRoot
    :value="value"
    :min="min"
    :max="max"
    :format="format"
    :locale="locale"
    :get-value-text="getValueText"
    class="app-gauge app-meter"
    :data-tone="tone"
  >
    <div v-if="label || $slots.label || showValue" class="app-gauge-header">
      <MeterLabel v-if="label || $slots.label" class="app-gauge-label">
        <slot name="label">{{ label }}</slot>
      </MeterLabel>

      <MeterValue v-if="showValue" class="app-gauge-value" />
    </div>

    <MeterTrack class="app-gauge-track" :class="trackClass">
      <MeterIndicator class="app-gauge-indicator" />
    </MeterTrack>
  </MeterRoot>
</template>
