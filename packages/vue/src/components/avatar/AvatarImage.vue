<script setup lang="ts">
import { Part } from '../../shared/part';
import { onBeforeUnmount, watch } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useAvatarContext, type AvatarSource } from './AvatarRoot.vue';

defineOptions({ name: 'AvatarImage', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The image. Empty, or failing to load, shows the fallback. */
    src?: string;
    srcset?: string;
    sizes?: string;
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    referrerpolicy?: ReferrerPolicy;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'img' }
);

const { showImage, imageProps, setSource } = useAvatarContext();

watch(
  (): AvatarSource => ({
    src: props.src,
    srcset: props.srcset,
    sizes: props.sizes,
    crossorigin: props.crossorigin,
    referrerpolicy: props.referrerpolicy
  }),
  setSource,
  { immediate: true }
);

onBeforeUnmount(() => setSource(null));

const merged = usePartProps(() => ({
  ...imageProps.value,
  src: props.src,
  srcset: props.srcset,
  sizes: props.sizes,
  crossorigin: props.crossorigin,
  referrerpolicy: props.referrerpolicy
}));
</script>

<template>
  <Part v-if="showImage" :as="props.as" v-bind="merged" />
</template>
