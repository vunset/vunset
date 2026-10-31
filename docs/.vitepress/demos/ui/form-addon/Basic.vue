<script setup lang="ts">
import { ref } from 'vue';
import { Addon, FieldRoot, FieldGroup, FieldLabel, Input } from '@vunset/vue';
import { AppIcon, FormInput } from '@vunset/ui';

const weight = ref('72');
const site = ref('');
</script>

<template>
  <div class="grid w-80 gap-4">
    <!-- A Form* component: its #start and #end slots are already addons. -->
    <FormInput v-model="site" label="Website" placeholder="example.com">
      <template #start>https://</template>
      <template #end><AppIcon name="alert-info" /></template>
    </FormInput>

    <!-- The raw parts, for a control of your own, in the same classes. -->
    <FieldRoot class="form-field">
      <FieldLabel class="form-label">Weight</FieldLabel>
      <FieldGroup class="form-control form-input">
        <Input v-model="weight" inputmode="decimal" class="form-input-control" />
        <Addon side="end" class="form-addon">kg</Addon>
      </FieldGroup>
    </FieldRoot>
  </div>

  <DemoOutput>site: {{ site }} · weight: {{ weight }}</DemoOutput>
</template>
