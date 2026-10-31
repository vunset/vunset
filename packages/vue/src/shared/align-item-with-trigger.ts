/**
 * Placing a dropdown so the chosen option sits on top of the trigger, the way a
 * native macOS `<select>` does. The list scrolls itself into the right place,
 * so the option you are looking at does not move when the popup opens.
 *
 * The geometry is a pure function of a handful of measurements, kept separate
 * from the DOM so it can be reasoned about — and tested — without a layout
 * engine.
 */

export interface AlignGeometry {
  /** Usable viewport height. */
  viewportHeight: number;
  /** Trigger's distance from the top of the viewport. */
  triggerTop: number;
  triggerHeight: number;
  /** The popup's height with nothing constraining the list. */
  fullHeight: number;
  /** The scrollable content's full height. */
  contentHeight: number;
  /** Distance from the popup's top edge to the list's top edge. */
  listOffsetTop: number;
  /** Center of the target option, measured from the top of the content. */
  itemCenterFromContentTop: number;
  /** The option's own height. The whole of it has to stay inside the list. */
  itemHeight: number;
  /**
   * The tallest the list may be by the stylesheet's reckoning, or `Infinity`.
   * An aligned popup shrinks to fit this rather than overriding it.
   */
  listMaxHeightLimit: number;
  /** Space kept between the popup and the viewport edges. */
  margin: number;
  /** Below this, a dropdown that covers its trigger is worse than one beside it. */
  minHeight: number;
  /** How close the trigger may be to a viewport edge before this is abandoned. */
  edgeThreshold: number;
}

export interface AlignResult {
  /** Where to put the popup's top edge, in viewport coordinates. */
  top: number;
  /** The popup's height. */
  height: number;
  /** What the list may grow to before it scrolls. */
  listMaxHeight: number;
  /** How far to scroll the list so the option lands on the trigger. */
  scrollTop: number;
  /** Vertical origin for an enter animation, as a percentage of the popup. */
  originRatio: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

/**
 * Works out where the popup goes, or returns `null` to say it should not be
 * tried at all.
 *
 * Two situations make it worse than an ordinary dropdown, and both bail out
 * rather than producing something cramped: a trigger already hard against the
 * top or bottom of the viewport, which leaves the list nowhere to extend, and
 * too little height to show a useful number of options.
 */
export function computeItemAlignment(geometry: AlignGeometry): AlignResult | null {
  const {
    viewportHeight,
    triggerTop,
    triggerHeight,
    fullHeight,
    contentHeight,
    listOffsetTop,
    itemCenterFromContentTop,
    itemHeight,
    listMaxHeightLimit,
    margin,
    minHeight,
    edgeThreshold,
  } = geometry;

  if (triggerTop < edgeThreshold || triggerTop + triggerHeight > viewportHeight - edgeThreshold) {
    return null;
  }

  const topLimit = margin;
  const bottomLimit = viewportHeight - margin;
  const available = bottomLimit - topLimit;
  const chrome = fullHeight - contentHeight;

  const triggerCenter = triggerTop + triggerHeight / 2;
  // Where the option sits from the popup's top edge with the list unscrolled.
  const natural = listOffsetTop + itemCenterFromContentTop;
  const itemTop = itemCenterFromContentTop - itemHeight / 2;
  const itemBottom = itemCenterFromContentTop + itemHeight / 2;

  /**
   * How far the list may scroll, given a popup of `height`.
   *
   * The lower bound is the part that matters and the part that is easy to miss:
   * the option has to end up **inside** the list's visible window. The last
   * option of a long list can only be shown by scrolling to the end, so the
   * scroll is forced, and the popup has to be placed around that rather than
   * the other way about.
   */
  const scrollFloor = (listMaxHeight: number) =>
    Math.max(
      0,
      // Far enough that the whole option is on screen.
      itemBottom - listMaxHeight,
      // Far enough that the popup does not start above the viewport.
      topLimit - triggerCenter + natural,
    );

  let height = Math.min(fullHeight, listMaxHeightLimit + chrome, available);

  // Shrinking frees up scroll, and more scroll may allow more shrinking, so the
  // two settle against each other. Two passes is enough to reach the fixed
  // point for any real list; the bounds below are checked regardless.
  for (let pass = 0; pass < 2; pass += 1) {
    const floor = scrollFloor(Math.max(0, height - chrome));
    height = Math.min(
      height,
      // Short enough that the list still has `floor` worth of scroll to give.
      fullHeight - floor,
      // Reaching no further down than the bottom margin.
      bottomLimit - triggerCenter + natural - floor,
    );
  }

  // A popup showing less than a useful slice of a long list is worse than an
  // ordinary dropdown. A short list that fits entirely is exempt: it is already
  // showing everything there is.
  if (height < Math.min(fullHeight, minHeight)) {
    return null;
  }

  const listMaxHeight = Math.max(0, height - chrome);
  const maxScroll = Math.max(0, contentHeight - listMaxHeight);

  const scrollLo = scrollFloor(listMaxHeight);
  const scrollHi = Math.min(
    maxScroll,
    // No further than the option itself, which would scroll it off the top.
    itemTop,
    // Not so little that the popup runs past the bottom margin.
    bottomLimit - height - triggerCenter + natural,
  );

  if (scrollLo > scrollHi) {
    return null;
  }

  // Within what is allowed, the option sits in the middle of the list window,
  // so the popup opens with as much context above it as below — which is what
  // puts the first option near the top of its popup and the last near the
  // bottom, without either being a special case.
  const preferred = itemCenterFromContentTop - listMaxHeight / 2;
  const scrollTop = clamp(preferred, scrollLo, scrollHi);

  const offsetInPopup = natural - scrollTop;
  const top = triggerCenter - offsetInPopup;

  const originRatio = height > 0 ? clamp((offsetInPopup / height) * 100, 0, 100) : 50;

  return { top, height, listMaxHeight, scrollTop, originRatio };
}

export interface AlignElements {
  trigger: HTMLElement;
  positioner: HTMLElement;
  popup: HTMLElement;
  list: HTMLElement;
  item: HTMLElement;
  /** The part of the trigger showing the current value, for horizontal alignment. */
  value?: HTMLElement | null;
  /** The list's own cap, if it has one. Read instead of the stylesheet's. */
  maxHeight?: string;
}

export interface AlignPlacement extends AlignResult {
  left: number;
}

export const ALIGN_MARGIN = 8;
export const ALIGN_MIN_HEIGHT = 100;
export const ALIGN_EDGE_THRESHOLD = 20;

/**
 * Measures the live elements and returns where the popup should go.
 *
 * The list's `max-height` is lifted while measuring, because the popup's
 * natural height is the thing being measured and a stylesheet cap would hide
 * it. The caller sets the final value from the result.
 */
export function measureItemAlignment(elements: AlignElements): AlignPlacement | null {
  const { trigger, positioner, popup, list, item, value, maxHeight } = elements;

  const previousMaxHeight = list.style.maxHeight;

  // Read the stylesheet's cap before overriding it — and clear our own previous
  // override first, or a re-measure would read back what we last wrote instead
  // of what the author asked for.
  list.style.removeProperty('max-height');
  if (maxHeight) list.style.maxHeight = maxHeight;
  const authoredMaxHeight = parseFloat(getComputedStyle(list).maxHeight);
  const listMaxHeightLimit = Number.isFinite(authoredMaxHeight) ? authoredMaxHeight : Infinity;

  list.style.maxHeight = 'none';

  try {
    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const geometry: AlignGeometry = {
      viewportHeight: document.documentElement.clientHeight,
      triggerTop: triggerRect.top,
      triggerHeight: triggerRect.height,
      fullHeight: popupRect.height,
      contentHeight: list.scrollHeight,
      listOffsetTop: listRect.top - popupRect.top,
      // Converted to content coordinates: the list may already be scrolled.
      itemCenterFromContentTop:
        itemRect.top - listRect.top + list.scrollTop + itemRect.height / 2,
      itemHeight: itemRect.height,
      listMaxHeightLimit,
      margin: ALIGN_MARGIN,
      minHeight: ALIGN_MIN_HEIGHT,
      edgeThreshold: ALIGN_EDGE_THRESHOLD,
    };

    const result = computeItemAlignment(geometry);
    if (!result) {
      return null;
    }

    // Horizontally, the option's text lines up with the trigger's, so the label
    // being read does not slide sideways as the popup opens.
    const positionerRect = positioner.getBoundingClientRect();
    let left = triggerRect.left;

    if (value) {
      const valueRect = value.getBoundingClientRect();
      const itemTextLeft = itemRect.left + (parseFloat(getComputedStyle(item).paddingLeft) || 0);
      left = positionerRect.left + (valueRect.left - itemTextLeft);
    }

    const viewportWidth = document.documentElement.clientWidth;
    left = clamp(left, ALIGN_MARGIN, viewportWidth - ALIGN_MARGIN - positionerRect.width);

    return { ...result, left };
  } finally {
    list.style.maxHeight = previousMaxHeight;
  }
}
