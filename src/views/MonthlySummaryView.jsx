import React, { useState, useEffect } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, User, TrendingUp } from 'lucide-react';
import { db, getMonthYearString } from '../db/database';

export default function MonthlySummaryView({ labours = [], onOpenLabourDetail }) {
  // Current month state (default to September 2026 or system date)
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(8); // 0-indexed: 8 = September
  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    loadMonthlySummary();
  }, [selectedYear, selectedMonth, labours]);

  const loadMonthlySummary = async () => {
    const monthFormatted = String(selectedMonth + 1).padStart(2, '0');
    const monthPrefix = `${selectedYear}-${monthFormatted}`;

    const monthAttendances = await db.attendances
      .where('date')
      .startsWith(monthPrefix)
      .toArray();

    // Map counts per labour
    const summaryMap = new Map();

    labours.forEach((l) => {
      summaryMap.set(l.id, {
        labour: l,
        present: 0,
        absent: 0,
        total: 0
      });
    });

    monthAttendances.forEach((record) => {
      if (summaryMap.has(record.labour_id)) {
        const item = summaryMap.get(record.labour_id);
        if (record.status === 'PRESENT') item.present++;
        else if (record.status === 'ABSENT') item.absent++;
        item.total++;
      }
    });

    const result = Array.from(summaryMap.values());
    // Sort by present count descending
    result.sort((a, b) => b.present - a.present);

    setSummaryData(result);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const monthDate = new Date(selectedYear, selectedMonth, 1);
  const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();

  // Aggregate totals
  const totalPresent = summaryData.reduce((acc, curr) => acc + curr.present, 0);
  const totalAbsent = summaryData.reduce((acc, curr) => acc + curr.absent, 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Monthly Summary</h2>
        <p className="text-xs text-slate-500 font-semibold">
          Labour attendance breakdown per month
        </p>
      </div>

      {/* Month Selector Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 flex items-center justify-between shadow-md">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-xs font-bold text-amber-400 tracking-widest block uppercase">
            SELECTED MONTH
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            {monthName} {selectedYear}
          </h3>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
          <span className="text-xs uppercase font-extrabold text-emerald-600 block mb-1">
            Total Days Present
          </span>
          <span className="text-3xl font-black text-emerald-600">{totalPresent}</span>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center">
          <span className="text-xs uppercase font-extrabold text-rose-600 block mb-1">
            Total Days Absent
          </span>
          <span className="text-3xl font-black text-rose-600">{totalAbsent}</span>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <span>Attendance Table</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {summaryData.length} Labourers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Labour Name</th>
                <th className="py-3 px-3 text-center">Present</th>
                <th className="py-3 px-3 text-center">Absent</th>
                <th className="py-3 px-3 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {summaryData.map(({ labour, present, absent, total }) => {
                const percentage = total > 0 ? ((present / total) * 100).toFixed(0) : '0';
                return (
                  <tr
                    key={labour.id}
                    onClick={() => onOpenLabourDetail(labour)}
                    className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>
                        <span>{labour.name}</span>
                        <span className="text-xs text-slate-400 font-normal block">
                          {labour.trade || 'Worker'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-full font-black text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {present}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-full font-black text-xs bg-rose-100 text-rose-800 border border-rose-200">
                        {absent}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-700">
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
