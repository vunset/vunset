<script setup lang="ts">
import { Button, Icon } from '@vunset/vue';
import '../button/button.css';
import './icon.css';
</script>

<template>
  <div class="demo-button-row">
    <!-- the label names the button, the icon only decorates -->
    <Button class="demo-button">
      <Icon name="check" class="demo-icon-sm" />
      Approve
    </Button>

    <!-- no label: the button takes the name, the icon stays hidden -->
    <Button aria-label="Delete" class="demo-button">
      <Icon name="trash" class="demo-icon-sm" />
    </Button>
  </div>
</template>
