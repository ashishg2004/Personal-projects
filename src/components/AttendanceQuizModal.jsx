import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, X, User, Sparkles, Check, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveAttendanceRecord, formatDisplayDate } from '../db/database';

export default function AttendanceQuizModal({
  isOpen,
  onClose,
  labours = [],
  todayAttendancesMap = new Map(),
  todayDateStr,
  initialIndex = 0,
  onAttendanceUpdated
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [completedStats, setCompletedStats] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [localMap, setLocalMap] = useState(new Map());

  useEffect(() => {
    if (isOpen) {
      setLocalMap(new Map(todayAttendancesMap));
      setCurrentIndex(initialIndex);
      setCompletedStats(null);
    }
  }, [isOpen]);

  if (!isOpen || labours.length === 0) return null;

  const currentLabour = labours[currentIndex];
  const totalCount = labours.length;
  const isFinished = currentIndex >= totalCount;

  // Handle Marking Attendance (PRESENT / ABSENT)
  const handleSelectStatus = async (status) => {
    if (animating || !currentLabour) return;

    setAnimating(true);

    // Save immediately to DB
    await saveAttendanceRecord(currentLabour.id, status, todayDateStr);

    // Update local state map
    const updatedMap = new Map(localMap);
    updatedMap.set(currentLabour.id, status);
    setLocalMap(updatedMap);

    if (onAttendanceUpdated) {
      onAttendanceUpdated();
    }

    // Auto move to next after slight tactile feedback delay (150ms)
    setTimeout(() => {
      setAnimating(false);
      if (currentIndex + 1 < totalCount) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Calculate final stats
        let p = 0;
        let a = 0;
        labours.forEach(l => {
          const st = updatedMap.get(l.id);
          if (st === 'PRESENT') p++;
          else if (st === 'ABSENT') a++;
        });

        setCompletedStats({ present: p, absent: a, total: labours.length });
        setCurrentIndex(totalCount); // trigger finish view

        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {
          // fallback if canvas confetti fails
        }
      }
    }, 150);
  };

  const currentStatus = currentLabour ? localMap.get(currentLabour.id) : null;
  const markedCount = Array.from(localMap.values()).filter(v => v === 'PRESENT' || v === 'ABSENT').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-between p-4 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between py-2 text-white">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
            Quiz Mode
          </span>
          <span className="text-xs text-slate-300 font-medium">
            {formatDisplayDate(todayDateStr, 'short')}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Close Quiz"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Card Content */}
      <div className="max-w-md w-full mx-auto my-auto py-4">
        {!isFinished && currentLabour ? (
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-7 shadow-2xl text-white quiz-card-enter flex flex-col justify-between min-h-[460px] relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Progress */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[11px] font-black text-amber-400 tracking-wider uppercase">
                  LABOUR {currentIndex + 1} OF {totalCount}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {markedCount} / {totalCount} completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-6 p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
                />
              </div>

              {/* Question & Avatar */}
              <div className="text-center my-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-800 border-2 border-slate-700/80 flex items-center justify-center text-amber-400 mb-4 shadow-inner relative">
                  <User className="w-10 h-10" />
                  {currentStatus && (
                    <div
                      className={`absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-slate-900 ${
                        currentStatus === 'PRESENT' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {currentStatus === 'PRESENT' ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
                    </div>
                  )}
                </div>

                <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1">
                  {currentLabour.trade || 'General Worker'}
                </p>
                <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                  {currentLabour.name}
                </h2>
                <p className="text-slate-300 font-semibold text-base">
                  "{currentLabour.name} present today?"
                </p>
              </div>
            </div>

            {/* PRESENT / ABSENT Pastel Buttons */}
            <div className="space-y-3.5 my-4">
              <button
                onClick={() => handleSelectStatus('PRESENT')}
                className={`w-full py-4 px-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg ${
                  currentStatus === 'PRESENT'
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                }`}
              >
                <CheckCircle2 className="w-7 h-7" />
                <span>PRESENT</span>
              </button>

              <button
                onClick={() => handleSelectStatus('ABSENT')}
                className={`w-full py-4 px-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg ${
                  currentStatus === 'ABSENT'
                    ? 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                }`}
              >
                <XCircle className="w-7 h-7" />
                <span>ABSENT</span>
              </button>
            </div>

            {/* Navigation Bottom Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-bold">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 py-1 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={currentIndex >= totalCount - 1}
                onClick={() => setCurrentIndex(prev => Math.min(totalCount - 1, prev + 1))}
                className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 py-1 px-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Finished Quiz Summary Card */
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-center shadow-2xl text-white quiz-card-enter">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 animate-bounce" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              Today's attendance completed ✓
            </h2>
            <p className="text-slate-400 text-xs font-semibold mb-6">
              All {labours.length} labourers recorded for {formatDisplayDate(todayDateStr, 'short')}
            </p>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <span className="text-[11px] uppercase font-black text-emerald-400 block mb-1">
                  Present
                </span>
                <span className="text-4xl font-black text-emerald-400">
                  {completedStats ? completedStats.present : Array.from(localMap.values()).filter(v => v === 'PRESENT').length}
                </span>
              </div>

              <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 text-center">
                <span className="text-[11px] uppercase font-black text-rose-400 block mb-1">
                  Absent
                </span>
                <span className="text-4xl font-black text-rose-400">
                  {completedStats ? completedStats.absent : Array.from(localMap.values()).filter(v => v === 'ABSENT').length}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-base shadow-lg active:scale-98 transition-all"
            >
              Done & Return Home
            </button>
          </div>
        )}
      </div>

      <div />
    </div>
  );
}
