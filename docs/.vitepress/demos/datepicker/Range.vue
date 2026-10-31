<script setup lang="ts">
import { ref } from 'vue';
import {
  DatepickerRoot,
  DatepickerTrigger,
  DatepickerValue,
  DatepickerClear,
  Portal,
  Positioner,
  Popup,
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
  CalendarPreset,
  Icon
} from '@vunset/vue';
import './datepicker.css';
import '../calendar/calendar.css';

const stay = ref<Date[]>([]);
</script>

<template>
  <DatepickerRoot
    v-model="stay"
    mode="range"
    :presets="['last-7', 'last-30', 'this-month', 'last-month']"
    class="demo-datepicker"
  >
    <DatepickerTrigger class="demo-datepicker-trigger">
      <Icon name="calendar" />
      <DatepickerValue placeholder="Pick dates" class="demo-datepicker-value" />
    </DatepickerTrigger>
    <DatepickerClear class="demo-datepicker-clear">×</DatepickerClear>

    <Portal>
      <Positioner>
        <Popup class="demo-datepicker-popup demo-calendar">
          <div class="demo-calendar-header">
            <CalendarPrev class="demo-calendar-button"><Icon name="chevron-left" /></CalendarPrev>
            <div>
              <CalendarViewTrigger value="month" class="demo-calendar-button demo-calendar-view-trigger" />
              <CalendarViewTrigger value="year" class="demo-calendar-button demo-calendar-view-trigger" />
            </div>
            <CalendarNext class="demo-calendar-button"><Icon name="chevron-right" /></CalendarNext>
          </div>

          <CalendarGrid>
            <CalendarRow view="day" class="demo-calendar-row">
              <CalendarWeekDay class="demo-calendar-week-day" />
            </CalendarRow>
            <CalendarWeek class="demo-calendar-row">
              <CalendarDay class="demo-calendar-day" />
            </CalendarWeek>
            <CalendarRow view="month" class="demo-calendar-cells">
              <CalendarMonth v-slot="{ label }" class="demo-calendar-button demo-calendar-cell">
                {{ label.slice(0, 3) }}
              </CalendarMonth>
            </CalendarRow>
            <CalendarRow view="year" class="demo-calendar-cells">
              <CalendarYear class="demo-calendar-button demo-calendar-cell" />
            </CalendarRow>
          </CalendarGrid>

          <CalendarPresets class="demo-calendar-presets">
            <CalendarPreset class="demo-calendar-button" />
          </CalendarPresets>
        </Popup>
      </Positioner>
    </Portal>
  </DatepickerRoot>

  <DemoOutput>v-model: {{ stay.map((day) => day.toDateString()).join(' → ') || '[]' }}</DemoOutput>
</template>
