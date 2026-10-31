import { describe, it, expect, vi } from 'vitest';
import { mergeProps, type PreventableEvent } from '../src/shared/merge-props';

describe('mergeProps', () => {
  it('lets a later set win a plain prop', () => {
    expect(mergeProps({ id: 'a', role: 'button' }, { id: 'b' })).toEqual({ id: 'b', role: 'button' });
  });

  it('skips a missing set', () => {
    expect(mergeProps(undefined, { id: 'a' }, undefined)).toEqual({ id: 'a' });
  });

  it('combines class from every set, in any form Vue accepts', () => {
    const merged = mergeProps({ class: 'root' }, { class: ['a', { b: true, c: false }] });
    expect(merged.class.split(' ').sort()).toEqual(['a', 'b', 'root']);
  });

  it('combines style, the later declaration winning', () => {
    const merged = mergeProps({ style: { color: 'red', width: '1px' } }, { style: 'color: blue' });
    expect(merged.style).toEqual({ color: 'blue', width: '1px' });
  });

  it('omits class and style when no set brings any', () => {
    expect(mergeProps({ id: 'a' }, { class: '' })).toEqual({ id: 'a' });
  });

  it('runs every listener, the last set’s first', () => {
    const calls: string[] = [];
    const merged = mergeProps(
      { onClick: () => calls.push('library') },
      { onClick: () => calls.push('wrapper') },
      { onClick: () => calls.push('caller') }
    );

    merged.onClick(new MouseEvent('click'));
    expect(calls).toEqual(['caller', 'wrapper', 'library']);
  });

  it('returns what the outermost listener returns', () => {
    const merged = mergeProps({ onSelect: () => 'library' }, { onSelect: () => 'caller' });
    expect(merged.onSelect('value')).toBe('caller');
  });

  it('lets a listener skip the ones merged in before it', () => {
    const library = vi.fn();
    const wrapper = vi.fn();
    const merged = mergeProps(
      { onClick: library },
      { onClick: wrapper },
      { onClick: (event: PreventableEvent) => event.preventInternalHandler() }
    );

    merged.onClick(new MouseEvent('click'));
    expect(wrapper).not.toHaveBeenCalled();
    expect(library).not.toHaveBeenCalled();
  });

  it('lets a middle listener skip only the ones before it', () => {
    const library = vi.fn();
    const caller = vi.fn();
    const merged = mergeProps(
      { onClick: library },
      { onClick: (event: PreventableEvent) => event.preventInternalHandler() },
      { onClick: caller }
    );

    merged.onClick(new MouseEvent('click'));
    expect(caller).toHaveBeenCalledTimes(1);
    expect(library).not.toHaveBeenCalled();
  });

  it('offers preventInternalHandler to a lone listener too', () => {
    const merged = mergeProps({ id: 'a' }, { onClick: (event: PreventableEvent) => event.preventInternalHandler() });
    expect(() => merged.onClick(new MouseEvent('click'))).not.toThrow();
  });

  it('confines a skip to one element, so the same event bubbling on is unaffected', () => {
    const outer = vi.fn();
    const inner = mergeProps({ onClick: vi.fn() }, { onClick: (event: PreventableEvent) => event.preventInternalHandler() });
    const parent = mergeProps({ onClick: outer }, { onClick: vi.fn() });

    const event = new MouseEvent('click');
    inner.onClick(event);
    parent.onClick(event);
    expect(outer).toHaveBeenCalledTimes(1);
  });

  it('runs every listener for a payload that is not a DOM event', () => {
    const library = vi.fn();
    const merged = mergeProps({ onUpdate: library }, { onUpdate: vi.fn() });

    merged.onUpdate(42);
    expect(library).toHaveBeenCalledWith(42);
  });

  it('keeps an earlier listener when a later set passes undefined for it', () => {
    const library = vi.fn();
    const merged = mergeProps({ onClick: library }, { onClick: undefined });

    merged.onClick(new MouseEvent('click'));
    expect(library).toHaveBeenCalledTimes(1);
  });

  it('runs an array of listeners in its own order, as Vue does', () => {
    const calls: string[] = [];
    const merged = mergeProps(
      { onClick: () => calls.push('library') },
      { onClick: [() => calls.push('first'), () => calls.push('second')] }
    );

    merged.onClick(new MouseEvent('click'));
    expect(calls).toEqual(['first', 'second', 'library']);
  });

  it('treats a prop that only starts with "on" as a plain prop', () => {
    const later = () => 'later';
    expect(mergeProps({ onboarding: () => 'earlier' }, { onboarding: later }).onboarding).toBe(later);
  });
});
