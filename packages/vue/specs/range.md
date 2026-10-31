# Range — behavior

What `RangeRoot` and its parts must do, written from the public API, the test
suite and the docs demos. The implementation is written against this, not
against any earlier code.

## Public surface (unchanged)

Parts: `RangeRoot`, `RangeLabel`, `RangeValue`, `RangeControl`, `RangeTrack`,
`RangeIndicator`, `RangeThumb`. Every part takes `as`, renders `data-part`, and
merges the caller's attrs through `usePartProps`.

`RangeRoot` props: `modelValue`, `defaultValue` (a number, or an array for
several thumbs), `min` (0), `max` (100), `step` (1), `largeStep` (10),
`minStepsBetweenValues` (0), `disabled`, `invalid`, `orientation`
(`horizontal`), `thumbAlignment` (`center` | `edge`), `thumbCollisionBehavior`
(`push` | `swap` | `none`, default `push`), `format`, `locale`, `id`, `name`,
`form`. Emits `update:modelValue`, `change(value, details)`,
`commit(value, details)`, where details are `{ reason, event, activeThumbIndex }`
and a reason is `input-change`, `track-press`, `drag`, `keyboard` or `none`.

`RangeThumb` props: `index`, `disabled`, `ariaLabel`, `valueText`,
`getValueText(formatted, value, index)`, `tabIndex`.

## Values

- The value keeps the shape it was given: a number in, a number out; an array
  in, an array out.
- Internally it is always a list, clamped to `[min, max]` and sorted.
- The gap between neighboring thumbs is `minStepsBetweenValues × step`.
- A value on the grid is `min + k × step`. Snapping rounds to the nearest grid
  value. Arithmetic is rounded to the decimals of `step` and `min`, so
  `0.2 + 0.1` is `0.3`.
- `change` fires only when the value actually moves. `commit` fires once an
  interaction settles, and only if the value differs from where that
  interaction began.

## Keyboard (on a thumb's input)

The input's own stepping is always suppressed: it cannot see the other thumbs.

| Key | Moves by |
|---|---|
| ArrowRight / ArrowUp | `+step` (`+largeStep` with Shift) |
| ArrowLeft / ArrowDown | `−step` (`−largeStep` with Shift) |
| PageUp / PageDown | `±largeStep` |
| Home / End | to the lowest / highest value the thumb may take |

In a right-to-left horizontal control, ArrowRight and ArrowLeft swap: an
arrow moves the thumb the way it points.

The result is snapped, then held inside the thumb's own room: never below the
previous thumb plus the gap, never above the next thumb minus the gap, and never
outside `[min, max]`. The keyboard never pushes other thumbs. Each step changes
and commits at once, with reason `keyboard`. Other keys are left alone. A
disabled range or thumb ignores keys.

A `change` event on the input (its value set from outside) applies that number
the same way, with reason `input-change`.

## Pointer

- Only the primary button starts anything, and nothing starts while the range
  is disabled.
- **Choosing the thumb.** A press on a thumb takes that thumb. The value does not
  jump: the drag keeps the offset between the press and the thumb's center. A
  press elsewhere takes the nearest enabled thumb. When thumbs sit on the same
  spot, the press takes the one that can move towards it: the lowest index if
  it lands below them, the highest if above.
- **Where the pointer is.** The pointer maps to a value along the control's box,
  minus its border and padding at either end. Horizontal runs left to right,
  reversed in RTL; vertical runs bottom to top. With `thumbAlignment: 'edge'`
  the travel is also shortened by half a thumb at each end. The value is
  snapped.
- **Press.** A press away from the thumb moves it there at once, with reason
  `track-press`, and focuses that thumb's input.
- **Drag.** Moves are tracked on the document until release. Each move applies
  the new value, with reason `drag`.
- **End.** A drag ends on `pointerup`, on `pointercancel`, or on a move with no
  buttons held (the release happened somewhere else). It then commits: with
  reason `drag` if the pointer moved, `track-press` if not.
- The root and every part carry `data-dragging` while the pointer is down.

## Collisions (pointer only)

The dragged thumb can never leave `[min + i × gap, max − (n − 1 − i) × gap]`.
Past that:

- **`push`** — The thumbs in the way are pushed ahead, each kept one gap from
  the next. When the drag comes back, a pushed thumb follows it back, but only
  as far as where it stood when the drag began; it is never pulled past that.
- **`swap`** — Moving strictly past a neighbor hands the drag to that
  neighbor's slot. The thumbs that were passed keep their values, the dragged
  value is held one gap clear of its new neighbors, and focus moves to the
  thumb that now holds the drag.
- **`none`** — The dragged thumb stops one gap short of its neighbors.

## Rendering

- **Root**: `role="group"`, `id` from its prop, `aria-labelledby` pointing at a
  mounted `RangeLabel`. Its data hooks are orientation, disabled, dragging,
  invalid and focus; numeric state is never an attribute.
- **Thumb position, centered**: the thumb's center sits at the value's
  percentage along the control. It follows `inset-inline-start` horizontally
  (so RTL flips it) and `bottom` vertically, and is translated by half its own
  size.
- **Thumb position, edge**: measured, not derived. The position is
  `(half the thumb + travel × ratio) / control size` and is published as
  `--position`. For a 20px thumb on a 200px control that is 5% at the minimum
  and 95% at the maximum. The thumb stays hidden until the first measurement,
  which happens on mount and again on resize.
- **Thumb stacking**: overlapping thumbs stack with the active one (dragged or
  focused) on top, then the one used last. That keeps a thumb that was pushed
  onto another still reachable.
- **A thumb with no position**: when `min === max`, the thumb renders
  visually hidden instead of at a position computed from NaN.
- **Indicator, one thumb**: from the start of the track to the value.
- **Indicator, several thumbs**: from the first thumb to the last.
- **Indicator, edge alignment**: uses the measured positions, published as
  `--start-position` and `--relative-size`, and stays hidden until they exist.
- **Thumb data**: `data-index`, `data-focused`, `data-focus-visible`, plus the
  root's hooks.

## Thumb input

A visually hidden `<input type="range">` inside each thumb carries:

- `min`, `max`, `step`, `value`, `name`, `form` and `disabled` (from the root or
  from the thumb itself)
- `aria-valuenow`, `aria-orientation` and `aria-label`, or else
  `aria-labelledby` pointing at the label
- `aria-valuetext`:
  1. `getValueText(...)` when given, else `valueText`, else the formatted value
  2. with two thumbs, the default gains `start range` or `end range`
- `tabindex`

For its `id`:

- A single thumb takes the id a surrounding field hands out, so a
  `FieldLabel` points at it. It never takes the root's own `id`.
- Otherwise the thumb uses a generated id.

Focusing it makes the thumb active and marks the field focused. Blurring it
clears active and marks the field touched.

## Value and label

- `RangeValue` is an `<output>` with `aria-live="off"`, `for` listing every thumb
  input's id, and the formatted values joined by ` – `.
- `RangeLabel` carries an id and registers itself so the root and inputs point
  at it.

## Thumbs and their slots

- A thumb's index is its `index` prop, or else its mount order.
- A thumb that unmounts and comes back, or two thumbs whose indices swap, must
  both stay reachable by pointer and keyboard.
- A value with no thumb is neither shown nor submitted, so the app renders one
  thumb per value.

## Field

- Inherits `disabled` and `invalid`.
- The field label points at the single thumb's input.
- Focus and blur on any thumb drive the field's `focused` and `touched`.
