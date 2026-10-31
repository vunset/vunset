import { createContext } from '@vunset/vue';

/** Present inside a `FormRadioGroup`; a `FormRadio` checks for it. */
export const { provideContext: provideFormRadioGroup, useOptionalContext: useFormRadioGroup } =
  createContext<true>('FormRadioGroup');
