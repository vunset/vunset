<script setup lang="ts">
import { computed, shallowRef, useAttrs, watch } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import type { InlineSvg } from '@vunset/utils';
import { defaultIcon, iconSprite, loadedInlineIcon, loadInlineIcon } from '../../shared/icons';

defineOptions({ name: 'Icon', inheritAttrs: false });

const props = defineProps<{
  /** The symbol id in the sprite, or the filename in the icon folder. */
  name: string;
  /** Put the file's markup in the document instead of referencing the sprite. */
  inline?: boolean;
  /** Overrides the configured sprite, for this one icon. */
  sprite?: string;
}>();

const attrs = useAttrs();

const icon = shallowRef<InlineSvg>();

const hooks = computed(() => {
  const named = attrs['aria-label'] != null || attrs['aria-labelledby'] != null;

  return {
    'data-part': 'icon',
    'data-name': props.name,
    'aria-hidden': named ? undefined : true,
    role: named ? 'img' : undefined
  };
});

const spriteProps = computed(() => mergeProps(hooks.value, attrs));

const inlineProps = computed(() => mergeProps(icon.value?.attrs ?? {}, hooks.value, attrs));

watch(
  () => [props.inline, props.name] as const,
  async ([isInline, name], _, onCleanup) => {
    let stale = false;
    onCleanup(() => (stale = true));

    icon.value = undefined;

    if (!isInline) return;

    // Already read for another icon: drawn now, not after a second render.
    const ready = loadedInlineIcon(name);
    if (ready) {
      icon.value = ready;
      return;
    }

    const load = loadInlineIcon(name);

    // Not in the app's folder: a default is drawn at once, in this same render.
    if (!load) {
      const fallback = defaultIcon(name);
      if (fallback) icon.value = fallback;
      else if (fallback === null) console.warn(`[Icon] '${name}' has no <svg> element to render.`);
      else console.warn(`[Icon] '${name}' not found.`);
      return;
    }

    try {
      const parsed = await load;

      if (stale) return;
      if (!parsed) return console.warn(`[Icon] '${name}' has no <svg> element to render.`);

      icon.value = parsed;
    } catch (error) {
      console.warn(`[Icon] Could not read '${name}'.`, error);
    }
  },
  { immediate: true }
);
</script>

<template>
  <svg v-if="props.inline" v-bind="inlineProps" v-html="icon?.content" />

  <svg v-else v-bind="spriteProps" fill="none">
    <use :href="`${sprite ?? iconSprite()}#${name}`" />
  </svg>
</template>
