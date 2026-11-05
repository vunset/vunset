import {
  cloneVNode,
  Comment,
  Fragment,
  h,
  Text,
  toRaw,
  type Component,
  type FunctionalComponent,
  type VNode
} from 'vue';
import { mergeProps } from './merge-props';

/** The one element or component among `nodes`, past fragments, comments and blank text; `undefined` for none or several. */
export function singleChild(nodes: VNode[] | undefined): VNode | undefined {
  const found: VNode[] = [];
  const walk = (list: VNode[]) => {
    for (const node of list) {
      if (node.type === Fragment) walk(node.children as VNode[]);
      else if (node.type === Comment) continue;
      else if (node.type === Text && !String(node.children).trim()) continue;
      else found.push(node);
    }
  };
  walk(nodes ?? []);
  return found.length === 1 && found[0]!.type !== Text ? found[0] : undefined;
}

/**
 * Renders `as` with `h()`: `<component :is>` would resolve `'button'` to an app's global `Button` first.
 * `as="child"` makes the slot's single element the part, its own props winning and its handlers running first.
 */
export const Part: FunctionalComponent<{ as: string | Component }> = (props, { attrs, slots }) => {
  if (props.as === 'child') {
    const child = singleChild(slots.default?.());
    if (child) {
      // Cloned with props, so it is patched in full; then given the merge, the child's own winning.
      const clone = cloneVNode(child, {});
      clone.props = mergeProps(attrs, child.props ?? {});
      return clone;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[vunset] `as="child"` needs exactly one element or component in its slot.');
    }
    return null;
  }
  // A component that arrived through reactive state (props, a `ref` of items) is a proxy: render what's behind it.
  const as = toRaw(props.as);
  return typeof as === 'string' ? h(as, attrs, slots.default?.()) : h(as, attrs, slots);
};

Part.props = ['as'];
Part.inheritAttrs = false;
