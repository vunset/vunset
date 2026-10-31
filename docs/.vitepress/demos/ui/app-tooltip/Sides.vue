<script setup lang="ts">
import { AppTooltip, AppButton } from '@vunset/ui';
</script>

<template>
  <div class="flex gap-2">
    <AppTooltip
      v-for="side in ['top', 'right', 'bottom', 'left']"
      :key="side"
      :side="side"
      :content="`On the ${side}`"
      :trigger="side"
      arrow
      :as="AppButton"
      variant="outline"
      size="sm"
    />
  </div>
</template>
