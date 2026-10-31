import { computed, ref, useAttrs, useId, watch, type ComputedRef, type Ref } from 'vue';

export type RegisterId = (id: string) => () => void;

export interface Labeling {
  titleId: Ref<string | undefined>;
  descriptionId: Ref<string | undefined>;
  registerTitle: RegisterId;
  registerDescription: RegisterId;
}

/** The ids a root's title and description register, for its `aria-labelledby`/`-describedby`. */
export function useLabeling(): Labeling {
  const titleId = ref<string>();
  const descriptionId = ref<string>();

  const slot =
    (target: Ref<string | undefined>): RegisterId =>
    (id) => {
      target.value = id;
      return () => {
        if (target.value === id) target.value = undefined;
      };
    };

  return { titleId, descriptionId, registerTitle: slot(titleId), registerDescription: slot(descriptionId) };
}

/** The part's id, registered with its root while mounted. */
export function useRegisteredId(register: RegisterId): ComputedRef<string> {
  const attrs = useAttrs();
  const generated = useId();
  const id = computed(() => (attrs.id as string | undefined) ?? generated);

  watch(id, (next, _, onCleanup) => onCleanup(register(next)), { immediate: true });

  return id;
}
