import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSprite, readIcons } from '../src/sprite';

const symbol = (svg: string) => buildSprite([{ name: 'icon', svg }]).svg.split('\n')[1];

describe('buildSprite', () => {
  it('makes a hidden sprite of one symbol per icon, named by it', () => {
    const sprite = buildSprite([
      { name: 'check', svg: '<svg viewBox="0 0 16 16"><path d="M1 1"/></svg>' },
      { name: 'bell', svg: '<svg viewBox="0 0 24 24"><path d="M2 2"/></svg>' }
    ]);
    expect(sprite.names).toEqual(['check', 'bell']);
    expect(sprite.svg).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" style="display: none">\n' +
        '<symbol id="check" fill="currentColor" viewBox="0 0 16 16"><path d="M1 1"/></symbol>\n' +
        '<symbol id="bell" fill="currentColor" viewBox="0 0 24 24"><path d="M2 2"/></symbol>\n' +
        '</svg>\n'
    );
  });

  it('turns fills into the text color, as an inline icon does', () => {
    expect(symbol('<svg viewBox="0 0 2 2"><path fill="#ff0" d="M0 0"/></svg>')).toContain(
      '<path fill="currentColor" d="M0 0"/>'
    );
  });

  it('keeps the root’s stroke, so a stroke icon still draws', () => {
    // Moved to the symbol: `<use>` draws the symbol's content, never the file's root.
    expect(
      symbol('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 0"/></svg>')
    ).toBe('<symbol id="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M0 0"/></symbol>');
  });

  it('fills a shape that has no fill, which `Icon`’s `fill="none"` would hide', () => {
    expect(symbol('<svg viewBox="0 0 2 2"><path d="M0 0"/></svg>')).toContain('fill="currentColor"');
  });

  it('drops the root’s size, id and namespace', () => {
    const drawn = symbol('<svg xmlns="http://www.w3.org/2000/svg" id="x" width="24" height="24" viewBox="0 0 24 24"><path/></svg>');
    expect(drawn).toBe('<symbol id="icon" fill="currentColor" viewBox="0 0 24 24"><path/></symbol>');
  });

  it('ignores what comes around the root', () => {
    const drawn = symbol('<?xml version="1.0"?>\n<!-- made by hand -->\n<svg viewBox="0 0 2 2">\n  <path/>\n</svg>\n');
    expect(drawn).toBe('<symbol id="icon" fill="currentColor" viewBox="0 0 2 2"><path/></symbol>');
  });

  it('leaves out a file with no svg in it, and names it', () => {
    const sprite = buildSprite([{ name: 'broken', svg: 'not markup' }]);
    expect(sprite.names).toEqual([]);
    expect(sprite.invalid).toEqual(['broken']);
  });
});

describe('readIcons', () => {
  const root = mkdtempSync(join(tmpdir(), 'vunset-sprite-'));
  const folder = (name: string, files: Record<string, string>) => {
    mkdirSync(join(root, name));
    for (const [file, svg] of Object.entries(files)) writeFileSync(join(root, name, file), svg);
    return join(root, name);
  };

  const brand = folder('brand', { 'logo.svg': '<svg id="brand-logo"/>', 'close.svg': '<svg id="brand-close"/>' });
  const icons = folder('icons', { 'close.svg': '<svg id="icons-close"/>', 'b.svg': '<svg/>', 'notes.txt': 'no' });

  it('reads every svg of each folder, by name, the first folder winning a name', () => {
    expect(readIcons([brand, icons])).toEqual([
      { name: 'close', svg: '<svg id="brand-close"/>' },
      { name: 'logo', svg: '<svg id="brand-logo"/>' },
      { name: 'b', svg: '<svg/>' }
    ]);
  });

  it('skips a folder that is not there', () => {
    expect(readIcons([join(root, 'nope'), icons]).map((icon) => icon.name)).toEqual(['b', 'close']);
  });
});
