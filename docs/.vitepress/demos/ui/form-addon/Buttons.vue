<script setup lang="ts">
import { ref } from 'vue';
import { AppButton, AppCopy, FormInput, FormTextarea } from '@vunset/ui';

const invite = ref('https://vunset.dev/join/4f2a');
const file = ref('');
const message = ref('');

function pick(event: Event) {
  file.value = (event.target as HTMLInputElement).files?.[0]?.name ?? '';
}
</script>

<template>
  <div class="grid w-80 gap-4">
    <!-- At the box's end, the button joins it: any AppButton, AppCopy included. -->
    <FormInput v-model="invite" label="Invite link" read-only>
      <template #end><AppCopy :value="invite" variant="outline" label="Copy" /></template>
    </FormInput>

    <!-- At its start too, whatever element the button renders. -->
    <FormInput v-model="file" label="Attachment" read-only placeholder="No file chosen">
      <template #start>
        <AppButton as="label" variant="outline">
          Browse
          <input type="file" hidden @change="pick" />
        </AppButton>
      </template>
    </FormInput>

    <!-- Anywhere else, or in a textarea, it sits inset. -->
    <FormTextarea v-model="message" label="Message" autosize placeholder="Say hi">
      <template #end><AppCopy :value="message" :disabled="!message" /></template>
    </FormTextarea>
  </div>

  <DemoOutput>file: {{ file || '—' }}</DemoOutput>
</template>
