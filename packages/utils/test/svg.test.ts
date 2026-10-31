import { describe, it, expect } from 'vitest';
import { parseInlineSvg } from '../src';

const STAR = '<svg viewBox="0 0 16 16" width="16" height="16">\n<path fill="#ff0" d="M8 0z"/>\n</svg>';

describe('parseInlineSvg', () => {
  it('splits a file into the root to render and the markup to put in it', () => {
    const parsed = parseInlineSvg(STAR)!;

    expect(parsed.attrs).toEqual({ viewBox: '0 0 16 16' });
    expect(parsed.content).toContain('fill="currentColor"');
    expect(parsed.content).not.toContain('#ff0');
    expect(parsed.content).not.toContain('\n');
  });

  it('keeps the last close, so a nested svg survives', () => {
    const parsed = parseInlineSvg('<svg viewBox="0 0 2 2"><svg><rect/></svg></svg>')!;
    expect(parsed.content).toBe('<svg><rect/></svg>');
  });

  it('drops a root id, which two copies of one icon would share', () => {
    const parsed = parseInlineSvg('<svg id="star" viewBox="0 0 2 2"><path/></svg>')!;
    expect(parsed.attrs).toEqual({ viewBox: '0 0 2 2' });
  });

  it('returns nothing for a file with no svg in it', () => {
    expect(parseInlineSvg('not markup')).toBeNull();
  });
});
