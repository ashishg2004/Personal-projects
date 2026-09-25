import React from 'react';
import { CalendarCheck, Play, CheckCircle2, Users, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { formatDisplayDate } from '../db/database';

export default function TodayView({
  labours = [],
  todayAttendancesMap = new Map(),
  todayDateStr,
  onOpenQuiz,
  onOpenLabourDetail,
  onSwitchTab
}) {
  const activeLabours = labours.filter(l => l.active !== false);
  const totalLaboursCount = activeLabours.length;

  let presentCount = 0;
  let absentCount = 0;

  activeLabours.forEach((l) => {
    const status = todayAttendancesMap.get(l.id);
    if (status === 'PRESENT') presentCount++;
    else if (status === 'ABSENT') absentCount++;
  });

  const markedCount = presentCount + absentCount;
  const isCompleted = totalLaboursCount > 0 && markedCount >= totalLaboursCount;

  // Find first unmarked labour index
  const firstUnmarkedIndex = activeLabours.findIndex(l => !todayAttendancesMap.has(l.id));

  return (
    <div className="space-y-4 pb-20">
      {/* Today Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block mb-1">
              TODAY'S ATTENDANCE
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {formatDisplayDate(todayDateStr, 'full')}
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Completed</span>
            </div>
          )}
        </div>

        {/* Progress Bar & Status */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 mb-5">
          <div className="flex justify-between items-center text-xs font-bold mb-2.5">
            <span className="text-slate-300">Daily Progress</span>
            <span className="text-amber-400 font-extrabold">
              {markedCount} of {totalLaboursCount} completed
            </span>
          </div>

          {/* Bar */}
          <div className="w-full bg-slate-950/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-amber-400 to-amber-500'
              }`}
              style={{
                width: `${totalLaboursCount > 0 ? (markedCount / totalLaboursCount) * 100 : 0}%`
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-700/50 text-center">
            <div className="bg-emerald-500/10 rounded-2xl py-2.5 px-3 border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                Present Today
              </span>
              <span className="text-2xl font-black text-emerald-300">{presentCount}</span>
            </div>
            <div className="bg-rose-500/10 rounded-2xl py-2.5 px-3 border border-rose-500/20">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-0.5">
                Absent Today
              </span>
              <span className="text-2xl font-black text-rose-300">{absentCount}</span>
            </div>
          </div>
        </div>

        {/* Primary Call To Action Button */}
        {totalLaboursCount === 0 ? (
          <div className="text-center py-5 bg-slate-800/60 rounded-2xl border border-slate-700/70">
            <p className="text-xs text-slate-300 mb-3 font-medium">No labourers added yet.</p>
            <button
              onClick={() => onSwitchTab('labour')}
              className="py-2.5 px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs tracking-wide"
            >
              + Add Labourers First
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenQuiz(firstUnmarkedIndex >= 0 ? firstUnmarkedIndex : 0)}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all transform active:scale-98 shadow-md ${
              isCompleted
                ? 'bg-slate-800 hover:bg-slate-700/90 text-amber-400 border border-amber-500/30'
                : markedCount > 0
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>
              {isCompleted
                ? "VIEW / EDIT TODAY'S ATTENDANCE"
                : markedCount > 0
                ? `RESUME ATTENDANCE (LABOUR ${markedCount + 1})`
                : "MARK TODAY'S ATTENDANCE"}
            </span>
          </button>
        )}
      </div>

      {/* Quick Summary list of today's labourers with pastel tags */}
      {totalLaboursCount > 0 && (
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-200/70">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span>Today's Labour List</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {markedCount} Marked
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1 no-scrollbar">
            {activeLabours.map((labour) => {
              const status = todayAttendancesMap.get(labour.id);
              return (
                <div
                  key={labour.id}
                  onClick={() => onOpenLabourDetail(labour)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 rounded-2xl px-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                      {labour.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {labour.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {labour.trade || 'Worker'}
                      </p>
                    </div>
                  </div>

                  <div>
                    {status === 'PRESENT' ? (
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        PRESENT
                      </span>
                    ) : status === 'ABSENT' ? (
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/70">
                        ABSENT
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200/60">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
