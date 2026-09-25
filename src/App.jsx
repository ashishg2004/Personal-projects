import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getTodayDateString } from './db/database';

import Header from './components/Header';
import Navigation from './components/Navigation';

import TodayView from './views/TodayView';
import LabourView from './views/LabourView';
import HistoryView from './views/HistoryView';
import MonthlySummaryView from './views/MonthlySummaryView';

import AttendanceQuizModal from './components/AttendanceQuizModal';
import LabourModal from './components/LabourModal';
import LabourDetailModal from './components/LabourDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  
  // Date system state
  const [todayDateStr, setTodayDateStr] = useState('2026-09-23');

  // Modals state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizInitialIndex, setQuizInitialIndex] = useState(0);

  const [isLabourModalOpen, setIsLabourModalOpen] = useState(false);
  const [labourToEdit, setLabourToEdit] = useState(null);

  const [selectedLabourForDetail, setSelectedLabourForDetail] = useState(null);

  // Live Query from Dexie IndexedDB
  const labours = useLiveQuery(() => db.labours.toArray(), []) || [];
  const todayAttendances = useLiveQuery(
    () => db.attendances.where('date').equals(todayDateStr).toArray(),
    [todayDateStr]
  ) || [];

  // Map today's attendance records for fast lookup
  const todayAttendancesMap = new Map();
  todayAttendances.forEach((record) => {
    todayAttendancesMap.set(record.labour_id, record.status);
  });

  // Handlers
  const handleOpenQuiz = (index = 0) => {
    setQuizInitialIndex(index);
    setIsQuizOpen(true);
  };

  const handleOpenAddLabour = () => {
    setLabourToEdit(null);
    setIsLabourModalOpen(true);
  };

  const handleOpenEditLabour = (labour) => {
    setLabourToEdit(labour);
    setIsLabourModalOpen(true);
  };

  const handleOpenLabourDetail = (labour) => {
    setSelectedLabourForDetail(labour);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-500">
      {/* Header */}
      <Header
        currentDateStr={todayDateStr}
        onDataChanged={() => {}}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4">
        {activeTab === 'today' && (
          <TodayView
            labours={labours}
            todayAttendancesMap={todayAttendancesMap}
            todayDateStr={todayDateStr}
            onOpenQuiz={handleOpenQuiz}
            onOpenLabourDetail={handleOpenLabourDetail}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'labour' && (
          <LabourView
            labours={labours}
            onOpenAddModal={handleOpenAddLabour}
            onOpenEditModal={handleOpenEditLabour}
            onOpenLabourDetail={handleOpenLabourDetail}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            labours={labours}
            onAttendanceUpdated={() => {}}
          />
        )}

        {activeTab === 'summary' && (
          <MonthlySummaryView
            labours={labours}
            onOpenLabourDetail={handleOpenLabourDetail}
          />
        )}
      </main>

      {/* Quiz Modal */}
      <AttendanceQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        labours={labours.filter(l => l.active !== false)}
        todayAttendancesMap={todayAttendancesMap}
        todayDateStr={todayDateStr}
        initialIndex={quizInitialIndex}
        onAttendanceUpdated={() => {}}
      />

      {/* Add / Edit Labour Modal */}
      <LabourModal
        isOpen={isLabourModalOpen}
        onClose={() => setIsLabourModalOpen(false)}
        labourToEdit={labourToEdit}
        onSaved={() => {}}
      />

      {/* Individual Labour Attendance Detail Modal */}
      <LabourDetailModal
        isOpen={!!selectedLabourForDetail}
        onClose={() => setSelectedLabourForDetail(null)}
        labour={selectedLabourForDetail}
        onUpdated={() => {}}
      />

      {/* Bottom Navigation Bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
