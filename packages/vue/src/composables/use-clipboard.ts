import {
  computed,
  onScopeDispose,
  readonly,
  ref,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref
} from 'vue';

export type ClipboardStatus = 'idle' | 'copied' | 'error';

export type ClipboardId = string | number;

export interface UseClipboardOptions {
  /** How long `copied` (or `error`) stays up before settling back. @default 1500 */
  timeout?: MaybeRefOrGetter<number | undefined>;
}

export interface UseClipboardReturn {
  copy: (text: string, id?: ClipboardId) => Promise<boolean>;
  status: Readonly<Ref<ClipboardStatus>>;
  copied: ComputedRef<boolean>;
  /** The id passed with the last successful copy, so one instance can serve a list. */
  copiedId: Readonly<Ref<ClipboardId | null>>;
  error: Readonly<Ref<unknown>>;
  reset: () => void;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const status = ref<ClipboardStatus>('idle');
  const copiedId = ref<ClipboardId | null>(null);
  const error = ref<unknown>(null);

  let timer: ReturnType<typeof setTimeout> | undefined;

  function reset(): void {
    clearTimeout(timer);
    status.value = 'idle';
    copiedId.value = null;
    error.value = null;
  }

  function settle(next: ClipboardStatus): void {
    clearTimeout(timer);
    status.value = next;
    timer = setTimeout(reset, toValue(options.timeout) ?? 1500);
  }

  async function copy(text: string, id?: ClipboardId): Promise<boolean> {
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      copiedId.value = id ?? null;
      error.value = null;
      settle('copied');
      return true;
    } catch (reason) {
      copiedId.value = null;
      error.value = reason;
      settle('error');
      return false;
    }
  }

  onScopeDispose(() => clearTimeout(timer));

  return {
    copy,
    status: readonly(status),
    copied: computed(() => status.value === 'copied'),
    copiedId: readonly(copiedId),
    error: readonly(error),
    reset
  };
}
