import React, { useState } from 'react';
import { Plus, Search, User, Phone, Briefcase, Edit2, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export default function LabourView({
  labours = [],
  onOpenAddModal,
  onOpenEditModal,
  onOpenLabourDetail
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('active');

  const filteredLabours = labours.filter((labour) => {
    const matchesSearch =
      labour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (labour.trade && labour.trade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (labour.phone && labour.phone.includes(searchTerm)) ||
      (labour.id && labour.id.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterTab === 'active') return matchesSearch && labour.active !== false;
    if (filterTab === 'deactivated') return matchesSearch && labour.active === false;
    return matchesSearch;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Labour List</h2>
          <p className="text-xs text-slate-500 font-semibold">
            {labours.length} registered workers
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Labour</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, trade, or ID..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 text-xs font-semibold shadow-xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex bg-slate-200/60 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setFilterTab('active')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filterTab === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          Active ({labours.filter(l => l.active !== false).length})
        </button>
        <button
          onClick={() => setFilterTab('deactivated')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filterTab === 'deactivated' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          Deactivated ({labours.filter(l => l.active === false).length})
        </button>
        <button
          onClick={() => setFilterTab('all')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          All ({labours.length})
        </button>
      </div>

      {/* Labour List Cards */}
      {filteredLabours.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/70 shadow-xs">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Labourers Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchTerm ? `No match for "${searchTerm}"` : 'Tap "+ Add Labour" to create your first worker.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLabours.map((labour) => (
            <div
              key={labour.id}
              className={`bg-white rounded-2xl p-4 border shadow-xs transition-all flex items-center justify-between ${
                labour.active === false ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-slate-200/80 hover:border-amber-300'
              }`}
            >
              <div
                onClick={() => onOpenLabourDetail(labour)}
                className="flex items-center space-x-3.5 flex-1 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-base shadow-xs">
                  {labour.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                      {labour.name}
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/60">
                      {labour.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                    <span className="text-slate-700 font-bold">{labour.trade || 'Worker'}</span>
                    {labour.phone && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-slate-400">
                          <Phone className="w-3 h-3" />
                          {labour.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 pl-2">
                <button
                  onClick={() => onOpenEditModal(labour)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  title="Edit Labour"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
