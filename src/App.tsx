import React from 'react';
import Toolbar from '@/components/Toolbar';
import FormulaBar from '@/components/FormulaBar';
import WorksheetTabs from '@/components/WorksheetTabs';
import SpreadsheetGrid from '@/components/SpreadsheetGrid';
import { useWorkbookStore } from '@/stores/workbookStore';

const App: React.FC = () => {
  const { activeSheetName } = useWorkbookStore();

  return (
    <div className="flex flex-col h-screen">
      {/* Top menu bar placeholder */}
      <header className="bg-white shadow-sm p-2 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Your Sheets</h1>
        <Toolbar />
      </header>

      {/* Worksheet tabs */}
      <WorksheetTabs />

      {/* Formula bar */}
      <FormulaBar />

      {/* Spreadsheet grid */}
      <main className="flex-1 overflow-auto bg-white">
        <SpreadsheetGrid sheetName={activeSheetName} />
      </main>
    </div>
  );
};

export default App;