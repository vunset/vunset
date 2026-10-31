# Drag as a grid

What `orientation="grid"` changes. The list is still one ordered array; the
grid is only how it's laid out: rows that wrap, from flex-wrap, CSS grid or
responsive columns. Pickup, threshold, Escape, handles and disabled items are
as in a list.

## Pointer

- The dragged item follows the pointer on both axes. The threshold is the
  straight-line distance the pointer has traveled.
- The item lands in the slot whose center is nearest its own center, slots
  measured as the drag begins. Its own slot counts, so a short move lands it
  back where it was.
- Each item between the old place and the new one slides into its neighbor's
  slot: one place back, or one on, in the order. Across a row break that's up
  to the end of the row above, or down to the start of the next.

## Keyboard

With an item picked up:

- Left and right move it one place in the order, stopping at either end.
- Up and down move it a row: as many places as the first row holds items,
  measured on each press, so it follows the layout.
- Up from the first row does nothing.
- Down from a column the short last row doesn't reach goes to the last item.
  Down from the last row does nothing.
