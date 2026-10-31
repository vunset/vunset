import { describe, it, expect } from 'vitest';
import { dataAttrs } from '../src/shared/data-attrs';

describe('dataAttrs', () => {
  it('writes a true flag as a bare attribute and leaves a false one off', () => {
    expect(dataAttrs({ open: true, disabled: false })).toEqual({ 'data-open': '' });
  });

  it('writes any other truthy value as its string', () => {
    expect(dataAttrs({ side: 'top', index: 2 })).toEqual({ 'data-side': 'top', 'data-index': '2' });
  });

  it('leaves off every falsy value, zero and the empty string included', () => {
    expect(dataAttrs({ index: 0, label: '', value: null, other: undefined })).toEqual({});
  });

  it('lowercases a camelCase key', () => {
    expect(dataAttrs({ highlightedItem: true })).toEqual({ 'data-highlighteditem': '' });
  });

  it('lets a mapping replace the default attribute for its key', () => {
    const state = { checked: false, disabled: true };
    const attrs = dataAttrs(state, {
      checked: (on) => (on ? { 'data-checked': '' } : { 'data-unchecked': '' })
    });

    expect(attrs).toEqual({ 'data-unchecked': '', 'data-disabled': '' });
  });

  it('writes nothing for a key whose mapping returns null', () => {
    expect(dataAttrs({ open: true }, { open: () => null })).toEqual({});
  });

  it('drops the undefined entries a mapping returns and keeps the rest', () => {
    const attrs = dataAttrs({ status: 'leave' }, {
      status: (value) => ({ 'data-leave-to': value === 'leave' ? '' : undefined, 'data-enter-from': undefined })
    });

    expect(attrs).toStrictEqual({ 'data-leave-to': '' });
    expect(Object.keys(attrs)).toEqual(['data-leave-to']);
  });
});
