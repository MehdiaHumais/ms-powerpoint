import React, { useEffect, useRef } from 'react';
import { useWorkbookStore } from '@/stores/workbookStore';

interface Props {
  sheetName: string;
}

const SpreadsheetGrid: React.FC<Props> = ({ sheetName }) => {
  const {
    getCell,
    setCellValue,
    activeCell,
    setActiveCell
  } = useWorkbookStore();

  const gridRef = useRef<HTMLDivElement>(null);

  // Simple 20x20 grid for demo
  const rows = 20;
  const cols = 20;

  const handleCellClick = (row: number, col: number) => {
    const address = `${String.fromCharCode(65 + col)}${row + 1}`;
    setActiveCell(address);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!activeCell) return;
    const col = activeCell.charCodeAt(0) - 65;
    const row = parseInt(activeCell.slice(1), 10) - 1;

    let newRow = row;
    let newCol = col;

    switch (e.key) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(rows - 1, row + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(cols - 1, col + 1);
        break;
      case 'Enter':
        newRow = Math.min(rows - 1, row + 1);
        break;
      default:
        return;
    }

    const newAddress = `${String.fromCharCode(65 + newCol)}${newRow + 1}`;
    setActiveCell(newAddress);
    e.preventDefault();
  };

  const handleDoubleClick = (row: number, col: number) => {
    const address = `${String.fromCharCode(65 + col)}${row + 1}`;
    const current = getCell(sheetName, address);
    const newValue = prompt('Edit cell', current?.value ?? '');
    if (newValue !== null) {
      setCellValue(sheetName, address, newValue);
    }
  };

  // Ensure the active cell is scrolled into view
  useEffect(() => {
    if (!gridRef.current || !activeCell) return;
    const cell = gridRef.current.querySelector(`[data-address="${activeCell}"]`);
    if (cell) {
      (cell as HTMLElement).scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [activeCell]);

  return (
    <div
      ref={gridRef}
      className="grid border-collapse select-none"
      style={{
        gridTemplateColumns: `30px repeat(${cols}, 100px)`,
        gridTemplateRows: `30px repeat(${rows}, 24px)`
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Corner cell */}
      <div className="bg-gray-100 border border-gray-300"></div>
      {/* Column headers */}
      {Array.from({ length: cols }).map((_, c) => (
        <div
          key={c}
          className="bg-gray-100 border border-gray-300 flex items-center justify-center text-sm font-medium"
        >
          {String.fromCharCode(65 + c)}
        </div>
      ))}
      {/* Row headers and cells */}
      {Array.from({ length: rows }).map((_, r) => (
        <React.Fragment key={r}>
          {/* Row header */}
          <div
            className="bg-gray-100 border border-gray-300 flex items-center justify-center text-sm font-medium"
          >
            {r + 1}
          </div>
          {/* Cells */}
          {Array.from({ length: cols }).map((_, c) => {
            const address = `${String.fromCharCode(65 + c)}${r + 1}`;
            const cell = getCell(sheetName, address);
            const isActive = activeCell === address;
            return (
              <div
                key={c}
                data-address={address}
                className={`border border-gray-300 p-1 text-sm overflow-hidden cursor-pointer ${
                  isActive ? 'bg-blue-100' : 'bg-white'
                }`}
                onClick={() => handleCellClick(r, c)}
                onDoubleClick={() => handleDoubleClick(r, c)}
              >
                {cell?.value}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SpreadsheetGrid;