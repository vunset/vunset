import { describe, it, expect, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import {
  RangeRoot,
  RangeLabel,
  RangeValue,
  RangeControl,
  RangeTrack,
  RangeIndicator,
  RangeThumb,
  FieldRoot,
  FieldLabel,
} from '../src';
import { dragTo, roomFor, snap, type Scale } from '../src/components/range/range-math';

/**
 * jsdom performs no layout and `test/setup.ts` hands every element the same
 * box, which would put every thumb at the same midpoint. Pointer behavior is
 * all about where things are, so these tests place the control and its thumbs
 * by hand.
 */
const CONTROL_WIDTH = 200;
const THUMB_SIZE = 20;

function setRect(element: Element, rect: Partial<DOMRect>) {
  const box = {
    x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0,
    ...rect,
  };
  (element as any).getBoundingClientRect = () => ({ ...box, toJSON: () => ({}) });
}

/** Lays the control out as a 200px-wide bar at the origin, with thumbs on their values. */
function layoutRange(wrapper: VueWrapper<any>, options: { min?: number; max?: number } = {}) {
  const { min = 0, max = 100 } = options;
  const control = wrapper.find('[data-part="control"]').element;
  setRect(control, { x: 0, left: 0, right: CONTROL_WIDTH, width: CONTROL_WIDTH, height: 20, bottom: 20 });

  wrapper.findAll('[data-part="thumb"]').forEach((thumb) => {
    const input = thumb.find('input').element as HTMLInputElement;
    const ratio = (Number(input.value) - min) / (max - min);
    const center = ratio * CONTROL_WIDTH;
    setRect(thumb.element, {
      left: center - THUMB_SIZE / 2,
      right: center + THUMB_SIZE / 2,
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      bottom: THUMB_SIZE,
    });
  });
}

function pointer(type: string, x: number, extra: PointerEventInit = {}) {
  return new PointerEvent(type, {
    bubbles: true,
    pointerId: 1,
    clientX: x,
    clientY: 10,
    button: 0,
    buttons: 1,
    ...extra,
  } as PointerEventInit);
}

function thumbCountFor(props: Record<string, any>) {
  const value = props.modelValue ?? props.defaultValue;
  return Array.isArray(value) ? value.length : 1;
}

function mountRange(props: Record<string, any> = {}, thumbProps: Record<string, any>[] = []) {
  const count = thumbCountFor(props);
  return mount(RangeRoot as any, {
    props,
    slots: {
      default: () => [
        h(RangeValue as any),
        // The thumbs sit inside the track, which is the box they position
        // against — the composition the parts are designed for.
        h(RangeControl as any, null, {
          default: () =>
            h(RangeTrack as any, null, {
              default: () => [
                h(RangeIndicator as any),
                ...Array.from({ length: count }, (_, i) =>
                  h(RangeThumb as any, { key: i, ...(thumbProps[i] ?? {}) }),
                ),
              ],
            }),
        }),
      ],
    },
    attachTo: document.body,
  });
}

const inputs = (w: VueWrapper<any>) => w.findAll('input[type="range"]');
const firstInput = (w: VueWrapper<any>) => inputs(w)[0];
const control = (w: VueWrapper<any>) => w.find('[data-part="control"]');
const indicator = (w: VueWrapper<any>) => w.find('[data-part="indicator"]');
const values = (w: VueWrapper<any>) => inputs(w).map((i) => Number((i.element as HTMLInputElement).value));

/** Presses the control at `x`, drags through `path`, and releases. */
async function drag(w: VueWrapper<any>, x: number, path: number[] = [], release = true) {
  control(w).element.dispatchEvent(pointer('pointerdown', x));
  await nextTick();

  for (const next of path) {
    document.dispatchEvent(pointer('pointermove', next));
    await nextTick();
  }

  if (release) {
    document.dispatchEvent(pointer('pointerup', path[path.length - 1] ?? x, { buttons: 0 }));
    await nextTick();
  }
}

describe('Range', () => {
  describe('rendering', () => {
    it('groups the parts and gives each thumb a real range input', () => {
      const w = mountRange({ defaultValue: 40 });
      expect(w.attributes('role')).toBe('group');
      expect(inputs(w)).toHaveLength(1);

      const input = firstInput(w).element as HTMLInputElement;
      expect(input.type).toBe('range');
      expect(input.value).toBe('40');
      expect(input.min).toBe('0');
      expect(input.max).toBe('100');
      expect(input.step).toBe('1');
    });

    it('renders one thumb per value in a range', () => {
      const w = mountRange({ defaultValue: [20, 70] });
      expect(values(w)).toEqual([20, 70]);
    });

    it('publishes the orientation and leaves the numeric state off the attributes', () => {
      const w = mountRange({ defaultValue: 40, orientation: 'vertical' });
      expect(w.attributes('data-orientation')).toBe('vertical');
      expect(w.attributes()).not.toHaveProperty('data-values');
      expect(w.attributes()).not.toHaveProperty('data-min');
      expect(w.attributes()).not.toHaveProperty('data-step');
    });

    it('sizes the indicator to the value', () => {
      const w = mountRange({ defaultValue: 40 });
      expect(indicator(w).attributes('style')).toContain('width: 40%');
    });

    it('spans between the thumbs of a range', () => {
      const w = mountRange({ defaultValue: [20, 70] });
      const style = indicator(w).attributes('style') ?? '';
      expect(style).toContain('inset-inline-start: 20%');
      expect(style).toContain('width: 50%');
    });

    it('hides a thumb that has no position to take', () => {
      // An empty interval leaves the percentage undefined rather than at an end.
      const w = mountRange({ defaultValue: 5, min: 5, max: 5 });
      const style = w.find('[data-part="thumb"]').attributes('style') ?? '';
      // The visually-hidden box, rather than a position derived from NaN.
      expect(style).toContain('width: 1px');
      expect(style).not.toContain('inset-inline-start');
    });
  });

  describe('inset thumbs', () => {
    /**
     * `thumbAlignment: 'edge'` cannot be derived from the value — the thumb's
     * own width shortens the distance it travels, so it has to be measured.
     */
    async function mountInset(value: number) {
      // Mounted at a different value on purpose: the first measurement happens
      // before the test geometry below is in place, so the value has to move
      // afterwards to trigger a second one.
      const w = mountRange({ modelValue: value === 0 ? 100 : 0, thumbAlignment: 'edge' });
      layoutRange(w);
      await w.setProps({ modelValue: value });
      await nextTick();
      return w;
    }

    it('positions the thumb inside the control rather than over its edge', async () => {
      const w = await mountInset(100);
      const style = w.find('[data-part="thumb"]').attributes('style') ?? '';

      // At the maximum, a centered thumb would sit at 100% with half of it
      // hanging off. Inset, its center stops half a thumb short: with a 20px
      // thumb in a 200px control, that is 190/200 = 95%.
      expect(style).toContain('--position: 95%');
      expect(style).not.toContain('--position: 100%');
    });

    it('starts half a thumb in, at the minimum', async () => {
      const w = await mountInset(0);
      expect(w.find('[data-part="thumb"]').attributes('style')).toContain('--position: 5%');
    });

    it('measures on mount, without waiting for a resize', async () => {
      // `ResizeObserver` is stubbed inert in this environment, so nothing but
      // the mount itself can produce the first measurement.
      const w = mountRange({ defaultValue: 40, thumbAlignment: 'edge' });
      await nextTick();

      const style = w.find('[data-part="thumb"]').attributes('style') ?? '';
      expect(style).toContain('--position:');
      expect(style).not.toContain('visibility: hidden');
    });

    it('hands the measured position to the indicator', async () => {
      const w = await mountInset(50);
      expect(indicator(w).attributes('style')).toContain('--start-position: 50%');
    });
  });

  describe('keyboard', () => {
    it.each([
      ['ArrowRight', 41],
      ['ArrowUp', 41],
      ['ArrowLeft', 39],
      ['ArrowDown', 39],
    ])('%s steps the value to %i', async (key, expected) => {
      const w = mountRange({ defaultValue: 40 });
      await firstInput(w).trigger('keydown', { key });
      expect(values(w)).toEqual([expected]);
    });

    it('takes the large step when shift is held', async () => {
      const w = mountRange({ defaultValue: 40 });
      await firstInput(w).trigger('keydown', { key: 'ArrowRight', shiftKey: true });
      expect(values(w)).toEqual([50]);
    });

    it.each([
      ['PageUp', 50],
      ['PageDown', 30],
    ])('%s moves by the large step', async (key, expected) => {
      const w = mountRange({ defaultValue: 40 });
      await firstInput(w).trigger('keydown', { key });
      expect(values(w)).toEqual([expected]);
    });

    it.each([
      ['Home', 0],
      ['End', 100],
    ])('%s goes to the %i end', async (key, expected) => {
      const w = mountRange({ defaultValue: 40 });
      await firstInput(w).trigger('keydown', { key });
      expect(values(w)).toEqual([expected]);
    });

    it('stops at the bounds', async () => {
      const w = mountRange({ defaultValue: 100 });
      await firstInput(w).trigger('keydown', { key: 'ArrowRight' });
      expect(values(w)).toEqual([100]);
    });

    it('suppresses the input\'s own stepping, which ignores the other thumbs', async () => {
      const w = mountRange({ defaultValue: 40 });
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
      firstInput(w).element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('keeps decimal steps clean', async () => {
      const w = mountRange({ defaultValue: 0.2, min: 0, max: 1, step: 0.1 });
      await firstInput(w).trigger('keydown', { key: 'ArrowRight' });
      expect(values(w)).toEqual([0.3]);
    });

    it('holds each thumb of a range behind its neighbor', async () => {
      const w = mountRange({ defaultValue: [20, 70] });
      // End on the lower thumb reaches the upper one, not the maximum.
      await inputs(w)[0].trigger('keydown', { key: 'End' });
      expect(values(w)).toEqual([70, 70]);
    });

    it('leaves the required gap between thumbs', async () => {
      const w = mountRange({ defaultValue: [20, 70], minStepsBetweenValues: 10 });
      await inputs(w)[0].trigger('keydown', { key: 'End' });
      expect(values(w)).toEqual([60, 70]);
    });

    it('ignores keys it does not handle', async () => {
      const w = mountRange({ defaultValue: 40 });
      await firstInput(w).trigger('keydown', { key: 'a' });
      expect(values(w)).toEqual([40]);
    });
  });

  describe('pointer', () => {
    it('jumps to a press on the track and commits it', async () => {
      const onCommit = vi.fn();
      const w = mountRange({ defaultValue: 10, onCommit });
      layoutRange(w);

      await drag(w, 150);

      expect(values(w)).toEqual([75]);
      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit.mock.calls[0][0]).toBe(75);
      expect(onCommit.mock.calls[0][1].reason).toBe('track-press');
    });

    it('follows the pointer while dragging', async () => {
      const w = mountRange({ defaultValue: 10 });
      layoutRange(w);

      await drag(w, 20, [60, 120], false);
      expect(values(w)).toEqual([60]);

      document.dispatchEvent(pointer('pointerup', 120, { buttons: 0 }));
      await nextTick();
    });

    it('reports dragging while the pointer is down', async () => {
      const w = mountRange({ defaultValue: 10 });
      layoutRange(w);

      control(w).element.dispatchEvent(pointer('pointerdown', 100));
      await nextTick();
      expect(w.attributes()).toHaveProperty('data-dragging');

      document.dispatchEvent(pointer('pointerup', 100, { buttons: 0 }));
      await nextTick();
      expect(w.attributes()).not.toHaveProperty('data-dragging');
    });

    it('commits once on release, not on every move', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      const w = mountRange({ defaultValue: 10, onChange, onCommit });
      layoutRange(w);

      await drag(w, 20, [60, 100, 140]);

      expect(onChange.mock.calls.length).toBeGreaterThan(1);
      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit.mock.calls[0][1].reason).toBe('drag');
    });

    it('moves the thumb nearest the press', async () => {
      const w = mountRange({ defaultValue: [20, 70] });
      layoutRange(w);

      // 160px of 200 is 80 — closer to the upper thumb at 70 than the lower at 20.
      await drag(w, 160);
      expect(values(w)).toEqual([20, 80]);
    });

    it('grabbing a thumb does not move it', async () => {
      const w = mountRange({ defaultValue: 40 });
      layoutRange(w);

      // Press the thumb itself, off its center: the value must not jump to the
      // press position, and must not jump by the grab offset either.
      const thumb = w.find('[data-part="thumb"]').element;
      thumb.dispatchEvent(pointer('pointerdown', 85));
      await nextTick();
      expect(values(w)).toEqual([40]);

      document.dispatchEvent(pointer('pointerup', 85, { buttons: 0 }));
      await nextTick();
    });

    it('still finds a thumb that was unmounted and brought back', async () => {
      const Host = defineComponent({
        setup: () => ({ shown: ref(true) }),
        render() {
          return h(RangeRoot as any, { defaultValue: 10 }, {
            default: () =>
              h(RangeControl as any, null, {
                default: () =>
                  h(RangeTrack as any, null, {
                    default: () => (this.shown ? [h(RangeIndicator as any), h(RangeThumb as any)] : []),
                  }),
              }),
          });
        },
      });

      const w = mount(Host, { attachTo: document.body });
      w.vm.shown = false;
      await nextTick();
      w.vm.shown = true;
      await nextTick();

      layoutRange(w as any);
      await drag(w as any, 150);

      expect(values(w as any)).toEqual([75]);
    });

    it('keeps both thumbs reachable when their indices swap', async () => {
      const Host = defineComponent({
        setup: () => ({ swapped: ref(false) }),
        render() {
          const [a, b] = this.swapped ? [1, 0] : [0, 1];
          return h(RangeRoot as any, { defaultValue: [20, 70] }, {
            default: () =>
              h(RangeControl as any, null, {
                default: () =>
                  h(RangeTrack as any, null, {
                    default: () => [
                      h(RangeIndicator as any),
                      h(RangeThumb as any, { key: 'a', index: a }),
                      h(RangeThumb as any, { key: 'b', index: b }),
                    ],
                  }),
              }),
          });
        },
      });

      const w = mount(Host, { attachTo: document.body });
      w.vm.swapped = true;
      await nextTick();
      layoutRange(w as any);

      // One thumb claims the index the other is releasing. If the release wins,
      // that slot ends up empty and the press can no longer find the thumb.
      await drag(w as any, 160);

      // Read by index rather than document order: the thumbs render in their
      // original order while controlling swapped values.
      const byIndex = w
        .findAll('[data-part="thumb"]')
        .map((thumb) => ({
          index: Number(thumb.attributes('data-index')),
          value: Number((thumb.find('input').element as HTMLInputElement).value),
        }))
        .sort((a, b) => a.index - b.index)
        .map((entry) => entry.value);

      expect(byIndex).toEqual([20, 80]);
    });

    it('commits nothing when a thumb is grabbed and let go where it was', async () => {
      const onCommit = vi.fn();
      const w = mountRange({ defaultValue: 40, onCommit });
      layoutRange(w);

      const thumb = w.find('[data-part="thumb"]').element;
      thumb.dispatchEvent(pointer('pointerdown', 80));
      await nextTick();
      document.dispatchEvent(pointer('pointerup', 80, { buttons: 0 }));
      await nextTick();

      expect(onCommit).not.toHaveBeenCalled();
    });

    it('raises the thumb in use above the others, then the one used last', async () => {
      const w = mountRange({ defaultValue: [50, 50] });
      const [lower, upper] = w.findAll('[data-part="thumb"]');

      await inputs(w)[0].trigger('focus');
      expect(lower!.attributes('style')).toContain('z-index: 2');
      expect(upper!.attributes('style')).not.toContain('z-index');

      await inputs(w)[0].trigger('blur');
      expect(lower!.attributes('style')).toContain('z-index: 1');
    });

    it('ignores a press from a button other than the primary one', async () => {
      const w = mountRange({ defaultValue: 10 });
      layoutRange(w);

      control(w).element.dispatchEvent(pointer('pointerdown', 150, { button: 2, buttons: 2 }));
      await nextTick();
      expect(values(w)).toEqual([10]);
    });

    it('ends the drag when the release was missed', async () => {
      const onCommit = vi.fn();
      const w = mountRange({ defaultValue: 10, onCommit });
      layoutRange(w);

      // Pressed at 40px of 200, so the value actually moves and there is
      // something to commit.
      control(w).element.dispatchEvent(pointer('pointerdown', 40));
      await nextTick();
      // A pointermove with no buttons held means the pointerup went elsewhere.
      document.dispatchEvent(pointer('pointermove', 100, { buttons: 0 }));
      await nextTick();

      expect(values(w)).toEqual([20]);
      expect(w.attributes()).not.toHaveProperty('data-dragging');
      expect(onCommit).toHaveBeenCalledTimes(1);
    });
  });

  describe('pointer geometry', () => {
    it('takes the thumb that can move towards the press when thumbs share a spot', async () => {
      const w = mountRange({ defaultValue: [50, 50] });
      layoutRange(w);

      await drag(w, 160);
      expect(values(w)).toEqual([50, 80]);

      await drag(w, 40);
      expect(values(w)).toEqual([20, 80]);
    });

    it('keeps the grab offset while dragging a thumb', async () => {
      const w = mountRange({ defaultValue: 40 });
      layoutRange(w);

      // Grabbed 5px right of its center (80px); 20px further on is 100px for the center: 50.
      const thumb = w.find('[data-part="thumb"]').element;
      thumb.dispatchEvent(pointer('pointerdown', 85));
      await nextTick();
      document.dispatchEvent(pointer('pointermove', 105));
      await nextTick();
      document.dispatchEvent(pointer('pointerup', 105, { buttons: 0 }));
      await nextTick();

      expect(values(w)).toEqual([50]);
    });

    it('reads the axis from the right in a right-to-left control', async () => {
      const w = mountRange({ defaultValue: 10 });
      layoutRange(w);
      (control(w).element as HTMLElement).style.direction = 'rtl';

      await drag(w, 150);
      expect(values(w)).toEqual([25]);
    });

    it('moves the way a horizontal arrow points in a right-to-left control', async () => {
      const w = mountRange({ defaultValue: 40 });
      (control(w).element as HTMLElement).style.direction = 'rtl';

      await firstInput(w).trigger('keydown', { key: 'ArrowRight' });
      expect(values(w)).toEqual([39]);
      await firstInput(w).trigger('keydown', { key: 'ArrowUp' });
      expect(values(w)).toEqual([40]);
    });

    it('measures travel inside the control’s padding', async () => {
      const w = mountRange({ defaultValue: 10 });
      layoutRange(w);
      (control(w).element as HTMLElement).style.paddingLeft = '40px';

      // 40px of padding on the left leaves 160px of travel; 120px is its middle.
      await drag(w, 120);
      expect(values(w)).toEqual([50]);
    });

    it('stops an edge-aligned thumb’s travel half a thumb short of each end', async () => {
      const w = mountRange({ defaultValue: 50, thumbAlignment: 'edge' });
      layoutRange(w);

      await drag(w, 10);
      expect(values(w)).toEqual([0]);
      await drag(w, 190);
      expect(values(w)).toEqual([100]);
    });

    it('hands the drag, and focus, to the thumb it swaps with', async () => {
      const w = mountRange({ defaultValue: [20, 40], thumbCollisionBehavior: 'swap' });
      layoutRange(w);

      await drag(w, 40, [180]);
      expect(values(w)).toEqual([40, 90]);
      expect(document.activeElement).toBe(inputs(w)[1].element);
    });
  });

  describe('thumb collisions', () => {
    it('pushes the neighbor along by default', async () => {
      const w = mountRange({ defaultValue: [20, 40] });
      layoutRange(w);

      // Drag the lower thumb past the upper one.
      await drag(w, 40, [180]);
      expect(values(w)).toEqual([90, 90]);
    });

    it('stops at the neighbor when collisions are refused', async () => {
      const w = mountRange({ defaultValue: [20, 40], thumbCollisionBehavior: 'none' });
      layoutRange(w);

      await drag(w, 40, [180]);
      expect(values(w)).toEqual([40, 40]);
    });
  });

  describe('controlled value', () => {
    it('follows the prop and does not move on its own', async () => {
      const w = mountRange({ modelValue: 30 });
      await firstInput(w).trigger('keydown', { key: 'ArrowRight' });
      expect(values(w)).toEqual([30]);
    });

    it('emits the new value for the parent to apply', async () => {
      const w = mountRange({ modelValue: 30 });
      await firstInput(w).trigger('keydown', { key: 'ArrowRight' });
      expect(w.emitted('update:modelValue')?.[0]).toEqual([31]);
    });

    it('moves when the prop moves', async () => {
      const Host = defineComponent({
        setup() {
          const value = ref(30);
          return { value };
        },
        render() {
          return h(RangeRoot as any, { modelValue: this.value }, {
            default: () => h(RangeControl as any, null, { default: () => h(RangeThumb as any) }),
          });
        },
      });

      const w = mount(Host, { attachTo: document.body });
      expect((w.find('input').element as HTMLInputElement).value).toBe('30');
      w.vm.value = 80;
      await nextTick();
      expect((w.find('input').element as HTMLInputElement).value).toBe('80');
    });
  });

  describe('change reasons', () => {
    it('reports a keyboard step', async () => {
      const onChange = vi.fn();
      const w = mountRange({ defaultValue: 40, onChange });
      await firstInput(w).trigger('keydown', { key: 'ArrowRight' });
      expect(onChange.mock.calls[0][1]).toMatchObject({ reason: 'keyboard', activeThumbIndex: 0 });
    });

    it('reports a change dispatched into the input', async () => {
      const onChange = vi.fn();
      const w = mountRange({ defaultValue: 40, onChange });

      const input = firstInput(w).element as HTMLInputElement;
      input.value = '65';
      await firstInput(w).trigger('change');

      expect(values(w)).toEqual([65]);
      expect(onChange.mock.calls[0][1].reason).toBe('input-change');
    });

    it('says nothing when the value did not move', async () => {
      const onChange = vi.fn();
      const w = mountRange({ defaultValue: 100, onChange });
      await firstInput(w).trigger('keydown', { key: 'End' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('disables every input', () => {
      const w = mountRange({ defaultValue: [20, 70], disabled: true });
      expect(inputs(w).every((i) => (i.element as HTMLInputElement).disabled)).toBe(true);
      expect(w.attributes()).toHaveProperty('data-disabled');
    });

    it('ignores the keyboard', async () => {
      const w = mountRange({ defaultValue: 40, disabled: true });
      await firstInput(w).trigger('keydown', { key: 'ArrowRight' });
      expect(values(w)).toEqual([40]);
    });

    it('ignores a press', async () => {
      const w = mountRange({ defaultValue: 10, disabled: true });
      layoutRange(w);
      await drag(w, 150);
      expect(values(w)).toEqual([10]);
    });

    it('can disable a single thumb of a range', async () => {
      const w = mountRange({ defaultValue: [20, 70] }, [{ disabled: true }]);
      const [lower, upper] = inputs(w);
      expect((lower.element as HTMLInputElement).disabled).toBe(true);
      expect((upper.element as HTMLInputElement).disabled).toBe(false);

      await lower.trigger('keydown', { key: 'ArrowRight' });
      expect(values(w)).toEqual([20, 70]);
    });
  });

  describe('accessibility', () => {
    it('describes each thumb on its input', () => {
      const w = mountRange({ defaultValue: 40 });
      const input = firstInput(w);
      expect(input.attributes('aria-valuenow')).toBe('40');
      expect(input.attributes('aria-orientation')).toBe('horizontal');
    });

    it('names the two ends of a range', () => {
      const w = mountRange({ defaultValue: [20, 70] });
      expect(inputs(w)[0].attributes('aria-valuetext')).toBe('20 start range');
      expect(inputs(w)[1].attributes('aria-valuetext')).toBe('70 end range');
    });

    it('formats what is announced', () => {
      const w = mountRange({
        defaultValue: 40,
        format: { style: 'currency', currency: 'USD' },
      });
      expect(firstInput(w).attributes('aria-valuetext')).toBe('$40.00');
    });

    it('takes a label per thumb', () => {
      const w = mountRange({ defaultValue: [20, 70] }, [{ ariaLabel: 'Minimum' }, { ariaLabel: 'Maximum' }]);
      expect(inputs(w)[0].attributes('aria-label')).toBe('Minimum');
      expect(inputs(w)[1].attributes('aria-label')).toBe('Maximum');
    });

    it('points the group and its thumbs at a label', async () => {
      const w = mount(RangeRoot as any, {
        props: { defaultValue: 40 },
        slots: {
          default: () => [
            h(RangeLabel as any, null, { default: () => 'Volume' }),
            h(RangeControl as any, null, { default: () => h(RangeThumb as any) }),
          ],
        },
        attachTo: document.body,
      });

      // The label names itself to the root as it mounts, so the reference
      // lands a tick after the first render.
      await nextTick();

      const labelId = w.find('[data-part="label"]').attributes('id');
      expect(labelId).toBeTruthy();
      expect(w.attributes('aria-labelledby')).toBe(labelId);
      expect(w.find('input').attributes('aria-labelledby')).toBe(labelId);
    });

    it('marks the active thumb while it holds focus', async () => {
      const w = mountRange({ defaultValue: 40 });
      await firstInput(w).trigger('focus');
      expect(w.find('[data-part="thumb"]').attributes()).toHaveProperty('data-focused');

      await firstInput(w).trigger('blur');
      expect(w.find('[data-part="thumb"]').attributes()).not.toHaveProperty('data-focused');
    });
  });

  describe('value part', () => {
    it('shows the formatted values', () => {
      const w = mountRange({ defaultValue: [20, 70] });
      expect(w.find('[data-part="value"]').text()).toBe('20 – 70');
    });

    it('points at every thumb input', async () => {
      const w = mountRange({ defaultValue: [20, 70] });
      // Thumbs register their ids as they mount, one tick behind the output.
      await nextTick();

      const ids = inputs(w).map((i) => i.attributes('id'));
      expect(w.find('[data-part="value"]').attributes('for')).toBe(ids.join(' '));
    });

    it('keeps the group\'s own id off the thumb input', () => {
      // Both would otherwise answer to the same id, and `getElementById` would
      // reach whichever came first.
      const w = mountRange({ defaultValue: 40, id: 'volume' });
      expect(w.attributes('id')).toBe('volume');
      expect(firstInput(w).attributes('id')).not.toBe('volume');
    });

    it('stays quiet unless asked to announce', () => {
      const w = mountRange({ defaultValue: 40 });
      expect(w.find('[data-part="value"]').attributes('aria-live')).toBe('off');
    });
  });

  describe('forms', () => {
    it('submits each thumb under the same name', () => {
      const w = mountRange({ defaultValue: [20, 70], name: 'price' });
      expect(inputs(w).every((i) => i.attributes('name') === 'price')).toBe(true);
    });
  });

  describe('inside a field', () => {
    function mountInField(fieldProps: Record<string, any> = {}) {
      return mount(FieldRoot as any, {
        props: fieldProps,
        slots: {
          default: () => [
            h(FieldLabel as any, null, { default: () => 'Budget' }),
            h(RangeRoot as any, { defaultValue: 40 }, {
              default: () => h(RangeControl as any, null, { default: () => h(RangeThumb as any) }),
            }),
          ],
        },
        attachTo: document.body,
      });
    }

    it('takes the field label as the control it points at', () => {
      const w = mountInField();
      expect(w.find('label').attributes('for')).toBe(w.find('input').attributes('id'));
    });

    it('inherits the field\'s disabled state', () => {
      const w = mountInField({ disabled: true });
      expect((w.find('input').element as HTMLInputElement).disabled).toBe(true);
    });

    it('marks the field touched when a thumb is left', async () => {
      const w = mountInField();
      await w.find('input').trigger('focus');
      expect(w.find('[data-focused]').exists()).toBe(true);

      await w.find('input').trigger('blur');
      expect(w.attributes()).toHaveProperty('data-touched');
    });
  });

  describe('value math', () => {
    const scale = (overrides: Partial<Scale> = {}): Scale => ({ min: 0, max: 100, step: 1, gap: 0, ...overrides });

    it('snaps to the step, counting from min', () => {
      expect(snap(3.7, scale())).toBe(4);
      expect(snap(3.7, scale({ step: 0.5 }))).toBe(3.5);
      // Counting from min, not from zero.
      expect(snap(3, scale({ min: 1, step: 2 }))).toBe(3);
    });

    it('keeps decimal steps free of float noise', () => {
      expect(snap(0.30000000000000004, scale({ step: 0.1 }))).toBe(0.3);
      expect(snap(0.7000000000000001, scale({ step: 1e-7 }))).toBe(0.7);
    });

    it('gives each thumb the room between its neighbors, less the gap', () => {
      expect(roomFor([10, 50, 90], 1, scale({ gap: 5 }))).toEqual([15, 85]);
      expect(roomFor([10, 90], 0, scale({ gap: 5 }))).toEqual([0, 85]);
    });

    it('pushes the thumbs in the way', () => {
      expect(dragTo([10, 20, 30], 0, 25, scale(), 'push').values).toEqual([25, 25, 30]);
    });

    it('keeps the gap while pushing', () => {
      expect(dragTo([10, 20, 30], 0, 25, scale({ gap: 5 }), 'push').values).toEqual([25, 30, 35]);
    });

    it('returns pushed thumbs towards where the drag began', () => {
      const pushed = dragTo([10, 20], 0, 50, scale(), 'push').values;
      expect(pushed).toEqual([50, 50]);

      // Dragging back leaves the pushed thumb where it started, not stranded.
      expect(dragTo(pushed, 0, 5, scale(), 'push', [10, 20]).values).toEqual([5, 20]);
    });

    it('never pushes a thumb off the end', () => {
      expect(dragTo([10, 20, 30], 0, 100, scale({ gap: 10 }), 'push').values).toEqual([80, 90, 100]);
    });

    it('hands the drag to the thumb it swaps with', () => {
      const result = dragTo([20, 40], 0, 60, scale(), 'swap');
      expect(result.index).toBe(1);
      expect(result.values).toEqual([40, 60]);
    });

    it('does not swap on merely meeting the neighbor, in either direction', () => {
      expect(dragTo([20, 40], 0, 40, scale(), 'swap')).toEqual({ values: [40, 40], index: 0 });
      expect(dragTo([20, 40], 1, 20, scale(), 'swap')).toEqual({ values: [20, 20], index: 1 });
    });

    it('holds the swapped thumb a gap clear of its new neighbors', () => {
      const result = dragTo([20, 40], 0, 45, scale({ gap: 10 }), 'swap');
      expect(result.index).toBe(1);
      expect(result.values).toEqual([40, 50]);
    });

    it('refuses to cross when collisions are off', () => {
      const result = dragTo([20, 40], 0, 60, scale(), 'none');
      expect(result.index).toBe(0);
      expect(result.values).toEqual([40, 40]);
    });
  });
});
