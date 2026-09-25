import React, { useState, useEffect } from 'react';
import { X, User, Phone, Briefcase, Trash2, Power } from 'lucide-react';
import { addLabour, updateLabour, toggleLabourActive, deleteLabour } from '../db/database';

const TRADE_PRESETS = [
  'Mason',
  'Helper',
  'Carpenter',
  'Plumber',
  'Electrician',
  'Welder',
  'Bar Bending',
  'Tile Fitter',
  'Painter',
  'Supervisor'
];

export default function LabourModal({ isOpen, onClose, labourToEdit = null, onSaved }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState('Mason');
  const [customTrade, setCustomTrade] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (labourToEdit) {
      setName(labourToEdit.name || '');
      setPhone(labourToEdit.phone || '');
      if (TRADE_PRESETS.includes(labourToEdit.trade)) {
        setTrade(labourToEdit.trade);
        setCustomTrade('');
      } else {
        setTrade('Other');
        setCustomTrade(labourToEdit.trade || '');
      }
    } else {
      setName('');
      setPhone('');
      setTrade('Mason');
      setCustomTrade('');
    }
    setError('');
  }, [isOpen, labourToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Labour Name is required');
      return;
    }

    const finalTrade = trade === 'Other' ? (customTrade.trim() || 'Worker') : trade;

    if (labourToEdit) {
      await updateLabour(labourToEdit.id, {
        name: name.trim(),
        phone: phone.trim(),
        trade: finalTrade
      });
    } else {
      await addLabour({
        name: name.trim(),
        phone: phone.trim(),
        trade: finalTrade
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  const handleToggleActive = async () => {
    if (!labourToEdit) return;
    const actionStr = labourToEdit.active ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${actionStr} ${labourToEdit.name}?`)) {
      await toggleLabourActive(labourToEdit.id, labourToEdit.active);
      if (onSaved) onSaved();
      onClose();
    }
  };

  const handleDeletePermanent = async () => {
    if (!labourToEdit) return;
    if (confirm(`Are you sure you want to PERMANENTLY DELETE ${labourToEdit.name}?\n\nThis will remove their profile and all attendance records.`)) {
      await deleteLabour(labourToEdit.id);
      if (onSaved) onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold tracking-tight">
            {labourToEdit ? 'Edit Labour Details' : 'Add New Labour'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Labour Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Labour Name <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Raj Kumar"
                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-base font-semibold"
                autoFocus
              />
            </div>
          </div>

          {/* Trade / Work Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Trade / Work Type
            </label>
            <div className="relative">
              <Briefcase className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 text-base font-semibold appearance-none"
              >
                {TRADE_PRESETS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="Other">Other...</option>
              </select>
            </div>
          </div>

          {trade === 'Other' && (
            <div>
              <input
                type="text"
                value={customTrade}
                onChange={(e) => setCustomTrade(e.target.value)}
                placeholder="Enter custom trade..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>
          )}

          {/* Phone Number (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-base font-semibold"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              {labourToEdit && (
                <button
                  type="button"
                  onClick={handleToggleActive}
                  className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-colors ${
                    labourToEdit.active
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{labourToEdit.active ? 'Deactivate' : 'Activate'}</span>
                </button>
              )}

              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-base shadow-md active:scale-98 transition-all"
              >
                {labourToEdit ? 'Save Changes' : 'Add Labour'}
              </button>
            </div>

            {labourToEdit && (
              <button
                type="button"
                onClick={handleDeletePermanent}
                className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Labour Permanently</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
