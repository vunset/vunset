<script setup lang="ts">
import { AppTooltip, AppButton, AppIcon } from '@vunset/ui';
</script>

<template>
  <div class="flex items-center gap-3">
    <AppTooltip content="Copy to clipboard" arrow :as="AppButton" square variant="outline" aria-label="Copy">
      <AppIcon name="copy" />
    </AppTooltip>

    <AppTooltip content="3 unread notifications" arrow :as="AppIcon" name="bell" aria-label="Notifications" />
  </div>
</template>
