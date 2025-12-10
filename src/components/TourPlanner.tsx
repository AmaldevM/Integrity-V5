import React, { useState, useEffect } from 'react';
import { MonthlyTourPlan, TourPlanStatus, UserProfile, UserRole, TourPlanEntry } from '../types';
import { getTourPlan, saveTourPlan, getAllUsers, getCustomersByTerritory } from '../services/mockDatabase';
import { Button } from './Button';
import { getMonthName } from '../utils';
import { Calendar as CalendarIcon, Save, CheckCircle, MapPin, X, Navigation, Send, Loader2, ChevronLeft, ChevronRight, Copy, Users } from 'lucide-react';
import { Customer } from '../types';

interface TourPlannerProps {
  user: UserProfile;
  canApprove: boolean;
}

const ACTIVITY_COLORS: Record<string, string> = {
  'FIELD_WORK': 'bg-blue-600/20 text-blue-400 border-blue-600/50',
  'MEETING': 'bg-purple-600/20 text-purple-400 border-purple-600/50',
  'LEAVE': 'bg-red-600/20 text-red-400 border-red-600/50',
  'HOLIDAY': 'bg-orange-600/20 text-orange-400 border-orange-600/50',
  'ADMIN_DAY': 'bg-slate-600/20 text-slate-400 border-slate-600/50',
  'SUNDAY': 'bg-red-900/10 text-red-500/50 border-red-900/20'
};

export const TourPlanner: React.FC<TourPlannerProps> = ({ user, canApprove }) => {
  const [plan, setPlan] = useState<MonthlyTourPlan | null>(null);

  // Initialize Month State
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    // Default to next month for planning
    if (d.getMonth() === 11) return new Date(d.getFullYear() + 1, 0, 1);
    return new Date(d.getFullYear(), d.getMonth() + 1, 1);
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null); // For Modal
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlan();
    getAllUsers().then(setAllUsers);
  }, [user.uid, viewDate]);

  const loadPlan = async () => {
    setLoading(true);
    const p = await getTourPlan(user.uid, viewDate.getFullYear(), viewDate.getMonth());

    // Auto-detect Sundays
    if (p.status === TourPlanStatus.DRAFT) {
      p.entries = p.entries.map(entry => {
        if (new Date(entry.date).getDay() === 0 && entry.activityType === 'FIELD_WORK') {
          return { ...entry, activityType: 'SUNDAY' } as any;
        }
        return entry;
      });
    }
    setPlan(p);
    setLoading(false);
  };

  const updateEntry = (index: number, field: keyof TourPlanEntry, value: any) => {
    if (!plan) return;
    const newEntries = [...plan.entries];
    const entry = { ...newEntries[index] };

    if (field === 'territoryId') {
      const t = user.territories.find(ter => ter.id === value);
      entry.territoryId = value;
      entry.territoryName = t ? t.name : '';
    } else {
      (entry as any)[field] = value;
    }

    newEntries[index] = entry;
    setPlan({ ...plan, entries: newEntries });
  };

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    await saveTourPlan(plan);
    setSaving(false);
    alert('Draft saved successfully.');
  };

  const handleSubmit = async () => {
    if (!plan) return;
    if (!confirm("Submit plan for approval?")) return;
    setSaving(true);
    const updated = { ...plan, status: TourPlanStatus.SUBMITTED };
    await saveTourPlan(updated);
    setPlan(updated);
    setSaving(false);
    alert('Plan submitted!');
  };

  const handleApprove = async () => {
    if (plan && canApprove) {
      const updated = { ...plan, status: TourPlanStatus.APPROVED };
      await saveTourPlan(updated);
      setPlan(updated);
      alert('Plan Approved.');
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const copyFromPreviousDay = () => {
    if (!plan || selectedDayIndex === null || selectedDayIndex === 0) return;
    const prev = plan.entries[selectedDayIndex - 1];
    updateEntry(selectedDayIndex, 'activityType', prev.activityType);
    updateEntry(selectedDayIndex, 'territoryId', prev.territoryId);
    updateEntry(selectedDayIndex, 'jointWorkWithUid', prev.jointWorkWithUid);
    updateEntry(selectedDayIndex, 'notes', prev.notes);
  };

  // --- CALENDAR RENDER LOGIC ---
  const renderCalendarDays = () => {
    if (!plan) return null;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-[#020617]/30 border border-slate-800/50 rounded-lg opacity-50"></div>);
    }

    // Actual Days
    for (let i = 0; i < daysInMonth; i++) {
      const entry = plan.entries[i];
      if (!entry) continue;

      const date = new Date(entry.date);
      const isSunday = date.getDay() === 0;
      const isSelected = selectedDayIndex === i;

      const colorClass = ACTIVITY_COLORS[entry.activityType] || 'bg-slate-800 text-slate-400 border-slate-700';

      days.push(
        <div
          key={entry.date}
          onClick={() => setSelectedDayIndex(i)}
          className={`h-24 p-2 rounded-lg border cursor-pointer transition-all flex flex-col justify-between relative group
                      ${isSelected ? 'ring-2 ring-blue-500 bg-blue-900/10 border-blue-500 z-10' : 'border-slate-800 hover:border-slate-600 bg-[#0F172A]'}
                  `}
        >
          {/* Date Header */}
          <div className="flex justify-between items-start">
            <span className={`text-sm font-bold font-mono ${isSunday ? 'text-red-400' : 'text-slate-300'}`}>
              {i + 1}
            </span>
            {entry.territoryId && (
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
            )}
          </div>

          {/* Activity Pill */}
          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate border ${colorClass}`}>
            {entry.activityType.replace('_', ' ')}
          </div>

          {/* Territory/Notes */}
          {entry.activityType === 'FIELD_WORK' && (
            <div className="text-[9px] text-slate-400 truncate mt-1">
              {entry.territoryName || <span className="italic text-slate-600">No Territory</span>}
            </div>
          )}
          {entry.jointWorkWithUid && (
            <div className="absolute top-2 right-2 text-purple-400">
              <Users size={12} />
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  if (loading || !plan) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
      <Loader2 className="animate-spin text-[#8B1E1E]" size={32} />
      Loading Calendar...
    </div>
  );

  const isEditable = plan.status === TourPlanStatus.DRAFT || plan.status === TourPlanStatus.REJECTED;
  const showJointWork = canApprove || user.role !== UserRole.MR;
  const selectedEntry = selectedDayIndex !== null ? plan.entries[selectedDayIndex] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-[#0F172A]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden relative">

      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B1E1E] opacity-5 blur-[100px] pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-slate-700/50 bg-slate-800/30 z-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-700 rounded text-slate-400"><ChevronLeft size={18} /></button>
            <div className="px-4 font-bold text-white min-w-[140px] text-center text-sm">
              {getMonthName(viewDate.getMonth())} {viewDate.getFullYear()}
            </div>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-700 rounded text-slate-400"><ChevronRight size={18} /></button>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide
                  ${plan.status === TourPlanStatus.APPROVED ? 'bg-green-900/30 text-green-400 border-green-800' :
              plan.status === TourPlanStatus.SUBMITTED ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                'bg-amber-900/30 text-amber-400 border-amber-800'}
            `}>
            {plan.status.replace('_', ' ')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditable && (
            <>
              <Button size="sm" variant="outline" onClick={handleSave} disabled={saving} className="border-slate-600 text-slate-300 hover:text-white">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} className="mr-1.5" />} Save
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={saving} className="bg-[#8B1E1E] hover:bg-[#a02626] text-white border-none shadow-lg shadow-red-900/20">
                <Send size={14} className="mr-1.5" /> Submit
              </Button>
            </>
          )}
          {canApprove && plan.status === TourPlanStatus.SUBMITTED && (
            <Button size="sm" variant="success" onClick={handleApprove}>
              <CheckCircle size={14} className="mr-1.5" /> Approve
            </Button>
          )}
        </div>
      </div>

      {/* --- CALENDAR GRID --- */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className={`text-[10px] font-bold uppercase tracking-widest ${d === 'Sun' ? 'text-red-500' : 'text-slate-500'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
      </div>

      {/* --- EDIT MODAL (POPUP) --- */}
      {selectedEntry && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) setSelectedDayIndex(null); }}>
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Planning For</div>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <CalendarIcon size={18} className="text-[#8B1E1E]" />
                  {new Date(selectedEntry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <button onClick={() => setSelectedDayIndex(null)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {isEditable ? (
                <>
                  {/* Activity Type */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Activity Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['FIELD_WORK', 'MEETING', 'LEAVE', 'HOLIDAY', 'ADMIN_DAY', 'SUNDAY'].map(type => (
                        <button
                          key={type}
                          onClick={() => updateEntry(selectedDayIndex!, 'activityType', type as any)}
                          className={`text-xs p-2 rounded border transition-all ${selectedEntry.activityType === type
                              ? 'bg-[#8B1E1E] text-white border-[#8B1E1E] font-bold shadow-lg shadow-red-900/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                            }`}
                        >
                          {type.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Fields based on Activity */}
                  {selectedEntry.activityType === 'FIELD_WORK' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Territory</label>
                        <select
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-[#8B1E1E] outline-none"
                          value={selectedEntry.territoryId || ''}
                          onChange={(e) => updateEntry(selectedDayIndex!, 'territoryId', e.target.value)}
                        >
                          <option value="">-- Select Territory --</option>
                          {user.territories.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      {showJointWork && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Joint Work (Optional)</label>
                          <select
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-[#8B1E1E] outline-none"
                            value={selectedEntry.jointWorkWithUid || ''}
                            onChange={(e) => updateEntry(selectedDayIndex!, 'jointWorkWithUid', e.target.value)}
                          >
                            <option value="">None</option>
                            {allUsers.filter(u => u.uid !== user.uid).map(u => (
                              <option key={u.uid} value={u.uid}>{u.displayName}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Notes / Objectives</label>
                    <textarea
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-[#8B1E1E] outline-none h-20 placeholder-slate-600"
                      placeholder="Enter key objectives or remarks..."
                      value={selectedEntry.notes || ''}
                      onChange={(e) => updateEntry(selectedDayIndex!, 'notes', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                // Read-Only View for Locked/Approved Plans
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase">Activity</div>
                    <div className="text-lg font-bold text-white mt-1">{selectedEntry.activityType.replace('_', ' ')}</div>
                  </div>
                  {selectedEntry.activityType === 'FIELD_WORK' && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="text-xs text-slate-500 uppercase">Territory</div>
                      <div className="text-lg font-bold text-white mt-1">{selectedEntry.territoryName || 'N/A'}</div>
                    </div>
                  )}
                  {selectedEntry.notes && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="text-xs text-slate-500 uppercase">Notes</div>
                      <div className="text-sm text-slate-300 mt-1">{selectedEntry.notes}</div>
                    </div>
                  )}
                  <div className="text-center text-xs text-amber-500 italic mt-4">
                    Plan is locked. Contact admin to edit.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {isEditable && (
              <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-between">
                <Button size="sm" variant="ghost" onClick={copyFromPreviousDay} className="text-slate-400 hover:text-white" disabled={selectedDayIndex === 0}>
                  <Copy size={16} className="mr-2" /> Copy Prev Day
                </Button>
                <Button size="sm" onClick={() => setSelectedDayIndex(null)} className="bg-blue-600 hover:bg-blue-500 text-white border-none px-6">
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};