import { createContext } from '@vunset/vue';

export const { provideContext: provideFormRadioGroup, useOptionalContext: useFormRadioGroup } =
  createContext<true>('FormRadioGroup');
