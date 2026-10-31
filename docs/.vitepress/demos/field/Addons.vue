<script setup lang="ts">
import { ref } from 'vue';
import { FieldRoot, FieldLabel, FieldGroup, Addon, Input, Icon } from '@vunset/vue';
import './field.css';

const query = ref('vunset');
</script>

<template>
  <FieldRoot class="demo-field">
    <FieldLabel class="demo-field-label">Search</FieldLabel>

    <FieldGroup class="demo-field-group">
      <Addon side="start" aria-hidden="true">
        <Icon name="search" />
      </Addon>

      <Input v-model="query" placeholder="Anything" class="demo-field-input" />

      <Addon side="end">
        <button v-show="query" type="button" aria-label="Clear search" class="demo-field-clear" @click="query = ''">
          <Icon name="times" />
        </button>
      </Addon>
    </FieldGroup>
  </FieldRoot>
</template>
