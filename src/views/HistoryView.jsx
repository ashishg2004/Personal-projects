import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Calendar, Search, ChevronDown, ChevronUp, CheckCircle2, XCircle, Edit3, Download } from 'lucide-react';
import { db, formatDisplayDate, saveAttendanceRecord } from '../db/database';
import { exportAttendanceCSV } from '../utils/csvExport';

export default function HistoryView({ labours = [], onAttendanceUpdated }) {
  const [dateGroups, setDateGroups] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHistory();
  }, [labours]);

  const loadHistory = async () => {
    const allAttendances = await db.attendances.toArray();
    const labourMap = new Map(labours.map((l) => [l.id, l]));

    // Group by Date
    const groups = new Map();

    allAttendances.forEach((record) => {
      if (!groups.has(record.date)) {
        groups.set(record.date, []);
      }
      const labour = labourMap.get(record.labour_id);
      groups.get(record.date).push({
        ...record,
        labourName: labour ? labour.name : 'Unknown Labour',
        labourTrade: labour ? labour.trade : 'Worker',
        labourActive: labour ? labour.active : true
      });
    });

    // Convert to sorted array descending by date
    const sortedDates = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

    const formattedGroups = sortedDates.map((dateStr) => {
      const records = groups.get(dateStr);
      const total = records.length;
      const present = records.filter((r) => r.status === 'PRESENT').length;
      const absent = records.filter((r) => r.status === 'ABSENT').length;

      return {
        date: dateStr,
        total,
        present,
        absent,
        records
      };
    });

    setDateGroups(formattedGroups);
    if (formattedGroups.length > 0 && !expandedDate) {
      setExpandedDate(formattedGroups[0].date); // Auto-expand latest date
    }
  };

  const handleToggleStatus = async (labourId, currentDate, currentStatus) => {
    const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    await saveAttendanceRecord(labourId, newStatus, currentDate);
    await loadHistory();
    if (onAttendanceUpdated) onAttendanceUpdated();
  };

  // Filter groups based on search term
  const filteredGroups = dateGroups.filter((group) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const dateFormatted = formatDisplayDate(group.date, 'full').toLowerCase();

    // Check if date or any labour name in that date matches search
    const dateMatch = group.date.includes(search) || dateFormatted.includes(search);
    const labourMatch = group.records.some((r) =>
      r.labourName.toLowerCase().includes(search)
    );

    return dateMatch || labourMatch;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Attendance History</h2>
          <p className="text-xs text-slate-500 font-semibold">
            Date-wise daily logs & record modifications
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search history by date or labour name..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm font-semibold shadow-sm"
        />
      </div>

      {/* Date Cards Accordion */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm">
          <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-base">No History Records Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Mark attendance for today to build your history log.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group) => {
            const isExpanded = expandedDate === group.date;

            return (
              <div
                key={group.date}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedDate(isExpanded ? null : group.date)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {formatDisplayDate(group.date, 'full')}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold">
                        Total Labour: {group.total}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-xs font-black">
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                        {group.present} P
                      </span>
                      <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                        {group.absent} A
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Labour Records ({group.records.length})
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportAttendanceCSV(group.date);
                        }}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Date CSV</span>
                      </button>
                    </div>

                    <div className="divide-y divide-slate-200/60 bg-white rounded-2xl border border-slate-200 p-2 max-h-80 overflow-y-auto no-scrollbar">
                      {group.records.map((record) => (
                        <div
                          key={record.id}
                          className="py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {record.labourName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {record.labourTrade}
                            </span>
                          </div>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() =>
                              handleToggleStatus(record.labour_id, record.date, record.status)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                              record.status === 'PRESENT'
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                : 'bg-rose-500 text-white shadow-rose-500/20'
                            }`}
                            title="Tap to change Present/Absent"
                          >
                            {record.status === 'PRESENT' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Present</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Absent</span>
                              </>
                            )}
                            <Edit3 className="w-3 h-3 text-slate-200 ml-0.5 opacity-80" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
