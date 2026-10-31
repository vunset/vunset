import type { InjectionKey, Ref } from 'vue';

/** Where a demo's `<DemoOutput>` goes: the strip between the example and its code. */
export interface PreviewOutput {
  target: Ref<HTMLElement | null>;
  /** Shows the strip while at least one output is mounted; returns the release. */
  register: () => () => void;
}

export const PREVIEW_OUTPUT: InjectionKey<PreviewOutput> = Symbol('PreviewOutput');
