<script setup lang="ts">
import { AppTooltip, AppButton } from '@vunset/ui';
import { TooltipGroup } from '@vunset/vue';

const tools = [
  { label: 'Bold', key: 'B', mark: 'b' },
  { label: 'Italic', key: 'I', mark: 'i' },
  { label: 'Underline', key: 'U', mark: 'u' },
  { label: 'Strikethrough', key: 'S', mark: 's' }
];
</script>

<template>
  <TooltipGroup :delay="700" :timeout="500">
    <div class="flex items-center gap-1">
      <AppTooltip
        v-for="tool in tools"
        :key="tool.label"
        :content="`${tool.label} · ⌘${tool.key}`"
        side="bottom"
        :as="AppButton"
        square
        variant="ghost"
        :aria-label="tool.label"
      >
        <template #trigger>
          <component :is="tool.mark">{{ tool.key }}</component>
        </template>
      </AppTooltip>
    </div>
  </TooltipGroup>
</template>
