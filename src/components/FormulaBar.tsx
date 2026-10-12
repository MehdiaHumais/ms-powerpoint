import React, { useState } from 'react';
import { useWorkbookStore } from '@/stores/workbookStore';

const FormulaBar: React.FC = () => {
  const { setCellFormula, activeCell } = useWorkbookStore();
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    if (activeCell) {
      setCellFormula(activeCell, value);
    }
  };

  return (
    <div className="flex items-center bg-gray-50 border-b p-2">
      <span className="mr-2 text-sm text-gray-600">{activeCell || 'A1'}</span>
      <input
        type="text"
        className="flex-1 border rounded px-2 py-1 text-sm"
        placeholder="Enter formula or value"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </div>
  );
};

export default FormulaBar;