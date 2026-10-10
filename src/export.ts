/**
 * Download an aggregate report as a CSV. Keep the raw character/account IDs
 * OUT of public exports. A leading =, +, -, @, tab or CR must be neutralised
 * to avoid spreadsheet formula execution when a user opens exported CSV.
 */
export function csvText(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escapeCell = (value: string | number | null | undefined): string => {
    let text = value == null ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  return [headers, ...rows].map(row => row.map(escapeCell).join(',')).join('\r\n') + '\r\n';
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void {
  const blob = new Blob(['\uFEFF', csvText(headers, rows)], {type: 'text/csv;charset=utf-8'});
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
