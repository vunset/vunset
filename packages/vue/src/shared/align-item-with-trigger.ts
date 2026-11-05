// Places the popup so the chosen option sits over the trigger, like a native macOS `<select>`.

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
  /** The list's stylesheet max-height, or `Infinity`. An aligned popup shrinks to fit it. */
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

/** Where the popup goes, or `null` when the trigger hugs a viewport edge or too little height is left. */
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

  // The option must end up inside the list's visible window, which can force the scroll.
  const scrollFloor = (listMaxHeight: number) =>
    Math.max(
      0,
      // Far enough that the whole option is on screen.
      itemBottom - listMaxHeight,
      // Far enough that the popup does not start above the viewport.
      topLimit - triggerCenter + natural,
    );

  let height = Math.min(fullHeight, listMaxHeightLimit + chrome, available);

  // Shrinking frees scroll and more scroll allows more shrinking; two passes reach the fixed point.
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

  // Too small a slice of a long list is worse than an ordinary dropdown; a list that fits is exempt.
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

  // Centered in the list window, so the first and last options land near the popup's edges with no special case.
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

/** Measures the live elements. Lifts the list's max-height meanwhile; the caller sets the final one. */
export function measureItemAlignment(elements: AlignElements): AlignPlacement | null {
  const { trigger, positioner, popup, list, item, value, maxHeight } = elements;

  const previousMaxHeight = list.style.maxHeight;

  // Clear our previous override first, or a re-measure reads back what we wrote.
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

    // Lines the option's text up with the trigger's, so the label doesn't slide as it opens.
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
