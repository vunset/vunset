<script setup lang="ts">
import { ref } from 'vue';
import { Separator } from '@vunset/vue';
import { AppButton, AppGroup, AppIcon, AppTooltip, FormSelect, FormToggleGroup } from '@vunset/ui';

const align = ref('left');
const font = ref('Helvetica');
const last = ref('');
</script>

<template>
  <AppGroup variant="toolbar" label="Formatting">
    <FormToggleGroup
      v-model="align"
      keep-one
      aria-label="Alignment"
      :options="[
        { value: 'left', label: 'Align left' },
        { value: 'center', label: 'Align center' },
        { value: 'right', label: 'Align right' }
      ]"
    >
      <template #option="{ value, label }">
        <AppIcon :name="`align-${value}`" inline :aria-label="label" />
      </template>
    </FormToggleGroup>

    <Separator />

    <AppTooltip
      content="Currency"
      :as="AppButton"
      variant="ghost"
      square
      aria-label="Currency"
      @click="last = 'Currency'"
    >
      <AppIcon name="dollar" inline />
    </AppTooltip>

    <AppTooltip content="Percent" :as="AppButton" variant="ghost" square aria-label="Percent" @click="last = 'Percent'">
      <AppIcon name="percent" inline />
    </AppTooltip>

    <Separator />

    <FormSelect
      v-model="font"
      :options="['Helvetica', 'Inter', 'Georgia']"
      align-with-trigger
      :clearable="false"
      aria-label="Font"
      class="w-36"
    />

    <Separator />

    <AppButton variant="solid" @click="last = 'Save'">Save</AppButton>
  </AppGroup>

  <DemoOutput>align: {{ align }} · font: {{ font }} · last: {{ last }}</DemoOutput>
</template>
