import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { Comment, defineComponent, Fragment, h, nextTick, Text } from 'vue';
import {
  Button,
  Input,
  DialogRoot,
  DialogTrigger,
  DialogClose,
  Portal,
  Popup,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  CheckboxRoot,
  Badge,
  singleChild,
} from '../src';

// An app's own components, registered globally under the names of native tags.
const impostor = (name: string) =>
  defineComponent({ name, setup: (_, { slots }) => () => h('app-' + name.toLowerCase(), slots.default?.()) });
const global = {
  components: { Button: impostor('Button'), Input: impostor('Input'), Div: impostor('Div'), Span: impostor('Span') },
};

describe('a part’s element', () => {
  it('is the native tag, even with an app component of that name registered', async () => {
    const w = mount(
      defineComponent(() => () => [
        h(Button as any, { as: 'span', class: 'as-span' }, () => 'Span button'),
        h(Input as any, { as: 'input', class: 'input' }),
        h(DialogRoot as any, { defaultOpen: true }, () => [
          h(DialogTrigger as any, { class: 'trigger' }, () => 'Open'),
          h(Portal as any, { disabled: true }, () => h(Popup as any, { class: 'popup' }, () => h(DialogClose as any, { class: 'close' }, () => 'Close'))),
        ]),
        h(SelectRoot as any, { options: ['a'] }, () => h(SelectTrigger as any, { class: 'select' }, () => h(SelectValue as any, { class: 'value' }))),
        h(CheckboxRoot as any, { class: 'checkbox', as: 'span' }),
        h(Badge as any, { class: 'badge' }, () => '3'),
      ]),
      { global, attachTo: document.body },
    );
    await nextTick();

    const tag = (selector: string) => w.element.parentElement!.querySelector(selector)?.tagName.toLowerCase();
    expect(document.querySelector('app-button, app-input, app-div, app-span')).toBeNull();
    expect(tag('.as-span')).toBe('span');
    expect(tag('.input')).toBe('input');
    expect(tag('.trigger')).toBe('button');
    expect(tag('.popup')).toBe('div');
    expect(tag('.close')).toBe('button');
    expect(tag('.select')).toBe('div');
    expect(tag('.value')).toBe('span');
    expect(tag('.checkbox')).toBe('span');
    expect(tag('.badge')).toBe('span');
  });

  it('is a component when `as` is one, given the part’s attributes and slot', async () => {
    const Box = defineComponent({
      inheritAttrs: false,
      setup: (_, { attrs, slots }) => () => h('section', { ...attrs, 'data-box': '' }, slots.default?.()),
    });
    const w = mount(h(DialogRoot as any, null, () => h(DialogTrigger as any, { as: Box, class: 'mine' }, () => 'Open')), {
      attachTo: document.body,
    });
    const el = w.find('[data-box]');
    expect(el.element.tagName).toBe('SECTION');
    expect(el.classes()).toContain('mine');
    expect(el.attributes('aria-haspopup')).toBe('dialog');
    expect(el.text()).toBe('Open');
  });
});

describe('as="child"', () => {
  /** A dialog whose trigger is `child`, rendered in place of a trigger element of its own. */
  function mountDialog(child: () => any) {
    return mount(
      defineComponent(() => () =>
        h(DialogRoot as any, null, () => [
          h(DialogTrigger as any, { as: 'child', class: 'from-part' }, child),
          h(Portal as any, { disabled: true }, () => h(Popup as any, { class: 'popup' }, () => 'Body')),
        ]),
      ),
      { attachTo: document.body },
    );
  }

  it('makes the one element in the slot the part, with no element of its own', async () => {
    const w = mountDialog(() => h('a', { class: 'mine', href: '#' }, 'Open'));
    const link = w.find('a');
    expect(w.findAll('button')).toHaveLength(0);
    expect(link.classes()).toEqual(expect.arrayContaining(['mine', 'from-part']));
    expect(link.attributes('aria-haspopup')).toBe('dialog');
    expect(link.attributes('aria-expanded')).toBe('false');

    await link.trigger('click');
    expect(link.attributes('aria-expanded')).toBe('true');
  });

  it('lets the child’s own props win, and runs its handler first', async () => {
    const order: string[] = [];
    const w = mountDialog(() =>
      h('a', { 'aria-haspopup': 'menu', onClick: () => order.push('child') }, 'Open'),
    );
    expect(w.find('a').attributes('aria-haspopup')).toBe('menu');
    await w.find('a').trigger('click');
    expect(order).toEqual(['child']);
    expect(w.find('a').attributes('aria-expanded')).toBe('true');
  });

  it('lets the child’s handler keep the part’s from running', async () => {
    const w = mountDialog(() => h('a', { onClick: (event: any) => event.preventInternalHandler() }, 'Open'));
    await w.find('a').trigger('click');
    expect(w.find('a').attributes('aria-expanded')).toBe('false');
  });

  it('passes through a component child to the element it renders', async () => {
    const Fancy = defineComponent({
      setup: (_, { slots }) => () => h('button', { class: 'fancy', type: 'button' }, slots.default?.()),
    });
    const w = mountDialog(() => h(Fancy, null, () => 'Open'));
    const button = w.find('button.fancy');
    expect(w.findAll('button')).toHaveLength(1);
    expect(button.attributes('aria-haspopup')).toBe('dialog');
    await button.trigger('click');
    expect(button.attributes('aria-expanded')).toBe('true');
  });

  it('renders nothing for several children or bare text, and says why', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const w = mountDialog(() => [h('a', 'One'), h('a', 'Two')]);
    expect(w.findAll('a')).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('as="child"'));
    warn.mockRestore();
  });
});

describe('singleChild', () => {
  it('finds the one element past comments, blank text and fragments', () => {
    const only = h('span');
    const nodes = [h(Comment as any), h(Text as any, '  '), h(Fragment as any, [only])];
    expect(singleChild(nodes)).toBe(only);
  });

  it('finds none among several, or in text', () => {
    expect(singleChild([h('a'), h('b')])).toBeUndefined();
    expect(singleChild([h(Text as any, 'SLA')])).toBeUndefined();
    expect(singleChild(undefined)).toBeUndefined();
  });
});

