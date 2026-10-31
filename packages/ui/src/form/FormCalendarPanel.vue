<script lang="ts">
import type { CalendarPresetsInput, CalendarSelectionMode, DatePresetKey } from '@vunset/vue';

const QUARTERS = ['q1', 'q2', 'q3', 'q4'];

/** What FormCalendar's and FormDatepicker's `presets`, `with-year` and `with-quarters` add up to. */
export function calendarPresets(
  presets: CalendarPresetsInput | boolean | undefined,
  mode: CalendarSelectionMode,
  withYear: boolean,
  withQuarters: boolean
): Exclude<CalendarPresetsInput, string> {
  if (presets === false) return [];

  const extra = [...(withYear ? ['this-year'] : []), ...(withQuarters ? QUARTERS : [])] as DatePresetKey[];
  // Unset, a range offers the base six, and so does a calendar asked for the year or quarters.
  const shown = presets === true || (presets === undefined && (mode === 'range' || extra.length > 0));
  const given: CalendarPresetsInput = presets === undefined || presets === true ? (shown ? ['base'] : []) : presets;

  return [...(typeof given === 'string' ? [given] : given), ...extra];
}

const isQuarter = (key: string) => QUARTERS.includes(key);
</script>

<script setup lang="ts">
// The calendar FormCalendar and FormDatepicker both draw. Not exported: it reads
// the calendar of whichever root it sits in.
import {
  CalendarPrev,
  CalendarNext,
  CalendarViewTrigger,
  CalendarGrid,
  CalendarRow,
  CalendarWeek,
  CalendarWeekDay,
  CalendarDay,
  CalendarMonth,
  CalendarYear,
  CalendarPresets,
  CalendarPreset
} from '@vunset/vue';
import AppIcon from '../app/AppIcon.vue';
import AppButton from '../app/AppButton.vue';
import AppGroup from '../app/AppGroup.vue';

defineOptions({ name: 'FormCalendarPanel' });

defineProps<{ presets?: boolean }>();
</script>

<template>
  <div class="form-calendar-header">
    <CalendarPrev :as="AppButton" size="sm" square aria-label="Previous">
      <AppIcon name="chevron-left" class="form-icon" />
    </CalendarPrev>

    <div class="form-calendar-title">
      <CalendarViewTrigger :as="AppButton" size="sm" value="month" />
      <CalendarViewTrigger :as="AppButton" size="sm" value="year" />
    </div>

    <CalendarNext :as="AppButton" size="sm" square aria-label="Next">
      <AppIcon name="chevron-right" class="form-icon" />
    </CalendarNext>
  </div>

  <CalendarGrid class="form-calendar-grid">
    <CalendarRow view="day" class="form-calendar-week">
      <CalendarWeekDay class="form-calendar-weekday" />
    </CalendarRow>

    <CalendarWeek class="form-calendar-week">
      <CalendarDay class="form-calendar-day" />
    </CalendarWeek>

    <CalendarRow view="month" class="form-calendar-cells">
      <CalendarMonth v-slot="{ label }" class="form-calendar-cell">{{ label.slice(0, 3) }}</CalendarMonth>
    </CalendarRow>

    <CalendarRow view="year" class="form-calendar-cells">
      <CalendarYear class="form-calendar-cell" />
    </CalendarRow>
  </CalendarGrid>

  <CalendarPresets v-if="presets" v-slot="{ presets: items }" class="form-calendar-presets">
    <template v-for="item in items" :key="item.key">
      <CalendarPreset
        v-if="!isQuarter(item.key)"
        :value="item.key"
        :as="AppButton"
        size="sm"
        variant="outline"
        class="form-calendar-preset"
      />
    </template>

    <AppGroup v-if="items.some((item) => isQuarter(item.key))" label="Quarters" class="form-calendar-quarters">
      <template v-for="item in items" :key="item.key">
        <CalendarPreset
          v-if="isQuarter(item.key)"
          :value="item.key"
          :as="AppButton"
          size="sm"
          variant="outline"
          class="form-calendar-preset"
        />
      </template>
    </AppGroup>
  </CalendarPresets>
</template>
