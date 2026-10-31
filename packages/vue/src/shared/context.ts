import { inject, provide, type InjectionKey } from 'vue';

export function createContext<T>(name: string) {
  const key: InjectionKey<T> = Symbol(name);

  function provideContext(value: T): T {
    provide(key, value);
    return value;
  }

  function useContext(): T {
    const context = inject(key, null as T | null);
    if (context === null) {
      throw new Error(`${name} context is missing. It must be used within its Root component.`);
    }
    return context;
  }

  function useOptionalContext(): T | null {
    return inject(key, null as T | null);
  }

  return { key, provideContext, useContext, useOptionalContext };
}
