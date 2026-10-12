import React from 'react';
import { useWorkbookStore } from '@/stores/workbookStore';

const WorksheetTabs: React.FC = () => {
  const {
    sheets,
    activeSheetName,
    setActiveSheet,
    addSheet,
    renameSheet,
    deleteSheet
  } = useWorkbookStore();

  const handleAdd = () => {
    const name = `Sheet${sheets.length + 1}`;
    addSheet(name);
  };

  const handleRename = (oldName: string) => {
    const newName = prompt('Rename sheet', oldName);
    if (newName && newName.trim() && newName !== oldName) {
      renameSheet(oldName, newName.trim());
    }
  };

  const handleDelete = (name: string) => {
    if (window.confirm(`Delete sheet "${name}"?`)) {
      deleteSheet(name);
    }
  };

  return (
    <div className="flex items-center bg-gray-200 border-b p-1">
      {sheets.map((name) => (
        <div
          key={name}
          className={`px-3 py-1 mr-1 rounded cursor-pointer ${
            name === activeSheetName ? 'bg-white shadow' : 'bg-gray-300'
          }`}
          onClick={() => setActiveSheet(name)}
          onContextMenu={(e) => {
            e.preventDefault();
            const action = prompt('Enter "r" to rename, "d" to delete', '');
            if (action === 'r') handleRename(name);
            if (action === 'd') handleDelete(name);
          }}
        >
          {name}
        </div>
      ))}
      <button
        className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
        onClick={handleAdd}
      >
        +
      </button>
    </div>
  );
};

export default WorksheetTabs;