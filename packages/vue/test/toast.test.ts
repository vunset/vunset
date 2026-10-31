import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createApp, defineComponent, h, nextTick } from 'vue';
import {
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastProgress,
  useToast,
  createToastStore,
  defaultToastStore,
  provideToastStore,
  type ToastStore,
} from '../src';

/**
 * Animations resolve off `requestAnimationFrame`, and the enter phase needs two
 * of them. Timers are faked but rAF is left real, so both can be driven.
 */
async function flush(frames = 4) {
  for (let i = 0; i < frames; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await nextTick();
  }
}

function useFakeClock() {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
}

afterEach(() => {
  vi.useRealTimers();
});

/** The template a consuming app registers once, in its root component. */
function mountToaster(props: Record<string, any> = {}, rootProps: Record<string, any> | null = null) {
  return mount(
    defineComponent({
      render() {
        return h(ToastViewport as any, props, {
          default: () =>
            h(ToastRoot as any, rootProps, {
              default: () => [
                h(ToastTitle as any),
                h(ToastDescription as any),
                h(ToastClose as any, null, { default: () => '×' }),
                h(ToastProgress as any),
              ],
            }),
        });
      },
    }),
    { attachTo: document.body },
  );
}

const roots = (w: VueWrapper<any>) => w.findAll('[data-part="root"]');
const titles = (w: VueWrapper<any>) => w.findAll('[data-part="title"]');
const viewport = (w: VueWrapper<any>) => w.find('[data-part="viewport"]');
const styleOf = (el: { attributes: (n: string) => string | undefined }) => el.attributes('style') ?? '';

describe('Toast', () => {
  describe('the registered template', () => {
    it('renders a toast created by a plain function call', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      expect(roots(w)).toHaveLength(0);

      useToast(store).setToast({ title: 'Saved', text: 'Your changes are in.' });
      await nextTick();

      expect(roots(w)).toHaveLength(1);
      expect(w.find('[data-part="title"]').text()).toBe('Saved');
      expect(w.find('[data-part="description"]').text()).toBe('Your changes are in.');
    });

    it('lets the parts find their own toast, so the template is written once', async () => {
      // The viewport provides each toast per item; the parts inject it. Without
      // that, a template registered once could not know which toast it is.
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'First' });
      useToast(store).setToast({ title: 'Second' });
      await nextTick();

      expect(titles(w).map((t) => t.text())).toEqual(['Second', 'First']);
    });

    it('publishes the type for the template to branch on', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Gone wrong', type: 'error' });
      await nextTick();

      expect(w.find('[data-part="root"]').attributes('data-type')).toBe('error');
    });

    it('works through the shared store with no wiring', async () => {
      const w = mountToaster();
      try {
        useToast().setToast({ title: 'Global' });
        await nextTick();
        expect(w.find('[data-part="title"]').text()).toBe('Global');
      } finally {
        // The default store outlives the test, so it is emptied by hand.
        defaultToastStore.toasts.value = [];
      }
    });
  });

  describe('a toast with its own renderer', () => {
    it('replaces the registered template for that toast alone', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Ordinary' });
      useToast(store).setToast({
        title: 'Custom',
        slot: () => h(ToastRoot as any, { class: 'bespoke' }, { default: () => 'hand-rolled' }),
      });
      await nextTick();

      expect(w.find('.bespoke').text()).toBe('hand-rolled');
      // The ordinary one still went through the registered template.
      expect(titles(w).map((t) => t.text())).toEqual(['Ordinary']);
    });

    it('still takes part in the stack', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({
        slot: () => h(ToastRoot as any, { class: 'bespoke' }, { default: () => 'x' }),
      });
      await nextTick();

      expect(w.find('.bespoke').attributes('data-part')).toBe('root');
      expect(styleOf(w.find('.bespoke'))).toContain('--toast-index: 0');
    });
  });

  describe('stacking', () => {
    it('puts the newest toast at the front', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Older' });
      useToast(store).setToast({ title: 'Newer' });
      await nextTick();

      const [first, second] = roots(w);
      expect(first.attributes('data-index')).toBe('0');
      expect(first.attributes()).toHaveProperty('data-front');
      expect(second.attributes('data-index')).toBe('1');
      expect(second.attributes()).not.toHaveProperty('data-front');
    });

    it('offsets each toast by the heights of the ones in front of it', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'One' });
      useToast(store).setToast({ title: 'Two' });
      useToast(store).setToast({ title: 'Three' });
      await flush(2);

      // Every element measures the same height in this environment, so the
      // offsets are a running total of it.
      const offsets = roots(w).map((r) => styleOf(r).match(/--toast-offset-y: (\d+)px/)?.[1]);
      const height = Number(styleOf(roots(w)[0]).match(/--toast-height: (\d+)px/)?.[1]);

      expect(height).toBeGreaterThan(0);
      expect(offsets).toEqual(['0', String(height), String(height * 2)]);
    });

    it('accumulates real heights when the toasts differ in size', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'One' });
      useToast(store).setToast({ title: 'Two' });
      useToast(store).setToast({ title: 'Three' });
      await flush(2);

      // Every element reports the same height here, so the measured value is
      // replaced with the differing ones a real browser would report.
      const [front, middle, back] = store.toasts.value;
      store.setHeight(front.id, 100);
      store.setHeight(middle.id, 40);
      await nextTick();

      const offsets = roots(w).map((r) => styleOf(r).match(/--toast-offset-y: (\d+)px/)?.[1]);
      expect(offsets).toEqual(['0', '100', '140']);
      expect(styleOf(roots(w)[0])).toContain('--toast-height: 100px');
      expect(back.height).toBeGreaterThan(0);
    });

    it('paints the newest toast above the ones behind it', async () => {
      // The DOM order is newest first, so paint order has to be reversed or
      // the toast in front ends up underneath the older ones.
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Oldest' });
      useToast(store).setToast({ title: 'Middle' });
      useToast(store).setToast({ title: 'Newest' });
      await flush(2);

      const layers = roots(w).map((r) => Number(styleOf(r).match(/z-index: (-?\d+)/)?.[1]));
      expect(layers[0]).toBeGreaterThan(layers[1]);
      expect(layers[1]).toBeGreaterThan(layers[2]);
    });

    it('drops a dismissed toast below the ones that remain', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Older' });
      useToast(store).setToast({ title: 'Newer' });
      await flush(2);

      store.close(store.toasts.value[0].id);
      await nextTick();

      const [leaving, survivor] = roots(w).map((r) =>
        Number(styleOf(r).match(/z-index: (-?\d+)/)?.[1]),
      );
      expect(leaving).toBeLessThan(survivor);
    });

    it('renumbers the stack as soon as one is dismissed, not when it is gone', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Older' });
      useToast(store).setToast({ title: 'Newer' });
      await flush(2);

      store.close(store.toasts.value[0].id);
      await nextTick();

      // Both are still in the DOM while the front one animates out, but the
      // survivor has already taken its place at the front.
      expect(roots(w)).toHaveLength(2);
      const leaving = roots(w)[0];
      const survivor = roots(w)[1];
      expect(leaving.attributes()).toHaveProperty('data-leave-to');
      expect(leaving.attributes('data-index')).toBe('-1');
      expect(survivor.attributes('data-index')).toBe('0');
      expect(survivor.attributes()).toHaveProperty('data-front');

      // Giving up its place means it is no longer the front toast either, so a
      // stylesheet that clamps the pile to the front toast's height has to let
      // a leaving one out of the clamp — `[data-leave-to]` is the hook.
      expect(leaving.attributes()).not.toHaveProperty('data-front');
    });

    it('closes the gap as soon as one is dismissed, not when it is gone', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Back' });
      useToast(store).setToast({ title: 'Middle' });
      useToast(store).setToast({ title: 'Front' });
      await flush(2);
      const [front, middle] = store.toasts.value;
      store.setHeight(front.id, 50);
      store.setHeight(middle.id, 40);
      await nextTick();

      store.close(middle.id);
      await nextTick();

      const offsets = roots(w).map((r) => styleOf(r).match(/--toast-offset-y: (\d+)px/)?.[1]);
      // The middle one fades where it stood; the back one moves up at once.
      expect(offsets).toEqual(['0', '50', '50']);
    });

    it('publishes the front toast\'s height for the pile to clamp against', async () => {
      // A collapsed stack hides the toasts behind the front one. Each toast
      // knows its own height; only the viewport knows the front one's, so a
      // tall toast underneath a short one has nothing to clamp to without this.
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Short' });
      await flush(2);

      const front = store.toasts.value[0];
      store.setHeight(front.id, 44);
      await nextTick();
      expect(styleOf(viewport(w))).toContain('--toast-front-height: 44px');

      // A taller toast arriving in front takes over the clamp.
      useToast(store).setToast({ title: 'Tall' });
      await flush(2);
      store.setHeight(store.toasts.value[0].id, 180);
      await nextTick();

      expect(styleOf(viewport(w))).toContain('--toast-front-height: 180px');
    });

    it('ignores a leaving toast when reporting the front height', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Older' });
      useToast(store).setToast({ title: 'Newer' });
      await flush(2);

      store.setHeight(store.toasts.value[0].id, 180);
      store.setHeight(store.toasts.value[1].id, 44);
      await nextTick();
      expect(styleOf(viewport(w))).toContain('--toast-front-height: 180px');

      // Dismissing the front one hands the clamp to whatever is now in front.
      store.close(store.toasts.value[0].id);
      await nextTick();

      expect(styleOf(viewport(w))).toContain('--toast-front-height: 44px');
    });

    it('holds back the toasts beyond the limit', async () => {
      const store = createToastStore();
      const w = mountToaster({ store, limit: 2 });

      useToast(store).setToast({ title: 'One' });
      useToast(store).setToast({ title: 'Two' });
      useToast(store).setToast({ title: 'Three' });
      await nextTick();

      const limited = roots(w).map((r) => 'data-limited' in r.attributes());
      expect(limited).toEqual([false, false, true]);
    });
  });

  describe('placement', () => {
    it.each([
      ['bottom-end', 'bottom', 'end'],
      ['top-start', 'top', 'start'],
      ['top-center', 'top', 'center'],
      ['bottom-start', 'bottom', 'start'],
      ['top-end', 'top', 'end'],
    ])('publishes %s as a side and an alignment', async (position, side, align) => {
      const store = createToastStore();
      const w = mountToaster({ store, position });
      await nextTick();

      const el = viewport(w);
      expect(el.attributes('data-position')).toBe(position);
      expect(el.attributes('data-side')).toBe(side);
      expect(el.attributes('data-align')).toBe(align);
    });

    it('defaults to the bottom end', async () => {
      const w = mountToaster({ store: createToastStore() });
      expect(viewport(w).attributes('data-position')).toBe('bottom-end');
      expect(viewport(w).attributes('data-side')).toBe('bottom');
      expect(viewport(w).attributes('data-align')).toBe('end');
    });
  });

  describe('timers', () => {
    it('dismisses itself once the timeout elapses', async () => {
      useFakeClock();
      const store = createToastStore();
      const w = mountToaster({ store, timeout: 1000 });

      useToast(store).setToast({ title: 'Briefly' });
      await flush(2);
      expect(roots(w)).toHaveLength(1);

      vi.advanceTimersByTime(1000);
      await flush();

      expect(roots(w)).toHaveLength(0);
    });

    it('stays up when manualClose is set', async () => {
      useFakeClock();
      const store = createToastStore();
      const w = mountToaster({ store, timeout: 1000 });

      useToast(store).setToast({ title: 'Sticky', manualClose: true });
      await flush(2);

      vi.advanceTimersByTime(10_000);
      await flush();

      expect(roots(w)).toHaveLength(1);
    });

    it('takes a timeout per toast', async () => {
      useFakeClock();
      const store = createToastStore();
      const w = mountToaster({ store, timeout: 5000 });

      useToast(store).setToast({ title: 'Quick', timeout: 500 });
      await flush(2);

      vi.advanceTimersByTime(600);
      await flush();

      expect(roots(w)).toHaveLength(0);
    });

    it('pauses while the stack is hovered and banks the time already served', async () => {
      useFakeClock();
      const store = createToastStore();
      const w = mountToaster({ store, timeout: 1000 });

      useToast(store).setToast({ title: 'Read me' });
      await flush(2);

      vi.advanceTimersByTime(800);
      await viewport(w).trigger('pointerenter');

      // Well past the original deadline, but the clock is held.
      vi.advanceTimersByTime(5000);
      await flush();
      expect(roots(w)).toHaveLength(1);

      await viewport(w).trigger('pointerleave');
      // Only the 200ms that were left should remain, not a fresh second.
      vi.advanceTimersByTime(250);
      await flush();
      expect(roots(w)).toHaveLength(0);
    });

    it('pauses while a toast holds focus', async () => {
      useFakeClock();
      const store = createToastStore();
      const w = mountToaster({ store, timeout: 1000 });

      useToast(store).setToast({ title: 'Focused' });
      await flush(2);

      await viewport(w).trigger('focusin');
      vi.advanceTimersByTime(5000);
      await flush();

      expect(roots(w)).toHaveLength(1);
    });

    it('reports the stack as expanded while it is held', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'One' });
      await nextTick();
      expect(viewport(w).attributes()).not.toHaveProperty('data-expanded');

      await viewport(w).trigger('pointerenter');
      expect(viewport(w).attributes()).toHaveProperty('data-expanded');
      expect(roots(w)[0].attributes()).toHaveProperty('data-expanded');
    });

    it('does not leave the next toast paused after the stack empties', async () => {
      useFakeClock();
      const store = createToastStore();
      const w = mountToaster({ store, timeout: 1000 });

      useToast(store).setToast({ title: 'First' });
      await flush(2);
      await viewport(w).trigger('pointerenter');

      // The pointer never leaves, because the toast under it goes away.
      store.close(store.toasts.value[0].id);
      await flush();
      expect(roots(w)).toHaveLength(0);

      useToast(store).setToast({ title: 'Second' });
      await flush(2);
      vi.advanceTimersByTime(1100);
      await flush();

      expect(roots(w)).toHaveLength(0);
    });
  });

  describe('progress', () => {
    const bars = (w: VueWrapper<any>) => w.findAll('[data-part="progress"]');

    it('runs for the toast’s own timeout, hidden from a screen reader', async () => {
      const store = createToastStore();
      const w = mountToaster({ store, timeout: 1000 });

      useToast(store).setToast({ title: 'Default' });
      useToast(store).setToast({ title: 'Own', timeout: 300 });
      await nextTick();

      expect(bars(w).map((bar) => styleOf(bar))).toEqual(['--toast-duration: 300ms;', '--toast-duration: 1000ms;']);
      expect(bars(w)[0]!.attributes('aria-hidden')).toBe('true');
    });

    it('draws nothing for a toast that never times out', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Sticky', manualClose: true });
      useToast(store).setToast({ title: 'Working', type: 'loading' });
      await nextTick();

      expect(roots(w)).toHaveLength(2);
      expect(bars(w)).toHaveLength(0);
    });

    it('is paused while the stack is held, and once the toast leaves', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      const id = useToast(store).setToast({ title: 'One' });
      await nextTick();
      expect(bars(w)[0]!.attributes()).not.toHaveProperty('data-paused');

      await viewport(w).trigger('pointerenter');
      expect(bars(w)[0]!.attributes()).toHaveProperty('data-paused');

      await viewport(w).trigger('pointerleave');
      store.close(id);
      await nextTick();
      expect(bars(w)[0]!.attributes()).toHaveProperty('data-paused');
    });

    it('does not hold the toast once paused by its leaving', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'One' });
      await flush(2);

      const paused = {
        playState: 'paused',
        finished: new Promise(() => {}),
        effect: { getComputedTiming: () => ({ iterations: 1 }) },
      } as unknown as Animation;
      roots(w)[0]!.element.getAnimations = () => [paused];

      store.close(store.toasts.value[0].id);
      await flush();
      expect(roots(w)).toHaveLength(0);
    });

    it('starts over when the toast is updated or raised again', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      const id = useToast(store).setToast({ title: 'Saving', type: 'loading' });
      await nextTick();
      expect(bars(w)).toHaveLength(0);

      useToast(store).updateToast(id, { title: 'Saved', type: 'success' });
      await nextTick();
      const first = bars(w)[0]!.element;

      useToast(store).setToast({ id, title: 'Saved again' });
      await nextTick();
      expect(bars(w)[0]!.element).not.toBe(first);
    });
  });

  describe('dismissing', () => {
    it('closes when the close part is pressed', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Closable' });
      await flush(2);

      await w.find('[data-part="close"]').trigger('click');
      await flush();

      expect(roots(w)).toHaveLength(0);
    });

    it('marks the toast as leaving before it goes', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Leaving' });
      await flush(2);

      store.close(store.toasts.value[0].id);
      await nextTick();

      // Still in the DOM, carrying the hook its exit animation runs from.
      expect(roots(w)[0].attributes()).toHaveProperty('data-leave-to');
    });

    it('runs onClose', async () => {
      const onClose = vi.fn();
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Watched', onClose });
      await flush(2);

      await w.find('[data-part="close"]').trigger('click');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    describe('an action', () => {
      function mountWithAction(onClick: (event: any) => void) {
        return mount(
          defineComponent({
            render: () =>
              h(ToastViewport as any, { store: actionStore }, () =>
                h(ToastRoot as any, null, () => [
                  h(ToastTitle as any),
                  h(ToastAction as any, { onClick }, () => 'Undo'),
                ]),
              ),
          }),
          { attachTo: document.body },
        );
      }
      let actionStore = createToastStore();

      it('is named by its text, not "Close"', async () => {
        actionStore = createToastStore();
        const w = mountWithAction(() => {});
        useToast(actionStore).setToast({ title: 'Archived' });
        await flush(2);

        const action = w.find('[data-part="action"]');
        expect(action.text()).toBe('Undo');
        expect(action.attributes('aria-label')).toBeUndefined();
      });

      it('runs its own handler, then closes', async () => {
        actionStore = createToastStore();
        const calls: string[] = [];
        const w = mountWithAction(() => calls.push('undo'));
        useToast(actionStore).setToast({ title: 'Archived', onClose: () => calls.push('close') });
        await flush(2);

        await w.find('[data-part="action"]').trigger('click');
        await flush();

        expect(calls).toEqual(['undo', 'close']);
        expect(roots(w)).toHaveLength(0);
      });

      it('stays up when the handler prevents the internal one', async () => {
        actionStore = createToastStore();
        const w = mountWithAction((event) => event.preventInternalHandler());
        useToast(actionStore).setToast({ title: 'Archived' });
        await flush(2);

        await w.find('[data-part="action"]').trigger('click');
        await flush();

        expect(roots(w)).toHaveLength(1);
      });
    });

    it('clears everything at once', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'One' });
      useToast(store).setToast({ title: 'Two' });
      await flush(2);

      useToast(store).clearToasts();
      await flush();

      expect(roots(w)).toHaveLength(0);
    });
  });

  describe('loading, then updated', () => {
    const descriptions = (w: VueWrapper<any>) => w.findAll('[data-part="description"]');

    it('never times out while loading', async () => {
      useFakeClock();
      const store = createToastStore();
      const w = mountToaster({ store, timeout: 1000 });

      useToast(store).setToast({ text: 'Saving…', type: 'loading' });
      await flush(2);
      vi.advanceTimersByTime(10_000);
      await flush();

      expect(roots(w)).toHaveLength(1);
      expect(roots(w)[0].attributes('data-type')).toBe('loading');
    });

    it('changes in place, keeping what it is not given, and times out from then', async () => {
      useFakeClock();
      const store = createToastStore();
      const w = mountToaster({ store, timeout: 1000 });
      const toast = useToast(store);

      const id = toast.setToast({ title: 'Upload', text: 'Saving…', type: 'loading' });
      await flush(2);
      const first = roots(w)[0].element;

      toast.updateToast(id, { text: 'Saved', type: 'success' });
      await flush(2);

      expect(roots(w)[0].element).toBe(first);
      expect(roots(w)[0].attributes('data-type')).toBe('success');
      expect(roots(w)[0].attributes('data-repeat-count')).toBeUndefined();
      expect(titles(w)[0].text()).toBe('Upload');
      expect(descriptions(w)[0].text()).toBe('Saved');

      vi.advanceTimersByTime(1000);
      await flush();
      expect(roots(w)).toHaveLength(0);
    });

    it('ignores an update once the toast is dismissed', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });
      const toast = useToast(store);

      const id = toast.setToast({ text: 'Saving…', type: 'loading' });
      await flush(2);
      await w.find('[data-part="close"]').trigger('click');
      toast.updateToast(id, { text: 'Saved', type: 'success' });
      await flush();

      expect(roots(w)).toHaveLength(0);
    });
  });

  describe('swipe to dismiss', () => {
    const pointer = (el: Element, type: string, x: number, y: number, timeStamp: number) =>
      el.dispatchEvent(
        new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, button: 0, bubbles: true, timeStamp } as PointerEventInit)
      );

    /**
     * Drags from the toast by `to` over `durationMs`. Deliberate by default:
     * back-to-back events would imply a speed no hand produces, so every
     * release would count as a flick.
     */
    async function swipe(
      w: VueWrapper<any>,
      to: { x?: number; y?: number },
      from: Element = roots(w)[0].element,
      durationMs = 400
    ) {
      const el = roots(w)[0].element;
      const [x, y] = [to.x ?? 0, to.y ?? 0];
      pointer(from, 'pointerdown', 100, 100, 0);
      pointer(el, 'pointermove', 100 + x / 2, 100 + y / 2, durationMs / 2);
      pointer(el, 'pointermove', 100 + x, 100 + y, durationMs);
      await nextTick();
      const during = { ...roots(w)[0].attributes() };
      pointer(el, 'pointerup', 100 + x, 100 + y, durationMs);
      await nextTick();
      return during;
    }

    const movementX = (style: string | undefined) =>
      Number(style?.match(/--toast-swipe-movement-x: (-?[\d.]+)px/)?.[1]);

    async function show(rootProps: Record<string, any> | null = null) {
      const store = createToastStore();
      const w = mountToaster({ store }, rootProps);
      useToast(store).setToast({ title: 'Swipe me' });
      await flush(2);
      return w;
    }

    it('closes past the threshold, in the direction it went', async () => {
      const w = await show();
      const during = await swipe(w, { x: 60 });

      expect(during).toHaveProperty('data-swiping');
      expect(during.style).toContain('--toast-swipe-movement-x: 60px');
      expect(roots(w)[0].attributes('data-swipe-direction')).toBe('right');
      expect(roots(w)[0].attributes()).toHaveProperty('data-leave-to');
      expect(roots(w)[0].attributes()).not.toHaveProperty('data-swiping');
    });

    it('springs back short of it', async () => {
      // The threshold is 40% of the toast along the swipe: 48px of its 120px width here.
      const w = await show();
      await swipe(w, { x: 30 });

      expect(roots(w)[0].attributes()).not.toHaveProperty('data-leave-to');
      expect(styleOf(roots(w)[0])).toContain('--toast-swipe-movement-x: 0px');
    });

    it('springs back when the pointer is canceled, however far it went', async () => {
      const w = await show();
      const el = roots(w)[0].element;
      pointer(el, 'pointerdown', 100, 100, 0);
      pointer(el, 'pointermove', 200, 100, 400);
      pointer(el, 'pointercancel', 200, 100, 400);
      await nextTick();

      expect(roots(w)[0].attributes()).not.toHaveProperty('data-leave-to');
      expect(styleOf(roots(w)[0])).toContain('--toast-swipe-movement-x: 0px');
    });

    it('closes on a flick that stops short of the threshold', async () => {
      const w = await show();
      await swipe(w, { x: 30 }, roots(w)[0].element, 50);

      expect(roots(w)[0].attributes('data-swipe-direction')).toBe('right');
      expect(roots(w)[0].attributes()).toHaveProperty('data-leave-to');
    });

    it('resists a direction it cannot leave by', async () => {
      const w = await show();
      const during = await swipe(w, { x: -64 });

      // It gives a little, then stiffens: never past 48px however far the pull.
      expect(movementX(during.style)).toBeLessThan(0);
      expect(movementX(during.style)).toBeGreaterThan(-48);
      expect(roots(w)[0].attributes()).not.toHaveProperty('data-leave-to');
    });

    it('takes its directions from swipeDirection', async () => {
      const w = await show({ swipeDirection: 'up' });
      await swipe(w, { y: -60 });

      expect(roots(w)[0].attributes('data-swipe-direction')).toBe('up');
    });

    it('can be turned off', async () => {
      const w = await show({ swipeDirection: [] });
      const during = await swipe(w, { x: 60 });

      expect(during).not.toHaveProperty('data-swiping');
      expect(roots(w)[0].attributes()).not.toHaveProperty('data-leave-to');
    });

    it('leaves a press on a button alone', async () => {
      const w = await show();
      await swipe(w, { x: 60 }, w.find('[data-part="close"]').element);

      expect(roots(w)[0].attributes()).not.toHaveProperty('data-swipe-direction');
    });
  });

  describe('repeating a toast', () => {
    it('reuses the slot when the same id comes back', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ id: 'upload', title: 'Uploading' });
      await flush(2);

      useToast(store).setToast({ id: 'upload', title: 'Uploaded', type: 'success' });
      await nextTick();

      expect(roots(w)).toHaveLength(1);
      expect(w.find('[data-part="title"]').text()).toBe('Uploaded');
      expect(w.find('[data-part="root"]').attributes('data-type')).toBe('success');
    });

    it('does not replay the enter animation on a toast already on screen', async () => {
      // Re-entering would flash the toast out to its starting style and back.
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ id: 'upload', title: 'Uploading' });
      await flush(2);
      expect(roots(w)[0].attributes()).not.toHaveProperty('data-enter-from');

      useToast(store).setToast({ id: 'upload', title: 'Uploaded' });
      await nextTick();

      expect(roots(w)[0].attributes()).not.toHaveProperty('data-enter-from');
    });

    it('counts the repeats', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await flush(2);
      expect(roots(w)[0].attributes()).not.toHaveProperty('data-repeat-count');

      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await nextTick();
      expect(roots(w)[0].attributes('data-repeat-count')).toBe('1');

      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await nextTick();
      expect(roots(w)[0].attributes('data-repeat-count')).toBe('2');
      expect(styleOf(roots(w)[0])).toContain('--toast-repeat-count: 2');
    });

    it('flags the repeat so the stylesheet can nudge it', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await flush(2);
      expect(roots(w)[0].attributes()).not.toHaveProperty('data-repeated');

      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await flush(2);

      expect(roots(w)[0].attributes()).toHaveProperty('data-repeated');
    });

    it('takes the flag off again once the nudge has run', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await flush(2);
      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await flush(2);
      expect(roots(w)[0].attributes()).toHaveProperty('data-repeated');

      await roots(w)[0].trigger('animationend');

      // Off again, so the next repeat can put it back and restart the nudge.
      expect(roots(w)[0].attributes()).not.toHaveProperty('data-repeated');
    });

    it('restarts the nudge when a repeat lands while one is still running', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await flush(2);
      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await flush(2);
      expect(roots(w)[0].attributes()).toHaveProperty('data-repeated');

      // A second repeat before the first nudge has finished. The flag has to
      // come off for a frame, or re-setting an attribute that is already there
      // restarts no animation and the nudge is swallowed.
      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await nextTick();
      await nextTick();
      expect(roots(w)[0].attributes()).not.toHaveProperty('data-repeated');

      await flush(2);
      expect(roots(w)[0].attributes()).toHaveProperty('data-repeated');
    });

    it('re-raises a toast caught on its way out as a new arrival', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await flush(2);

      store.close('ping');
      await nextTick();
      expect(roots(w)[0].attributes()).toHaveProperty('data-leave-to');

      // It really is arriving again, so it enters rather than being nudged.
      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      await nextTick();

      expect(roots(w)[0].attributes()).toHaveProperty('data-enter-from');
      expect(roots(w)[0].attributes()).not.toHaveProperty('data-repeat-count');
    });

    it('keeps the repeat where it stands instead of stacking a duplicate', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ id: 'ping', title: 'Ping' });
      useToast(store).setToast({ title: 'Something else' });
      await flush(2);

      // The repeat must not jump the queue back to the front.
      useToast(store).setToast({ id: 'ping', title: 'Ping again' });
      await nextTick();

      expect(roots(w)).toHaveLength(2);
      expect(titles(w).map((t) => t.text())).toEqual(['Something else', 'Ping again']);
      expect(roots(w)[1].attributes('data-index')).toBe('1');
    });
  });

  describe('accessibility', () => {
    it('names the region and announces each toast', async () => {
      const store = createToastStore();
      const w = mountToaster({ store, label: 'Alerts' });

      useToast(store).setToast({ title: 'Heads up' });
      await nextTick();

      expect(viewport(w).attributes('role')).toBe('region');
      expect(viewport(w).attributes('aria-label')).toBe('Alerts');
      expect(roots(w)[0].attributes('role')).toBe('status');
    });

    it('points the toast at its own title and description', async () => {
      const store = createToastStore();
      const w = mountToaster({ store });

      useToast(store).setToast({ title: 'Saved', text: 'All good.' });
      await nextTick();

      const root = w.find('[data-part="root"]');
      expect(root.attributes('aria-labelledby')).toBe(w.find('[data-part="title"]').attributes('id'));
      expect(root.attributes('aria-describedby')).toBe(
        w.find('[data-part="description"]').attributes('id'),
      );
    });
  });
});

describe('a provided store', () => {
  afterEach(() => defaultToastStore.closeAll());

  /** A toaster under a component that provides `store`, and a button below it that adds a toast. */
  function mountUnder(store: ToastStore) {
    let add!: () => void;
    const Button = defineComponent(() => {
      const { setToast } = useToast();
      add = () => setToast({ title: 'Saved' });
      return () => h('button');
    });
    const wrapper = mount(
      defineComponent(() => {
        provideToastStore(store);
        return () => [
          h(Button),
          h(ToastViewport as any, null, () => h(ToastRoot as any, null, () => h(ToastTitle as any))),
        ];
      }),
      { attachTo: document.body },
    );
    return { wrapper, add: () => add() };
  }

  it('is what `useToast()` and the viewport below it use, not the shared one', async () => {
    const store = createToastStore();
    const { wrapper, add } = mountUnder(store);
    add();
    await nextTick();

    expect(store.toasts.value.map((toast) => toast.title)).toEqual(['Saved']);
    expect(defaultToastStore.toasts.value).toEqual([]);
    expect(titles(wrapper).map((title) => title.text())).toEqual(['Saved']);
    wrapper.unmount();
  });

  it('can be provided across an app', () => {
    const store = createToastStore();
    const app = createApp({ render: () => null });
    provideToastStore(store, app);
    app.runWithContext(() => useToast().setToast({ title: 'From a plugin' }));
    expect(store.toasts.value.map((toast) => toast.title)).toEqual(['From a plugin']);
  });

  it('leaves `useToast()` outside a component on the shared one', () => {
    const store = createToastStore();
    mountUnder(store).wrapper.unmount();
    useToast().setToast({ title: 'From a module' });
    expect(defaultToastStore.toasts.value.map((toast) => toast.title)).toEqual(['From a module']);
    expect(store.toasts.value).toEqual([]);
  });

  it('still gives way to a store named outright', () => {
    const provided = createToastStore();
    const named = createToastStore();
    const app = createApp({ render: () => null });
    provideToastStore(provided, app);
    app.runWithContext(() => useToast(named).setToast({ title: 'Named' }));
    expect(named.toasts.value).toHaveLength(1);
    expect(provided.toasts.value).toEqual([]);
  });
});

describe('ids', () => {
  it('numbers a toast past one already showing under that number', () => {
    // A server render's toasts are carried into the page's store with their ids.
    const store = createToastStore();
    store.add({ id: 'toast-1', title: 'From the server' });
    expect(store.add({ title: 'Mine' })).toBe('toast-2');
    expect(store.toasts.value.map((toast) => toast.title)).toEqual(['Mine', 'From the server']);
  });

  it('still replaces a toast whose id is given again', () => {
    const store = createToastStore();
    store.add({ id: 'save', title: 'Saving' });
    store.add({ id: 'save', title: 'Saved' });
    expect(store.toasts.value.map((toast) => toast.title)).toEqual(['Saved']);
  });
});

