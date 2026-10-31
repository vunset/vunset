<script setup lang="ts">
import {
  CalendarRoot,
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
  Icon
} from '@vunset/vue';
import './calendar.css';
</script>

<template>
  <CalendarRoot locale="de-DE" :first-day-of-week="1" fixed-weeks class="demo-calendar">
    <div class="demo-calendar-header">
      <CalendarPrev class="demo-calendar-button">
        <Icon name="chevron-left" />
      </CalendarPrev>

      <div>
        <CalendarViewTrigger value="month" class="demo-calendar-button demo-calendar-view-trigger" />
        <CalendarViewTrigger value="year" class="demo-calendar-button demo-calendar-view-trigger" />
      </div>

      <CalendarNext class="demo-calendar-button">
        <Icon name="chevron-right" />
      </CalendarNext>
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
  </CalendarRoot>
</template>
