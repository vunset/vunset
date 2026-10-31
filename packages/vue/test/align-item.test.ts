import { describe, it, expect } from 'vitest';
import { computeItemAlignment, type AlignGeometry } from '../src';

/**
 * A list of ten 40px options in a popup with 4px of padding at each end,
 * sitting in a 800px viewport with the trigger comfortably in the middle.
 */
const base: AlignGeometry = {
  viewportHeight: 800,
  triggerTop: 400,
  triggerHeight: 40,
  contentHeight: 400,
  fullHeight: 408,
  listOffsetTop: 4,
  itemCenterFromContentTop: 20,
  itemHeight: 40,
  listMaxHeightLimit: Infinity,
  margin: 8,
  minHeight: 100,
  edgeThreshold: 20,
};

/** Where the option's center ends up on screen, given a result. */
function itemCenterOnScreen(g: AlignGeometry, r: { top: number; scrollTop: number }) {
  return r.top + g.listOffsetTop + g.itemCenterFromContentTop - r.scrollTop;
}

const triggerCenter = (g: AlignGeometry) => g.triggerTop + g.triggerHeight / 2;

describe('computeItemAlignment', () => {
  describe('when there is room', () => {
    it('puts the option exactly on the trigger without scrolling', () => {
      // The fifth option, 180px down the list.
      const geometry = { ...base, itemCenterFromContentTop: 180 };
      const result = computeItemAlignment(geometry)!;

      expect(result).not.toBeNull();
      expect(result.scrollTop).toBe(0);
      expect(itemCenterOnScreen(geometry, result)).toBeCloseTo(triggerCenter(geometry));
    });

    it('shows the whole list when it fits, with nothing scrolled', () => {
      // High enough that the aligned popup still clears the bottom margin.
      const geometry = { ...base, triggerTop: 380 };
      const result = computeItemAlignment(geometry)!;

      expect(result.height).toBe(geometry.fullHeight);
      expect(result.listMaxHeight).toBe(geometry.contentHeight);
      expect(result.scrollTop).toBe(0);
    });

    it('shrinks the popup rather than breaking the alignment', () => {
      // At this trigger position the whole list would overhang the bottom
      // margin by 12px. Keeping the option on the trigger matters more than
      // showing the last 12px, so the popup gives up the height and the
      // remainder becomes scrollable below.
      const result = computeItemAlignment(base)!;

      expect(result.height).toBe(396);
      expect(result.listMaxHeight).toBeLessThan(base.contentHeight);
      // The chosen option is the first one, so nothing has to scroll for it.
      expect(result.scrollTop).toBe(0);
      expect(itemCenterOnScreen(base, result)).toBeCloseTo(triggerCenter(base));
    });
  });

  describe('when the list must scroll to make it work', () => {
    it('scrolls the list so the option still lands on the trigger', () => {
      // A long list with the option well down it: the popup fills the viewport
      // and the remainder becomes scroll.
      const geometry = {
        ...base,
        viewportHeight: 600,
        triggerTop: 300,
        contentHeight: 800,
        fullHeight: 808,
        itemCenterFromContentTop: 400,
      };
      const result = computeItemAlignment(geometry)!;

      expect(result.scrollTop).toBeGreaterThan(0);
      expect(result.top).toBe(geometry.margin);
      expect(itemCenterOnScreen(geometry, result)).toBeCloseTo(triggerCenter(geometry));
    });

    it('sizes the popup from the alignment near the bottom of the screen', () => {
      // First option, trigger low down. The popup shrinks to sit between the
      // trigger and the viewport edge rather than floating above it.
      const geometry = { ...base, viewportHeight: 800, triggerTop: 500 };
      const result = computeItemAlignment(geometry)!;

      expect(result.height).toBeLessThan(geometry.fullHeight);
      expect(result.top + result.height).toBeLessThanOrEqual(
        geometry.viewportHeight - geometry.margin,
      );
      expect(itemCenterOnScreen(geometry, result)).toBeCloseTo(triggerCenter(geometry));
    });

    it('keeps the popup inside the viewport', () => {
      const geometry = { ...base, viewportHeight: 600, triggerTop: 300, contentHeight: 800, fullHeight: 808 };
      const result = computeItemAlignment(geometry)!;

      expect(result.top).toBeGreaterThanOrEqual(geometry.margin);
      expect(result.top + result.height).toBeLessThanOrEqual(
        geometry.viewportHeight - geometry.margin,
      );
    });

    it('never scrolls past the end of the list, letting the alignment give', () => {
      const geometry = {
        ...base,
        viewportHeight: 600,
        triggerTop: 300,
        contentHeight: 800,
        fullHeight: 808,
        itemCenterFromContentTop: 780,
      };
      const result = computeItemAlignment(geometry)!;

      expect(result.scrollTop).toBeLessThanOrEqual(
        geometry.contentHeight - result.listMaxHeight,
      );
      expect(result.scrollTop).toBeGreaterThanOrEqual(0);
    });
  });

  describe('with the trigger near the top and a selection far down the list', () => {
    // The case a browser window makes easy to hit: scroll until the control is
    // near the top, then open it. There is no room above the trigger for the
    // popup to place the option there, so the list has to scroll instead — and
    // it can only scroll if the popup is short enough to leave something over.
    const nearTop = {
      ...base,
      viewportHeight: 770,
      triggerTop: 25,
      triggerHeight: 38,
      contentHeight: 692,
      fullHeight: 700,
      itemCenterFromContentTop: 440,
    };

    it('still lands the option on the trigger', () => {
      const result = computeItemAlignment(nearTop)!;
      expect(itemCenterOnScreen(nearTop, result)).toBeCloseTo(triggerCenter(nearTop));
    });

    it('gets there by scrolling, not by moving the popup off screen', () => {
      const result = computeItemAlignment(nearTop)!;
      expect(result.scrollTop).toBeGreaterThan(0);
      expect(result.top).toBe(nearTop.margin);
    });

    it('shortens the popup so the list has that much scroll to give', () => {
      const result = computeItemAlignment(nearTop)!;
      const maxScroll = nearTop.contentHeight - result.listMaxHeight;

      expect(result.height).toBeLessThan(nearTop.fullHeight);
      expect(result.scrollTop).toBeLessThanOrEqual(maxScroll);
    });
  });

  describe('a long list behind a short popup', () => {
    // The Year select: 40 options at 34px behind a 240px cap, so only about
    // seven show at once and the list does nearly all the work.
    const years = {
      ...base,
      viewportHeight: 770,
      triggerTop: 400,
      triggerHeight: 38,
      contentHeight: 1360,
      fullHeight: 1368,
      itemHeight: 34,
      listMaxHeightLimit: 240,
    };
    const optionAt = (index: number) => ({
      ...years,
      itemCenterFromContentTop: index * 34 + 17,
    });

    /** Where the option sits inside the list's visible window. */
    const offsetInWindow = (g: AlignGeometry, r: { scrollTop: number }) =>
      g.itemCenterFromContentTop - r.scrollTop;

    it('puts the last option on the trigger', () => {
      const geometry = optionAt(39);
      const result = computeItemAlignment(geometry)!;
      expect(itemCenterOnScreen(geometry, result)).toBeCloseTo(triggerCenter(geometry));
    });

    it('keeps the whole of the last option inside the list window', () => {
      // The bug this exists for: satisfying the alignment alone put the option
      // hundreds of pixels below the visible list, and the popup drifted off to
      // meet an equation that could not hold.
      const geometry = optionAt(39);
      const result = computeItemAlignment(geometry)!;
      const offset = offsetInWindow(geometry, result);

      expect(offset - geometry.itemHeight / 2).toBeGreaterThanOrEqual(0);
      expect(offset + geometry.itemHeight / 2).toBeLessThanOrEqual(result.listMaxHeight);
    });

    it('scrolls the list to its end for the last option', () => {
      const geometry = optionAt(39);
      const result = computeItemAlignment(geometry)!;
      expect(result.scrollTop).toBe(geometry.contentHeight - result.listMaxHeight);
    });

    it('keeps the popup on screen for every option in the list', () => {
      for (let index = 0; index < 40; index += 1) {
        const geometry = optionAt(index);
        const result = computeItemAlignment(geometry);
        if (!result) {
          continue;
        }
        const offset = offsetInWindow(geometry, result);

        expect(result.top).toBeGreaterThanOrEqual(geometry.margin);
        expect(result.top + result.height).toBeLessThanOrEqual(
          geometry.viewportHeight - geometry.margin,
        );
        expect(itemCenterOnScreen(geometry, result)).toBeCloseTo(triggerCenter(geometry));
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThanOrEqual(result.listMaxHeight);
      }
    });

    it('shows context on both sides of an option in the middle', () => {
      const geometry = optionAt(20);
      const result = computeItemAlignment(geometry)!;
      const offset = offsetInWindow(geometry, result);

      expect(offset).toBeGreaterThan(40);
      expect(result.listMaxHeight - offset).toBeGreaterThan(40);
    });
  });

  describe("the stylesheet's own height limit", () => {
    it('is respected rather than overridden', () => {
      const result = computeItemAlignment({ ...base, triggerTop: 380, listMaxHeightLimit: 240 })!;
      expect(result.listMaxHeight).toBeLessThanOrEqual(240);
    });

    it('still lands the option on the trigger within that limit', () => {
      const geometry = {
        ...base,
        viewportHeight: 770,
        triggerTop: 25,
        triggerHeight: 38,
        contentHeight: 692,
        fullHeight: 700,
        itemCenterFromContentTop: 440,
        listMaxHeightLimit: 240,
      };
      const result = computeItemAlignment(geometry)!;

      expect(result.listMaxHeight).toBe(240);
      expect(itemCenterOnScreen(geometry, result)).toBeCloseTo(triggerCenter(geometry));
    });
  });

  describe('when it should not be attempted', () => {
    it('gives up with the trigger against the top of the viewport', () => {
      expect(computeItemAlignment({ ...base, triggerTop: 10 })).toBeNull();
    });

    it('gives up with the trigger against the bottom', () => {
      expect(computeItemAlignment({ ...base, triggerTop: 770 })).toBeNull();
    });

    it('gives up when too little of a long list would show', () => {
      // The trigger is inside the thresholds, but sits so low that aligning the
      // first option would leave a sliver of a 400px list on screen.
      expect(computeItemAlignment({ ...base, viewportHeight: 500, triggerTop: 420 })).toBeNull();
    });

    it('allows a short list that fits entirely, however small', () => {
      // Nothing is being hidden, so the minimum does not apply.
      const geometry = { ...base, contentHeight: 40, fullHeight: 48, viewportHeight: 300, triggerTop: 100 };
      const result = computeItemAlignment(geometry);
      expect(result).not.toBeNull();
      expect(result!.height).toBe(48);
    });
  });

  describe('transform origin', () => {
    it('sits where the option is, so an enter animation grows from it', () => {
      const geometry = { ...base, itemCenterFromContentTop: 20 };
      const result = computeItemAlignment(geometry)!;
      // The first option, 24px down whatever height the popup came out at.
      expect(result.originRatio).toBeCloseTo((24 / result.height) * 100, 1);
    });

    it('stays within the popup for an option at the end of a long list', () => {
      const result = computeItemAlignment({
        ...base,
        viewportHeight: 600,
        triggerTop: 300,
        contentHeight: 800,
        fullHeight: 808,
        itemCenterFromContentTop: 780,
      })!;

      expect(result.originRatio).toBeGreaterThanOrEqual(0);
      expect(result.originRatio).toBeLessThanOrEqual(100);
    });
  });
});
