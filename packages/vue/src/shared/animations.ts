/**
 * Resolves once every CSS animation and transition running on `element` has
 * settled, or immediately if none are.
 */
export function waitForAnimationsToFinish(element: HTMLElement, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    requestAnimationFrame(() => {
      if (signal?.aborted) {
        resolve();
        return;
      }

      // A looping animation inside (a spinner) never finishes, nor does a paused
      // one (a toast's progress bar), so neither can hold the exit.
      const animations = (element.getAnimations?.({ subtree: true }) ?? []).filter(
        (animation) =>
          animation.playState !== 'paused' && animation.effect?.getComputedTiming().iterations !== Infinity
      );
      if (animations.length === 0) {
        resolve();
        return;
      }

      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      signal?.addEventListener('abort', finish, { once: true });
      Promise.allSettled(animations.map((animation) => animation.finished)).then(finish);
    });
  });
}

export function hasAnimation(element: HTMLElement): boolean {
  const styles = getComputedStyle(element);
  const hasKeyframes = styles.animationName !== 'none' && parseFloat(styles.animationDuration) > 0;
  const hasTransition = parseFloat(styles.transitionDuration) > 0;
  return hasKeyframes || hasTransition;
}
