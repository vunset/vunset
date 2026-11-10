<script lang="ts">
export type AppAvatarSize = 'sm' | 'md' | 'lg';
</script>

<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';
import { AvatarRoot, AvatarImage, AvatarFallback, getInitials, type AvatarState, type AvatarStatus } from '@vunset/vue';

defineOptions({ name: 'AppAvatar' });

const props = withDefaults(
  defineProps<{
    /** The image. Empty, or failing to load, shows the fallback. */
    src?: string;
    srcset?: string;
    sizes?: string;
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    referrerpolicy?: ReferrerPolicy;
    /** Whose avatar it is: shown on hover, and what the avatar is read out as. */
    title?: string;
    /** What it is read out as, when that isn't `title`. */
    alt?: string;
    /** Falls back to the initials of `title`, ahead of `fallback`. */
    initials?: boolean;
    /** The text shown with no image and no initials. */
    fallback?: string;
    /** How long, in milliseconds, the fallback waits before showing, so a quick image never flashes it. */
    delay?: number;
    /** `sm`, `md` or `lg`. */
    size?: AppAvatarSize;
    imageClass?: HTMLAttributes['class'];
    fallbackClass?: HTMLAttributes['class'];
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { initials: false, fallback: 'N/A', delay: 0, size: 'md', as: 'span' }
);

const emit = defineEmits<{
  /** The image started loading, loaded or failed. */
  statusChange: [status: AvatarStatus];
}>();

defineSlots<{
  /** Replaces the fallback text: an icon, say. */
  fallback?(props: AvatarState): unknown;
}>();

const label = computed(() => props.alt || props.title || undefined);
const text = computed(() => (props.initials && getInitials(props.title)) || props.fallback);
</script>

<template>
  <AvatarRoot
    class="app-avatar"
    :data-size="size"
    :as="as"
    :delay="delay"
    :title="title"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    @status-change="emit('statusChange', $event)"
  >
    <AvatarImage
      v-if="src || srcset"
      :class="['app-avatar-image', imageClass]"
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :crossorigin="crossorigin"
      :referrerpolicy="referrerpolicy"
      alt=""
    />
    <AvatarFallback v-slot="state" :class="['app-avatar-fallback', fallbackClass]" :aria-hidden="label ? 'true' : undefined">
      <slot name="fallback" v-bind="state">{{ text }}</slot>
    </AvatarFallback>
  </AvatarRoot>
</template>
