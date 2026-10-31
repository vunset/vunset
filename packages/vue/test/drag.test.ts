import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { DragRoot, DragItem, DragHandle } from '../src';

const ITEM = 40;
const GAP = 8;
const COLUMNS = 3;

/**
 * jsdom has no layout, and `test/setup.ts` gives every element the same box.
 * Each item gets one of its own here: a vertical stack, 40px tall, 8px apart.
 */
function lay(wrapper: VueWrapper<any>, orientation = 'vertical') {
  wrapper.findAll('[data-part="drag-item"]').forEach((node, index) => {
    const offset = index * (ITEM + GAP);
    // A grid: three to a row, the rows wrapping.
    const column = (index % COLUMNS) * (ITEM + GAP);
    const row = Math.floor(index / COLUMNS) * (ITEM + GAP);
    const rect =
      orientation === 'grid'
        ? { left: column, right: column + ITEM, top: row, bottom: row + ITEM }
        : orientation === 'horizontal'
          ? { left: offset, right: offset + ITEM, top: 0, bottom: ITEM }
          : { top: offset, bottom: offset + ITEM, left: 0, right: 200 };
    Object.defineProperty(node.element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ ...rect, x: rect.left, y: rect.top, width: rect.right - rect.left, height: rect.bottom - rect.top }),
    });
  });
}

function mountList(
  props: Record<string, any> = {},
  options: { handles?: boolean; disabled?: string; items?: string[] } = {},
) {
  const list = ref(options.items ?? ['a', 'b', 'c', 'd']);
  const Host = defineComponent({
    setup: () => () =>
      h(
        DragRoot as any,
        { modelValue: list.value, 'onUpdate:modelValue': (next: string[]) => (list.value = next), ...props },
        {
          default: ({ items }: any) =>
            items.map((value: string) =>
              h(
                DragItem as any,
                { key: value, value, disabled: options.disabled === value, 'data-value': value },
                () => [options.handles ? h(DragHandle as any, null, () => '⋮') : null, value],
              ),
            ),
        },
      ),
  });
  const wrapper = mount(Host, { attachTo: document.body });
  lay(wrapper, props.orientation);
  return { wrapper, list };
}

const item = (wrapper: VueWrapper<any>, value: string) => wrapper.find(`[data-value="${value}"]`);
const texts = (wrapper: VueWrapper<any>) => wrapper.findAll('[data-part="drag-item"]').map((n) => n.attributes('data-value'));

function pointer(type: string, y = 0, x = 0) {
  return new PointerEvent(type, { bubbles: true, pointerId: 1, button: 0, clientX: x, clientY: y } as PointerEventInit);
}

async function drag(target: Element, distance: number, { release = true, horizontal = false } = {}) {
  const at = (d: number) => (horizontal ? [0, d] : [d, 0]) as [number, number];
  target.dispatchEvent(pointer('pointerdown', ...at(0)));
  await nextTick();
  target.dispatchEvent(pointer('pointermove', ...at(distance)));
  await nextTick();
  if (release) {
    target.dispatchEvent(pointer('pointerup', ...at(distance)));
    await nextTick();
  }
}

const key = async (target: VueWrapper<any> | ReturnType<VueWrapper<any>['find']>, name: string) => {
  await target.trigger('keydown', { key: name });
  await nextTick();
};

describe('DragRoot with a pointer', () => {
  it('moves an item down past the neighbors it crossed', async () => {
    const { wrapper, list } = mountList();

    // From a (center 20) past b (68) and c (116): center lands at 130.
    await drag(item(wrapper, 'a').element, 110);

    expect(list.value).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an item up', async () => {
    const { wrapper, list } = mountList();

    await drag(item(wrapper, 'd').element, -100);

    expect(list.value).toEqual(['a', 'd', 'b', 'c']);
  });

  it('reports what moved and where', async () => {
    const { wrapper } = mountList();

    await drag(item(wrapper, 'a').element, 60);

    expect(wrapper.findComponent(DragRoot).emitted('change')![0]).toEqual([{ value: 'a', from: 0, to: 1 }]);
  });

  it('is still a press, not a drag, until the pointer passes the threshold', async () => {
    const { wrapper } = mountList();

    await drag(item(wrapper, 'a').element, 3, { release: false });

    expect(item(wrapper, 'a').attributes('data-dragging')).toBeUndefined();
    expect(item(wrapper, 'a').attributes('style') ?? '').not.toContain('translate3d');

    item(wrapper, 'a').element.dispatchEvent(pointer('pointermove', 5));
    await nextTick();
    expect(item(wrapper, 'a').attributes('data-dragging')).toBe('');
  });

  it('follows the pointer, and slides the neighbors aside, before anything is committed', async () => {
    const { wrapper, list } = mountList();

    await drag(item(wrapper, 'a').element, 60, { release: false });

    expect(item(wrapper, 'a').attributes('style')).toContain('translate3d(0, 60px, 0)');
    // b slides up into a's slot: a's height plus the gap.
    expect(item(wrapper, 'b').attributes('style')).toContain(`translate3d(0, -${ITEM + GAP}px, 0)`);
    expect(item(wrapper, 'c').attributes('style') ?? '').not.toContain('translate3d');
    expect(item(wrapper, 'a').attributes('data-dragging')).toBe('');
    expect(wrapper.find('[data-part="drag"]').attributes('data-sorting')).toBe('');
    expect(list.value).toEqual(['a', 'b', 'c', 'd']);
  });

  it('slides the neighbors down when an item is dragged up', async () => {
    const { wrapper } = mountList();

    await drag(item(wrapper, 'd').element, -60, { release: false });

    expect(item(wrapper, 'c').attributes('style')).toContain(`translate3d(0, ${ITEM + GAP}px, 0)`);
    expect(item(wrapper, 'b').attributes('style') ?? '').not.toContain('translate3d');
  });

  it('puts everything back when Escape is pressed mid-drag', async () => {
    const { wrapper, list } = mountList();

    await drag(item(wrapper, 'a').element, 110, { release: false });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    item(wrapper, 'a').element.dispatchEvent(pointer('pointerup', 110));
    await nextTick();

    expect(list.value).toEqual(['a', 'b', 'c', 'd']);
    expect(item(wrapper, 'a').attributes('style') ?? '').not.toContain('translate3d');
  });

  it('drops nothing when the pointer is canceled', async () => {
    const { wrapper, list } = mountList();

    await drag(item(wrapper, 'a').element, 110, { release: false });
    item(wrapper, 'a').element.dispatchEvent(pointer('pointercancel', 110));
    await nextTick();

    expect(list.value).toEqual(['a', 'b', 'c', 'd']);
  });

  it('works across as well as down', async () => {
    const { wrapper, list } = mountList({ orientation: 'horizontal' });

    await drag(item(wrapper, 'a').element, 60, { horizontal: true, release: false });
    expect(item(wrapper, 'a').attributes('style')).toContain('translate3d(60px, 0, 0)');

    item(wrapper, 'a').element.dispatchEvent(pointer('pointerup', 0, 60));
    await nextTick();
    expect(list.value).toEqual(['b', 'a', 'c', 'd']);
  });

  it('swallows the click that ends a drag', async () => {
    const { wrapper } = mountList();
    let clicks = 0;
    item(wrapper, 'a').element.addEventListener('click', () => (clicks += 1));

    await drag(item(wrapper, 'a').element, 60);
    // The click lands on the element the drag was released over.
    item(wrapper, 'a').element.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(clicks).toBe(0);
  });

  it('leaves a press on a button inside the item to the button', async () => {
    const list = ref(['a', 'b']);
    const Host = defineComponent({
      setup: () => () =>
        h(DragRoot as any, { modelValue: list.value, 'onUpdate:modelValue': (n: string[]) => (list.value = n) }, {
          default: ({ items }: any) =>
            items.map((value: string) => h(DragItem as any, { key: value, value }, () => h('button', { class: `btn-${value}` }, value))),
        }),
    });
    const wrapper = mount(Host, { attachTo: document.body });
    lay(wrapper);

    await drag(wrapper.find('.btn-a').element, 60, { release: false });

    expect(wrapper.find('[data-part="drag-item"]').attributes('data-dragging')).toBeUndefined();
  });

  it('will not drag while disabled, or drag a disabled item', async () => {
    const off = mountList({ disabled: true });
    await drag(item(off.wrapper, 'a').element, 110);
    expect(off.list.value).toEqual(['a', 'b', 'c', 'd']);

    const one = mountList({}, { disabled: 'a' });
    await drag(item(one.wrapper, 'a').element, 110);
    expect(one.list.value).toEqual(['a', 'b', 'c', 'd']);
    expect(item(one.wrapper, 'a').attributes('data-disabled')).toBe('');
  });
});

describe('DragRoot with handles', () => {
  it('drags from the handle only', async () => {
    const { wrapper, list } = mountList({ handle: true }, { handles: true });

    await drag(item(wrapper, 'a').element, 110);
    expect(list.value).toEqual(['a', 'b', 'c', 'd']);

    await drag(item(wrapper, 'a').find('[data-part="drag-handle"]').element, 110);
    expect(list.value).toEqual(['b', 'c', 'a', 'd']);
  });

  it('leaves the item scrollable on touch, and makes the handle the tab stop', () => {
    const { wrapper } = mountList({ handle: true }, { handles: true });

    expect(item(wrapper, 'a').attributes('style') ?? '').not.toContain('touch-action');
    expect(item(wrapper, 'a').attributes('tabindex')).toBeUndefined();

    const grip = item(wrapper, 'a').find('[data-part="drag-handle"]');
    expect(grip.attributes('tabindex')).toBe('0');
    expect(grip.attributes('aria-label')).toBe('Reorder');
    expect(grip.attributes('style')).toContain('touch-action: none');
  });

  it('keeps a handle out of the tab order when the item itself is the way in', () => {
    const { wrapper } = mountList({}, { handles: true });

    expect(item(wrapper, 'a').attributes('tabindex')).toBe('0');
    expect(item(wrapper, 'a').find('[data-part="drag-handle"]').attributes('tabindex')).toBe('-1');
  });

  it('starts one drag, not two, from a handle in an item that drags too', async () => {
    const { wrapper } = mountList({}, { handles: true });

    await drag(item(wrapper, 'a').find('[data-part="drag-handle"]').element, 110);

    expect(wrapper.findComponent(DragRoot).emitted('change')).toHaveLength(1);
  });
});

describe('DragRoot with the keyboard', () => {
  it('picks up, moves and puts down', async () => {
    const { wrapper, list } = mountList();
    const a = () => item(wrapper, 'a');

    await key(a(), ' ');
    expect(a().attributes('data-dragging')).toBe('');

    await key(a(), 'ArrowDown');
    await key(a(), 'ArrowDown');
    expect(list.value).toEqual(['b', 'c', 'a', 'd']);

    await key(a(), 'Enter');
    expect(a().attributes('data-dragging')).toBeUndefined();
  });

  it('puts everything back on Escape', async () => {
    const { wrapper, list } = mountList();
    const b = () => item(wrapper, 'b');

    await key(b(), 'Enter');
    await key(b(), 'ArrowDown');
    await key(b(), 'ArrowDown');
    await key(b(), 'Escape');

    expect(list.value).toEqual(['a', 'b', 'c', 'd']);
  });

  it('stops at both ends', async () => {
    const { wrapper, list } = mountList();

    await key(item(wrapper, 'a'), ' ');
    await key(item(wrapper, 'a'), 'ArrowUp');

    expect(list.value).toEqual(['a', 'b', 'c', 'd']);
  });

  it('ignores arrows until an item has been picked up', async () => {
    const { wrapper, list } = mountList();

    await key(item(wrapper, 'a'), 'ArrowDown');

    expect(list.value).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps focus, and its grip, on an item the move blurred', async () => {
    const { wrapper } = mountList();
    const a = item(wrapper, 'a').element as HTMLElement;
    a.focus();
    await key(item(wrapper, 'a'), ' ');

    /*
      A browser can drop focus from a node the DOM moves; jsdom does not. So the
      blur is made by hand, at the moment the move happens — inside Vue's patch,
      when the item's listeners already know its new position. Earlier than that
      it would test nothing.
    */
    const observer = new MutationObserver(() => {
      observer.disconnect();
      a.blur();
      a.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });
    observer.observe(wrapper.find('[data-part="drag"]').element, { childList: true });

    a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(a);
    expect(a.getAttribute('data-dragging')).toBe('');
    expect(texts(wrapper)).toEqual(['b', 'a', 'c', 'd']);
  });

  it('moves with the handle focused', async () => {
    const { wrapper, list } = mountList({ handle: true }, { handles: true });
    const grip = () => item(wrapper, 'c').find('[data-part="drag-handle"]');

    await key(grip(), 'Enter');
    await key(grip(), 'ArrowUp');

    expect(list.value).toEqual(['a', 'c', 'b', 'd']);
  });

  it('uses left and right when laid out across', async () => {
    const { wrapper, list } = mountList({ orientation: 'horizontal' });

    await key(item(wrapper, 'a'), ' ');
    await key(item(wrapper, 'a'), 'ArrowDown');
    expect(list.value).toEqual(['a', 'b', 'c', 'd']);

    await key(item(wrapper, 'a'), 'ArrowRight');
    expect(list.value).toEqual(['b', 'a', 'c', 'd']);
  });

  it('leaves keys typed into a field inside the item to the field', async () => {
    const list = ref(['a', 'b']);
    const Host = defineComponent({
      setup: () => () =>
        h(DragRoot as any, { modelValue: list.value, 'onUpdate:modelValue': (n: string[]) => (list.value = n) }, {
          default: ({ items }: any) =>
            items.map((value: string) => h(DragItem as any, { key: value, value }, () => h('input', { class: `in-${value}` }))),
        }),
    });
    const wrapper = mount(Host, { attachTo: document.body });

    await wrapper.find('.in-a').trigger('keydown', { key: ' ' });

    expect(wrapper.find('[data-part="drag-item"]').attributes('data-dragging')).toBeUndefined();
  });

  it('puts the item down when focus leaves it', async () => {
    const { wrapper } = mountList();

    await key(item(wrapper, 'a'), ' ');
    await item(wrapper, 'a').trigger('focusout');

    expect(item(wrapper, 'a').attributes('data-dragging')).toBeUndefined();
  });
});

describe('DragRoot structure', () => {
  it('is a list of list items', () => {
    const { wrapper } = mountList();

    expect(wrapper.find('[data-part="drag"]').attributes('role')).toBe('list');
    expect(item(wrapper, 'a').attributes('role')).toBe('listitem');
    expect(wrapper.find('[data-part="drag"]').attributes('data-orientation')).toBe('vertical');
  });

  it('works uncontrolled from a default list', async () => {
    const Host = defineComponent({
      setup: () => () =>
        h(DragRoot as any, { defaultValue: ['x', 'y'] }, {
          default: ({ items }: any) => items.map((value: string) => h(DragItem as any, { key: value, value, 'data-value': value }, () => value)),
        }),
    });
    const wrapper = mount(Host, { attachTo: document.body });

    await key(item(wrapper, 'x'), ' ');
    await key(item(wrapper, 'x'), 'ArrowDown');

    expect(texts(wrapper)).toEqual(['y', 'x']);
  });
});

describe('DragRoot as a grid', () => {
  // a b c
  // d e f
  // g
  const ITEMS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const mountGrid = (props: Record<string, any> = {}) => mountList({ orientation: 'grid', ...props }, { items: ITEMS });
  const STEP = ITEM + GAP;

  async function dragTo(target: Element, x: number, y: number, release = true) {
    target.dispatchEvent(pointer('pointerdown', 0, 0));
    await nextTick();
    target.dispatchEvent(pointer('pointermove', y, x));
    await nextTick();
    if (release) {
      target.dispatchEvent(pointer('pointerup', y, x));
      await nextTick();
    }
  }

  it('says it is one', () => {
    const { wrapper } = mountGrid();
    expect(wrapper.find('[data-part="drag"]').attributes('data-orientation')).toBe('grid');
  });

  it('drops an item in the slot nearest its center, across and down at once', async () => {
    const { wrapper, list } = mountGrid();

    // a, one column right and one row down, lands on e's slot.
    await dragTo(item(wrapper, 'a').element, STEP, STEP);

    expect(list.value).toEqual(['b', 'c', 'd', 'e', 'a', 'f', 'g']);
  });

  it('moves an item back up the grid', async () => {
    const { wrapper, list } = mountGrid();

    // g, two rows up, lands on a's slot.
    await dragTo(item(wrapper, 'g').element, 0, -2 * STEP);

    expect(list.value).toEqual(['g', 'a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('follows the pointer on both axes', async () => {
    const { wrapper } = mountGrid();

    await dragTo(item(wrapper, 'a').element, 30, 20, false);

    expect(item(wrapper, 'a').attributes('style')).toContain('translate3d(30px, 20px, 0)');
  });

  it('slides each item between into its neighbor’s slot, round the row break', async () => {
    const { wrapper } = mountGrid();

    await dragTo(item(wrapper, 'a').element, STEP, STEP, false);

    // b and c step one place back along their row…
    expect(item(wrapper, 'b').attributes('style')).toContain(`translate3d(-${STEP}px, 0px, 0)`);
    // …d, first on its row, goes up to the end of the row above…
    expect(item(wrapper, 'd').attributes('style')).toContain(`translate3d(${2 * STEP}px, -${STEP}px, 0)`);
    expect(item(wrapper, 'e').attributes('style')).toContain(`translate3d(-${STEP}px, 0px, 0)`);
    // …and past the landing slot nothing moves.
    expect(item(wrapper, 'f').attributes('style') ?? '').not.toContain('translate3d');
  });

  it('counts the threshold on both axes together', async () => {
    const { wrapper } = mountGrid();

    // 3px each way: under 4px apart on either axis, but over it diagonally.
    await dragTo(item(wrapper, 'a').element, 3, 3, false);

    expect(item(wrapper, 'a').attributes('data-dragging')).toBe('');
  });

  describe('with the keyboard', () => {
    async function pickUp(wrapper: VueWrapper<any>, value: string) {
      const target = item(wrapper, value);
      (target.element as HTMLElement).focus();
      await key(target, ' ');
      return target;
    }

    it('moves one place with left and right', async () => {
      const { wrapper, list } = mountGrid();
      await pickUp(wrapper, 'b');

      await key(item(wrapper, 'b'), 'ArrowRight');
      expect(list.value.slice(0, 3)).toEqual(['a', 'c', 'b']);

      await key(item(wrapper, 'b'), 'ArrowLeft');
      await key(item(wrapper, 'b'), 'ArrowLeft');
      expect(list.value.slice(0, 3)).toEqual(['b', 'a', 'c']);
    });

    it('moves a whole row with up and down, counted from the layout', async () => {
      const { wrapper, list } = mountGrid();
      await pickUp(wrapper, 'b');

      await key(item(wrapper, 'b'), 'ArrowDown');
      expect(list.value.indexOf('b')).toBe(4);

      lay(wrapper, 'grid');
      await key(item(wrapper, 'b'), 'ArrowUp');
      expect(list.value.indexOf('b')).toBe(1);
    });

    it('goes down to the last item from a column the short last row lacks', async () => {
      const { wrapper, list } = mountGrid();
      await pickUp(wrapper, 'f');

      await key(item(wrapper, 'f'), 'ArrowDown');
      expect(list.value.at(-1)).toBe('f');

      // Already on the last row: down does nothing.
      lay(wrapper, 'grid');
      await key(item(wrapper, 'f'), 'ArrowDown');
      expect(list.value.at(-1)).toBe('f');
    });

    it('stays put going up from the first row', async () => {
      const { wrapper, list } = mountGrid();
      await pickUp(wrapper, 'b');

      await key(item(wrapper, 'b'), 'ArrowUp');
      expect(list.value).toEqual(ITEMS);
    });
  });
});
