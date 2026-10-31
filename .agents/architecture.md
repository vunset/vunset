# Architecture of `@vunset/vue`

Paths are `packages/vue/`'s. The Root → Part basics are in the root `AGENTS.md`.

## A composable only when it's earned

Where the root's behavior is shared (the tests below), it sits one layer lower
in a composable (`useXxx`, beside the root or in `src/shared/`), which returns
the same object the root would provide; the context is declared in its module.

**Start in the root, not in a composable.** The default is one
`XxxRoot.vue`: the behavior goes straight in `<script setup>`, and the types,
the context and any pure helper go in a plain `<script>` block beside it, which
_can_ export where `<script setup>` cannot. Parts import that context from the
root's own module. `Badge`, `Group`, `AlertRoot`, `Icon` and `Floating` are written
this way, and size is not a reason to change it — `FloatingRoot.vue` holds a
`ResizeObserver`, a window listener and two pointer gestures, and is still one
file, because all of it serves one root.

A `useXxx.ts` earns its place on one of two tests, and on nothing else:

1. **Two roots need it and cannot get it from each other.** `useListbox` is
   `SelectRoot` and `ComboboxRoot`; `useGauge` is `ProgressRoot` and `MeterRoot`;
   `useMenu` is the menu, the menubar and the context menu.
2. **The family needs more than one composable**, because parts own lifecycle of
   their own and a `<script setup>` block cannot export: `useTabs` ships
   `useTab`, `useTabPanel` and `useTabsIndicator` beside it, `useField` ships
   `useFieldMessage` and `useFieldError`, `useRange` ships `useRangeThumb`.

A composable that is public API in its own right — `useClipboard`, `useToast` —
is not a root's behavior and lives in `src/composables/`; its component (`Copy`,
`ToastViewport`) is a convenience built on it.

Neither test is about length or about how much state there is. Where a part
needs no lifecycle, a `getXxxProps(item)` factory on the root covers it
(`useListbox`, `useMenu`, and every cell in `Calendar`) and no second
composable is needed.

Several composables predate this rule and serve a single root — `useScrollArea`,
`useButton`, `useCollapsible`, `useCalendar`. They belong in their roots; fold
them in when there is reason to be in the file anyway, not as a sweep.

A part that owns lifecycle of its own — an element to measure, a registration
to hold, an id to contribute — gets its own composable exported from the same
module as the root's (`useFieldMessage`, `useFieldError`, `useRangeThumb`)
rather than a prop bag the root hands out.

## Prop merging and the event-prevention protocol

`usePartProps` (`src/shared/use-part-props.ts`) merges a part's internal prop bag
with the caller's fallthrough attrs via `mergeProps`
(`src/shared/merge-props.ts`). Order matters: the caller's props win conflicts,
`class`/`style` are concatenated rather than overwritten, and same-named event
handlers are chained so the **caller's handler runs first**. It receives an
event tagged with `preventInternalHandler()`; calling it stops the library's
internal handler from also firing. This is Vue's answer to React's
`event.preventDefault()`-based cancellation, since Vue hands listeners the raw
DOM event.

## Shared surface primitives

`Portal`, `Positioner`, `Popup`, and `Addon` (`src/components/surface/`) serve
every anchored/overlay component — dialog, drawer, popover, menu, tooltip,
select, combobox — instead of each owning its own copy. A composable's `Root`
calls `provideSurface` (`src/shared/surface.ts`) with `present`/`state`/
`popupProps`/`positionerProps`/`arrowProps`; the shared parts call `useSurface`
and read whichever fields apply. `inject` resolves to the _nearest_ provider,
so a menu nested in a dialog gets the menu's surface, not the dialog's — which
is what nesting is supposed to mean. `present` tracks DOM presence, not
openness: it stays `true` through an exit animation (see below), which is what
keeps a portal's content mounted until the animation finishes.

## Controlled/uncontrolled state

`useControlled` (`src/shared/use-controlled.ts`) is the standard pattern for
any value that may be owned by the caller (`open`, `value`, ...) or by the
component. Ownership is decided once, on first use — not rebuilt on
`defineModel`, because that helper keeps a local shadow value that would let a
controlled component drift from a parent that ignores its change event.
A root passes its prop's name (`prop: 'modelValue'`, `'open'`), so a bound
prop is controlled even while `undefined`: a `v-model` on a ref that starts
empty. A wrapper therefore forwards the prop only when its own caller bound it
(`isPropBound`), or it would hold the part it wraps controlled by `undefined`.

## Dismissal

`src/shared/dismiss-stack.ts` is a single module-level stack of open
dismissable layers (dialog, popover, menu, ...), not per-component listeners.
That's what makes nesting behave correctly: Escape closes only the innermost
layer, and a click closes every layer it didn't land inside, walking from the
top down and stopping at a modal layer's backdrop (which physically
intercepted the press). `useDismiss` (`src/shared/use-dismiss.ts`) is the
per-composable hook that registers a layer on this stack.

## Exit animations

`useTransitionStatus` (`src/shared/use-transition-status.ts`) tracks an
enter/exit lifecycle (`enter → idle → leave`) separately from `open`, so a
part can keep rendering — and animate out — after logical state has already
flipped closed. `useExitAnimation` (`src/shared/use-exit-animation.ts`) is what
composables call to wire an element's real CSS/WAAPI animation duration into
that lifecycle rather than an arbitrary timeout.

## Select and Combobox share one engine

`useListbox` (`src/shared/use-listbox.ts`) implements both: a `mode` of
`'select'` or `'combobox'` toggles whether the trigger is a button (value
shown, search lives inside the popup) or a text input (typed value can be
committed). `SelectRoot` and `ComboboxRoot` each call it with their mode fixed,
so neither is a separate implementation — and the mode is not a prop, because a
select that could be told to behave like a combobox would be one.
