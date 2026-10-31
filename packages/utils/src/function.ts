/** `fn`, run `ms` after the last of a burst of calls, with that call's arguments. */
export function debounce<Args extends unknown[]>(fn: (...args: Args) => unknown, ms = 300): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
