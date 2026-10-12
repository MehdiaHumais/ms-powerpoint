export type CellAddress = {
  row: number;
  col: number;
};

export type Cell = {
  value: string | number | null;
  formula?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    backgroundColor?: string;
    border?: string;
    numberFormat?: string;
  };
};

export type WorksheetData = {
  rowCount: number;
  colCount: number;
  cells: Record<string, Cell>; // key = `${row},${col}`
};