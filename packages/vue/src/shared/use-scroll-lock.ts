import { toValue, watch, onScopeDispose, type MaybeRefOrGetter } from 'vue';

/**
 * Locks are counted rather than boolean. A dialog opening a second dialog must
 * not have the inner one's close restore scrolling while the outer is still up.
 */
let lockCount = 0;
let restore: (() => void) | null = null;

function isIos(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  // iPadOS reports as Macintosh, so touch capability is part of the test.
  return (
    /iP(hone|ad|od)/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function applyLock(): () => void {
  const { body, documentElement } = document;

  const previousOverflow = body.style.overflow;
  const previousRootOverflow = documentElement.style.overflow;
  const previousPaddingRight = body.style.paddingRight;
  const previousPosition = body.style.position;
  const previousTop = body.style.top;
  const previousWidth = body.style.width;

  const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

  if (scrollbarWidth > 0) {
    const currentPadding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }

  body.style.overflow = 'clip';
  // The page scrolls by whichever of the two sets an overflow: an app styling
  // `<html>` (even `overflow-x: clip`) makes the body's own setting moot.
  documentElement.style.overflow = 'clip';

  // iOS Safari ignores `overflow: hidden` on the body, so the page scrolls
  // behind the dialog anyway. Pinning the body in place is the only thing that
  // holds, at the cost of having to restore the scroll position by hand.
  const scrollY = window.scrollY;

  if (isIos()) {
    body.style.position = 'fixed';
    body.style.top = `${-scrollY}px`;
    body.style.width = '100%';
  }

  return () => {
    body.style.overflow = previousOverflow;
    documentElement.style.overflow = previousRootOverflow;
    body.style.paddingRight = previousPaddingRight;

    if (isIos()) {
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.width = previousWidth;
      // Restoring the styles alone leaves the page at the top.
      window.scrollTo(0, scrollY);
    }
  };
}

/** Prevents the page behind a modal surface from scrolling. */
export function useScrollLock(enabled: MaybeRefOrGetter<boolean>): void {
  let held = false;

  function release() {
    if (!held) return;
    held = false;
    lockCount -= 1;
    if (lockCount === 0) {
      restore?.();
      restore = null;
    }
  }

  function acquire() {
    if (held || typeof document === 'undefined') return;

    held = true;
    lockCount += 1;
    if (lockCount === 1) {
      restore = applyLock();
    }
  }

  watch(
    () => toValue(enabled),
    (on) => (on ? acquire() : release()),
    { immediate: true, flush: 'post' }
  );

  onScopeDispose(release);
}
