<script setup lang="ts">
import { reactive } from 'vue';
import {
  AppButton,
  FormCheckbox,
  FormCheckboxGroup,
  FormCombobox,
  FormDatepicker,
  FormInput,
  FormRadioGroup,
  FormRange,
  FormSelect,
  FormSwitch,
  FormTextarea,
  FormToggleGroup,
  type FormSize
} from '@vunset/ui';
import type { CalendarValue, ToggleGroupValue } from '@vunset/vue';

const SIZES: FormSize[] = ['sm', 'md', 'lg'];
const FRAMEWORKS = ['Vue', 'Svelte', 'Solid', 'Angular', 'React'];

// One set of values per size, filled so every clear button and chip shows.
const values = reactive(
  Object.fromEntries(
    SIZES.map((size) => [
      size,
      {
        text: 'Hello',
        select: 'Vue' as string | null,
        combobox: 'Vue' as string | null,
        chips: ['Vue', 'Solid'],
        date: new Date() as CalendarValue,
        notes: '',
        view: 'grid' as ToggleGroupValue,
        agree: true,
        notify: true,
        plan: 'M',
        topics: ['Vue'],
        volume: 40
      }
    ])
  )
);
</script>

<template>
  <div class="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6">
    <div v-for="size in SIZES" :key="size" class="grid content-start gap-4">
      <code class="text-xs opacity-60">size="{{ size }}"</code>

      <div class="flex items-end gap-2">
        <FormInput v-model="values[size].text" :size label="Input" clearable class="flex-1" />
        <AppButton variant="solid" tone="accent" :size>Button</AppButton>
      </div>
      <FormSelect v-model="values[size].select" :size label="Select" clearable :options="FRAMEWORKS" />
      <FormCombobox v-model="values[size].combobox" :size label="Combobox" :options="FRAMEWORKS" />
      <FormCombobox v-model="values[size].chips" :size label="Combobox, multiple" multiple :options="FRAMEWORKS" />
      <FormDatepicker v-model="values[size].date" :size label="Datepicker" clearable />
      <FormTextarea v-model="values[size].notes" :size label="Textarea" placeholder="Notes" />
      <FormToggleGroup
        v-model="values[size].view"
        :size
        label="Toggle group"
        :options="[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' }
        ]"
      />
      <FormCheckbox v-model="values[size].agree" :size label="Checkbox" />
      <FormSwitch v-model="values[size].notify" :size label="Switch" />
      <FormRadioGroup
        v-model="values[size].plan"
        :size
        label="Radio group"
        orientation="horizontal"
        :options="['S', 'M', 'L']"
      />
      <FormCheckboxGroup
        v-model="values[size].topics"
        :size
        label="Checkbox group"
        orientation="horizontal"
        :options="['Vue', 'CSS']"
      />
      <FormRange v-model="values[size].volume" :size label="Range" />
    </div>
  </div>
</template>
