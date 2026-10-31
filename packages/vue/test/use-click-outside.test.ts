import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import { PopoverRoot, PopoverTrigger, Portal, Positioner, Popup, useClickOutside, type UseClickOutsideOptions } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = '';
});

function press(target: EventTarget) {
  target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
}

// A panel holding a popover, a toggle beside it, and a button elsewhere.
function setup(options: (refs: { toggle: Ref<HTMLElement | undefined> }) => UseClickOutsideOptions = () => ({})) {
  const handler = vi.fn();
  const shown = ref(true);
  let stop: () => void = () => {};

  const Host = defineComponent({
    setup() {
      const panel = ref<HTMLElement>();
      const toggle = ref<HTMLElement>();
      stop = useClickOutside(panel, handler, options({ toggle }));

      return () => [
        h('button', { ref: toggle, class: 'toggle' }, 'Toggle'),
        h('button', { class: 'elsewhere' }, 'Elsewhere'),
        shown.value
          ? h('div', { ref: panel, class: 'panel' }, [
              h('button', { class: 'inside' }, 'Inside'),
              h(PopoverRoot as any, { defaultOpen: true }, {
                default: () => [
                  h(PopoverTrigger as any, null, { default: () => 'Open' }),
                  h(Portal as any, null, {
                    default: () =>
                      h(Positioner as any, null, {
                        default: () => h(Popup as any, null, { default: () => h('button', { class: 'in-popup' }, 'In popup') })
                      })
                  })
                ]
              })
            ])
          : null
      ];
    }
  });

  wrapper = mount(Host, { attachTo: document.body });
  return { handler, shown, stop: () => stop() };
}

const $ = (selector: string) => document.querySelector<HTMLElement>(selector)!;

describe('useClickOutside', () => {
  it('fires on a press outside the target, with the event', () => {
    const { handler } = setup();
    press($('.elsewhere'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]![0]).toBeInstanceOf(PointerEvent);
  });

  it('stays quiet on a press inside it', () => {
    const { handler } = setup();
    press($('.inside'));
    press($('.panel'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('counts a press in an overlay opened from inside as inside, though it is portaled away', async () => {
    const { handler } = setup();
    await nextTick();
    const inPopup = $('.in-popup');
    expect($('.panel').contains(inPopup)).toBe(false);

    press(inPopup);
    expect(handler).not.toHaveBeenCalled();
  });

  it('counts what `ignore` lists as inside', () => {
    const { handler } = setup(({ toggle }) => ({ ignore: [toggle] }));
    press($('.toggle'));
    expect(handler).not.toHaveBeenCalled();
    press($('.elsewhere'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does nothing while disabled', async () => {
    const enabled = ref(false);
    const { handler } = setup(() => ({ enabled }));
    press($('.elsewhere'));
    expect(handler).not.toHaveBeenCalled();

    enabled.value = true;
    press($('.elsewhere'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does nothing while the target is off the page', async () => {
    const { handler, shown } = setup();
    shown.value = false;
    await nextTick();
    press($('.elsewhere'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('stops when told', () => {
    const { handler, stop } = setup();
    stop();
    press($('.elsewhere'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('stops with the component', () => {
    // A target that outlives the component, so only the listener's removal keeps it quiet.
    const handler = vi.fn();
    const target = document.createElement('div');
    const outside = document.createElement('button');
    document.body.append(target, outside);

    wrapper = mount(defineComponent({ setup: () => (useClickOutside(target, handler), () => null) }));
    press(outside);
    expect(handler).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    wrapper = undefined;
    press(outside);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('sees a press inside a shadow root as inside its host', () => {
    const handler = vi.fn();
    const host = document.createElement('div');
    const outside = document.createElement('button');
    document.body.append(host, outside);
    const inner = document.createElement('button');
    host.attachShadow({ mode: 'open' }).appendChild(inner);

    wrapper = mount(defineComponent({ setup: () => (useClickOutside(host, handler), () => null) }));
    press(inner);
    expect(handler).not.toHaveBeenCalled();
    press(outside);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
