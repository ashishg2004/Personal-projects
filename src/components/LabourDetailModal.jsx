import React, { useState, useEffect } from 'react';
import { X, User, Phone, Briefcase, Calendar, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import { db, formatDisplayDate, saveAttendanceRecord } from '../db/database';

export default function LabourDetailModal({ isOpen, onClose, labour, onUpdated }) {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: '0.0' });

  useEffect(() => {
    if (isOpen && labour) {
      loadLabourHistory();
    }
  }, [isOpen, labour]);

  const loadLabourHistory = async () => {
    if (!labour) return;

    // Fetch all attendance logs for this labour
    const records = await db.attendances
      .where('labour_id')
      .equals(labour.id)
      .toArray();

    // Sort descending by date
    records.sort((a, b) => b.date.localeCompare(a.date));

    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';

    setHistoryRecords(records);
    setStats({ total, present, absent, percentage });
  };

  const handleToggleSingleRecord = async (record) => {
    const newStatus = record.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    await saveAttendanceRecord(labour.id, newStatus, record.date);
    await loadLabourHistory();
    if (onUpdated) onUpdated();
  };

  if (!isOpen || !labour) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xl">
              {labour.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white leading-tight">
                {labour.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="text-amber-400 font-bold">{labour.id}</span>
                <span>•</span>
                <span>{labour.trade || 'Worker'}</span>
                {labour.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-300">
                      <Phone className="w-3 h-3" />
                      {labour.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 my-4 flex-shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Total Days
            </span>
            <span className="text-xl font-black text-white">{stats.total}</span>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
              Present
            </span>
            <span className="text-xl font-black text-emerald-400">{stats.present}</span>
          </div>

          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">
              Absent
            </span>
            <span className="text-xl font-black text-rose-400">{stats.absent}</span>
          </div>

          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
              Rate
            </span>
            <span className="text-xl font-black text-amber-400">{stats.percentage}%</span>
          </div>
        </div>

        {/* Calendar / Attendance Log */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2 no-scrollbar">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 sticky top-0 bg-slate-900 py-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Attendance History Log</span>
          </h3>

          {historyRecords.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm italic">
              No attendance records recorded yet.
            </div>
          ) : (
            historyRecords.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-sm font-semibold text-slate-200">
                    {formatDisplayDate(r.date, 'dayMonth')}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    {r.date.split('-')[0]}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleSingleRecord(r)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      r.status === 'PRESENT'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                    title="Click to toggle status"
                  >
                    {r.status === 'PRESENT' ? (
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
                    <Edit3 className="w-3 h-3 text-slate-400 ml-1" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <div className="pt-4 mt-2 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition-colors"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
}
