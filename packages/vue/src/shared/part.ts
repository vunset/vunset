import { cloneVNode, Comment, Fragment, h, Text, type Component, type FunctionalComponent, type VNode } from 'vue';
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
 * Renders a part's `as` with `h()`. `<component :is="'button'">` first looks for
 * a registered component of that name, case-insensitively, so an app's global
 * `Button` would stand in for every native button the library renders.
 *
 * `as="child"` renders no element of its own: the one element or component in
 * the slot becomes the part. Its props merge with the part's as a caller's do:
 * its own win, and its handlers run first. A ref on a functional component is
 * the element it renders, so the part still gets its element.
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
  return typeof props.as === 'string' ? h(props.as, attrs, slots.default?.()) : h(props.as, attrs, slots);
};

Part.props = ['as'];
Part.inheritAttrs = false;
