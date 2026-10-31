import { formatCsv } from '@vunset/utils';

/**
 * Saves `content` as a file: a `Blob` as it is, anything else as JSON. A CSV
 * gets `.csv` when `filename` has no such ending.
 */
export function useDownload(content: unknown, filename: string): void {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([JSON.stringify(content, null, 2)], { type: 'application/json;charset=utf-8' });
  const extension = blob.type.startsWith('text/csv') && !/\.csv$/i.test(filename) ? '.csv' : '';

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename + extension;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Saves rows as a CSV file, its columns the first row's keys. Nothing for no rows. */
export function useExportCsv<T extends object>(data: T[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]!);
  const rows = data.map((row) => headers.map((key) => (row as Record<string, unknown>)[key]));
  useDownload(formatCsv(headers, rows), filename);
}
