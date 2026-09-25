import React from 'react';
import { HardHat, Download, RefreshCw, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { exportAttendanceCSV } from '../utils/csvExport';
import { seedSampleData, clearAllData } from '../db/database';

export default function Header({ currentDateStr, onDataChanged }) {
  const handleSeed = async () => {
    if (confirm('Load sample labours and past attendance data for testing?')) {
      await seedSampleData(true);
      if (onDataChanged) onDataChanged();
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to CLEAR ALL LABOURS and ATTENDANCE DATA?\n\nThis will allow you to start fresh with your own labourers.')) {
      await clearAllData();
      if (onDataChanged) onDataChanged();
    }
  };

  const handleExport = async () => {
    await exportAttendanceCSV();
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md text-white shadow-sm border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <HardHat className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight tracking-tight text-slate-100 flex items-center gap-1.5">
              Labour Attendance
            </h1>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-amber-400" />
              <span>Construction Site Daily Log</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleClear}
            title="Clear All Sample Data"
            className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 active:scale-95 transition-all text-xs font-bold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          
          <button
            onClick={handleSeed}
            title="Load Sample Data"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-amber-400 hover:bg-slate-700/80 border border-slate-700/60 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sample</span>
          </button>

          <button
            onClick={handleExport}
            title="Export Attendance CSV"
            className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95 transition-all text-xs font-black flex items-center gap-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
}
