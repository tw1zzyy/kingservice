import * as XLSX from 'xlsx';

export interface ImportResult<T> {
  data: T[];
  errors: string[];
}

export function parseExcel<T>(buffer: Buffer, sheetName?: string): ImportResult<T> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const targetSheet = sheetName || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[targetSheet];

    if (!worksheet) {
      return { data: [], errors: [`Sheet "${targetSheet}" not found in workbook`] };
    }

    const data = XLSX.utils.sheet_to_json<T>(worksheet);
    return { data, errors: [] };
  } catch (error: any) {
    return { data: [], errors: [`Failed to parse Excel: ${error.message}`] };
  }
}

export function generateExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
