<script setup lang="ts">
import { Badge, Button, Group } from '@vunset/vue';
import './button.css';
import '../group/group.css';
import '../badge/badge.css';
</script>

<template>
  <Group class="demo-group" label="Actions">
    <Button class="demo-button" data-variant="ghost">Reply</Button>
    <Button class="demo-button" data-variant="ghost">Forward</Button>
    <Button class="demo-button" data-variant="ghost">
      Archive
      <Badge class="demo-badge" data-variant="soft" data-size="sm">12</Badge>
    </Button>
  </Group>
</template>
