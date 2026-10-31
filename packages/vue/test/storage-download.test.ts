import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { useDownload, useExportCsv, useLocalStorage } from '../src';

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('stores JSON and reads it back', () => {
    const { getItem, setItem } = useLocalStorage();
    setItem('settings', { theme: 'dark', bookmarks: ['/a'] });
    expect(localStorage.getItem('settings')).toBe('{"theme":"dark","bookmarks":["/a"]}');
    expect(getItem('settings')).toEqual({ theme: 'dark', bookmarks: ['/a'] });
  });

  it('removes the key for nothing to store, but keeps 0 and false', () => {
    const { getItem, setItem } = useLocalStorage();
    for (const empty of [null, undefined, []]) {
      localStorage.setItem('key', '1');
      setItem('key', empty);
      expect(localStorage.getItem('key')).toBeNull();
    }
    setItem('zero', 0);
    setItem('off', false);
    expect(getItem('zero')).toBe(0);
    expect(getItem('off')).toBe(false);
  });

  it('finds nothing for a missing or unreadable key, and drops the unreadable one', () => {
    const { getItem } = useLocalStorage();
    expect(getItem('missing')).toBeUndefined();
    localStorage.setItem('broken', '{not json');
    expect(getItem('broken')).toBeUndefined();
    expect(localStorage.getItem('broken')).toBeNull();
  });

  it('does nothing where there is no storage, as on a server', () => {
    vi.stubGlobal('localStorage', undefined);
    try {
      const { getItem, setItem, removeItem } = useLocalStorage();
      expect(() => setItem('key', { a: 1 })).not.toThrow();
      expect(getItem('key')).toBeUndefined();
      expect(() => removeItem('key')).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('useDownload and useExportCsv', () => {
  let saved: { name: string; blob: Blob }[];
  const blobs = new Map<string, Blob>();

  beforeEach(() => {
    saved = [];
    let count = 0;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      const url = `blob:${(count += 1)}`;
      blobs.set(url, blob as Blob);
      return url;
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      saved.push({ name: this.download, blob: blobs.get(this.getAttribute('href')!)! });
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('saves a blob under its name, and leaves nothing in the page', () => {
    useDownload(new Blob(['x'], { type: 'text/plain' }), 'notes.txt');
    expect(saved.map((file) => file.name)).toEqual(['notes.txt']);
    expect(document.querySelector('a')).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:1');
  });

  it('saves anything else as JSON', async () => {
    useDownload({ a: 1 }, 'data.json');
    expect(saved[0]!.blob.type).toBe('application/json;charset=utf-8');
    expect(await saved[0]!.blob.text()).toBe('{\n  "a": 1\n}');
  });

  it('exports rows as CSV, columns from the first row, adding the extension', async () => {
    useExportCsv([{ name: 'EU', qps: 3 }, { qps: 5, name: 'US' }], 'report');
    expect(saved[0]!.name).toBe('report.csv');
    // By key, so a row whose keys come in another order still lines up.
    expect(await saved[0]!.blob.text()).toBe('name,qps\nEU,3\nUS,5');
  });

  it('keeps an extension already there, and saves nothing for no rows', () => {
    useExportCsv([{ a: 1 }], 'report.CSV');
    useExportCsv([], 'empty');
    expect(saved.map((file) => file.name)).toEqual(['report.CSV']);
  });
});
