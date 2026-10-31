import { hasInjectionContext, readonly, ref, type Ref } from 'vue';
import { createContext } from '../shared/context';

/** One message per field name. */
export type ValidationErrors = Record<string, string | undefined>;

/** A bag keyed by name (the first of several messages is kept), or a list of issues. */
export type ValidationInput =
  | Record<string, string | string[] | null | undefined>
  | { path: string | (string | number)[]; message: string }[];

export interface ValidationStore {
  errors: Readonly<Ref<ValidationErrors>>;
  /** Replaces every error. */
  setErrors: (input: ValidationInput) => void;
  /** Clears one field's error, or all of them. */
  clearErrors: (name?: string) => void;
}

export function createValidationStore(): ValidationStore {
  const errors = ref<ValidationErrors>({});

  function setErrors(input: ValidationInput) {
    const entries = Array.isArray(input)
      ? input.map(({ path, message }) => [Array.isArray(path) ? path.join('.') : path, message] as const)
      : Object.entries(input).map(([name, value]) => [name, (Array.isArray(value) ? value[0] : value) ?? undefined] as const);

    errors.value = Object.fromEntries(entries.filter(([, message]) => message));
  }

  function clearErrors(name?: string) {
    if (name === undefined) {
      errors.value = {};
    } else if (errors.value[name] !== undefined) {
      const { [name]: _, ...rest } = errors.value;
      errors.value = rest;
    }
  }

  return { errors: readonly(errors) as Readonly<Ref<ValidationErrors>>, setErrors, clearErrors };
}

/** Used when no store is provided. Provide one per form, or per request under SSR, to keep them apart. */
export const defaultValidationStore = createValidationStore();

export const { provideContext: provideValidation, useOptionalContext: useOptionalValidation } =
  createContext<ValidationStore>('Validation');

/** The nearest provided store, or the default one. Callable outside `setup` too, e.g. in a `.catch()`. */
export function useValidate(): ValidationStore {
  return (hasInjectionContext() ? useOptionalValidation() : null) ?? defaultValidationStore;
}
