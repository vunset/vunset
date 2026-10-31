<script setup lang="ts">
import { ref } from 'vue';
import { Appear, Button, Input, FieldRoot, FieldLabel } from '@vunset/vue';
import './appear.css';
import '../button/button.css';
import '../field/field.css';

const open = ref(false);
</script>

<template>
  <div class="demo-appear-group">
    <Button class="demo-button" @click="open = !open">{{ open ? 'Hide' : 'Show' }}</Button>

    <Appear :open keep-mounted class="demo-appear">
      <FieldRoot class="demo-field">
        <FieldLabel class="demo-field-label">Note</FieldLabel>
        <Input placeholder="Type, hide, show again" class="demo-field-input" />
      </FieldRoot>
    </Appear>
  </div>
</template>
