import React from 'react';
import { CalendarCheck, Users, History, BarChart3 } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'labour', label: 'Labour', icon: Users },
    { id: 'history', label: 'History', icon: History },
    { id: 'summary', label: 'Summary', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-2 py-1.5 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-400 font-bold bg-slate-800/80'
                  : 'text-slate-400 font-medium hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
