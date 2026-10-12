import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type Cell = {
  value: string;
  formula?: string;
};

export type Worksheet = {
  name: string;
  cells: Record<string, Cell>;
};

export type WorkbookState = {
  sheets: string[];
  activeSheetName: string;
  activeCell: string | null;
  data: Record<string, Worksheet>;
  // actions
  setActiveSheet: (name: string) => void;
  addSheet: (name: string) => void;
  renameSheet: (oldName: string, newName: string) => void;
  deleteSheet: (name: string) => void;
  setActiveCell: (address: string) => void;
  setCellValue: (sheet: string, address: string, value: string) => void;
  setCellFormula: (address: string, formula: string) => void;
  getCell: (sheet: string, address: string) => Cell | undefined;
};

export const useWorkbookStore = create<WorkbookState>()(
  immer((set, get) => ({
    sheets: ['Sheet1'],
    activeSheetName: 'Sheet1',
    activeCell: null,
    data: {
      Sheet1: { name: 'Sheet1', cells: {} }
    },

    setActiveSheet: (name) => {
      set((state) => {
        state.activeSheetName = name;
        state.activeCell = null;
      });
    },

    addSheet: (name) => {
      set((state) => {
        if (state.sheets.includes(name)) {
          alert('Sheet name already exists');
          return;
        }
        state.sheets.push(name);
        state.data[name] = { name, cells: {} };
        state.activeSheetName = name;
      });
    },

    renameSheet: (oldName, newName) => {
      set((state) => {
        if (state.sheets.includes(newName)) {
          alert('Sheet name already exists');
          return;
        }
        const idx = state.sheets.indexOf(oldName);
        if (idx === -1) return;
        state.sheets[idx] = newName;
        state.data[newName] = state.data[oldName];
        state.data[newName].name = newName;
        delete state.data[oldName];
        if (state.activeSheetName === oldName) {
          state.activeSheetName = newName;
        }
      });
    },

    deleteSheet: (name) => {
      set((state) => {
        if (state.sheets.length === 1) {
          alert('Cannot delete the last sheet');
          return;
        }
        state.sheets = state.sheets.filter((s) => s !== name);
        delete state.data[name];
        if (state.activeSheetName === name) {
          state.activeSheetName = state.sheets[0];
        }
      });
    },

    setActiveCell: (address) => {
      set((state) => {
        state.activeCell = address;
      });
    },

    setCellValue: (sheet, address, value) => {
      set((state) => {
        const ws = state.data[sheet];
        if (!ws) return;
        ws.cells[address] = { value };
      });
    },

    setCellFormula: (address, formula) => {
      const sheet = get().activeSheetName;
      set((state) => {
        const ws = state.data[sheet];
        if (!ws) return;
        const cell = ws.cells[address] ?? { value: '' };
        cell.formula = formula;
        // Simple evaluation: if formula starts with '=', strip it
        if (formula.startsWith('=')) {
          // In a real app, delegate to HyperFormula
          cell.value = formula; // placeholder
        } else {
          cell.value = formula;
        }
        ws.cells[address] = cell;
      });
    },

    getCell: (sheet, address) => {
      const ws = get().data[sheet];
      return ws?.cells[address];
    }
  }))
);