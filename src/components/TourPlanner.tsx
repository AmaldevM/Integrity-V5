import React, { useState, useEffect } from 'react';
import { MonthlyTourPlan, TourPlanStatus, UserProfile, UserRole } from '../types';
import { getTourPlan, saveTourPlan, getAllUsers } from '../services/mockDatabase';
import { Button } from './Button';
import { getMonthName } from '../utils';
import { Calendar, Save, CheckCircle, MapPin, X, Navigation, Send } from 'lucide-react';
import { optimizeRoute } from '../services/routeOptimizer';
import { getCustomersByTerritory } from '../services/mockDatabase';
import { Customer } from '../types';

interface TourPlannerProps {
  user: UserProfile;
  canApprove: boolean; // if Admin/ASM viewing subordinate
}

export const TourPlanner: React.FC<TourPlannerProps> = ({ user, canApprove }) => {
  const [plan, setPlan] = useState<MonthlyTourPlan | null>(null);
  const [nextMonth, setNextMonth] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [suggestedRoute, setSuggestedRoute] = useState<{ date: string, customers: Customer[] } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Handle year rollover
  if (nextMonth.month > 11) {
    setNextMonth({ month: 0, year: nextMonth.year + 1 });
  }

  useEffect(() => {
    loadPlan();
    getAllUsers().then(setAllUsers);
  }, [user.uid]);

  const loadPlan = async () => {
    const p = await getTourPlan(user.uid, nextMonth.year, nextMonth.month);
    setPlan(p);
  };

  const updateEntry = (index: number, field: string, value: any) => {
    if (!plan || plan.status === TourPlanStatus.APPROVED) return;

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
    if (plan) {
      await saveTourPlan(plan);
      alert('Draft saved.');
    }
  };

  const handleSubmit = async () => {
    if (plan) {
      await saveTourPlan({ ...plan, status: TourPlanStatus.SUBMITTED });
      setPlan({ ...plan, status: TourPlanStatus.SUBMITTED });
      alert('Plan submitted for approval.');
    }
  };

  const handleApprove = async () => {
    if (plan && canApprove) {
      await saveTourPlan({ ...plan, status: TourPlanStatus.APPROVED });
      setPlan({ ...plan, status: TourPlanStatus.APPROVED });
      alert('Plan Approved.');
    }
  };

  const handleSuggestRoute = async (date: string, territoryId: string) => {
    if (!territoryId) return;
    setLoadingRoute(true);
    try {
      const customers = await getCustomersByTerritory(territoryId);
      // Mock start location (User's HQ or default)
      const startLoc = { lat: user.hqLat || 28.6139, lng: user.hqLng || 77.2090 };
      const optimized = optimizeRoute(customers, startLoc);
      setSuggestedRoute({ date, customers: optimized });
    } catch (e) {
      console.error(e);
      alert("Failed to generate route.");
    } finally {
      setLoadingRoute(false);
    }
  };

  if (!plan) return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-[#8B1E1E] rounded-full animate-spin"></div>
          Loading Plan...
      </div>
  );

  const isEditable = plan.status === TourPlanStatus.DRAFT || plan.status === TourPlanStatus.REJECTED;
  const showJointWork = canApprove || user.role !== UserRole.MR;

  return (
    <div className="bg-[#0F172A]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-120px)] relative">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B1E1E] opacity-5 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-slate-700/50 bg-slate-800/30 z-10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center tracking-tight">
            <Calendar className="mr-3 text-[#8B1E1E]" />
            Tour Plan: {getMonthName(nextMonth.month)} {nextMonth.year}
          </h2>
          <p className="text-sm text-slate-400 mt-1">Plan your territory visits and joint work.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center border uppercase tracking-wide
             ${plan.status === TourPlanStatus.APPROVED 
                ? 'bg-green-900/30 text-green-400 border-green-800' 
                : 'bg-amber-900/30 text-amber-400 border-amber-800'}
           `}>
            {plan.status}
          </span>
          {isEditable && (
            <>
              <Button size="sm" variant="outline" onClick={handleSave} className="border-slate-600 text-slate-300 hover:text-white">
                  <Save size={16} className="mr-2" /> Save Draft
              </Button>
              <Button size="sm" onClick={handleSubmit} className="bg-[#8B1E1E] hover:bg-[#a02626] text-white border-none shadow-lg shadow-red-900/20">
                  <Send size={16} className="mr-2" /> Submit
              </Button>
            </>
          )}
          {canApprove && plan.status === TourPlanStatus.SUBMITTED && (
            <Button size="sm" variant="success" onClick={handleApprove}>
                <CheckCircle size={16} className="mr-2" /> Approve Plan
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto custom-scrollbar p-0 z-0">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#020617] text-slate-400 sticky top-0 z-10 border-b border-slate-700 shadow-md">
            <tr>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider w-16">Date</th>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider w-20">Day</th>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider w-32">Activity</th>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider w-48">Territory</th>
              {showJointWork && <th className="p-4 font-semibold uppercase text-xs tracking-wider w-48">Joint Work</th>}
              <th className="p-4 font-semibold uppercase text-xs tracking-wider">Notes</th>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider w-16">Route</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {plan.entries.map((entry, idx) => {
              const date = new Date(entry.date);
              const isSunday = date.getDay() === 0;
              return (
                <tr key={entry.date} className={`transition-colors ${isSunday ? 'bg-slate-800/40' : 'hover:bg-white/5'}`}>
                  <td className="p-3 whitespace-nowrap text-slate-300 font-mono text-center">{date.getDate()}</td>
                  <td className={`p-3 whitespace-nowrap font-medium ${isSunday ? 'text-red-400' : 'text-slate-500'}`}>
                      {date.toLocaleDateString(undefined, { weekday: 'short' })}
                  </td>
                  <td className="p-3">
                    {isEditable ? (
                      <select
                        className="bg-[#020617]/50 border border-slate-600 rounded text-slate-200 p-1.5 text-xs w-full focus:ring-1 focus:ring-[#8B1E1E] outline-none"
                        value={entry.activityType}
                        onChange={(e) => updateEntry(idx, 'activityType', e.target.value)}
                      >
                        <option value="FIELD_WORK">Field Work</option>
                        <option value="MEETING">Meeting</option>
                        <option value="LEAVE">Leave</option>
                        <option value="HOLIDAY">Holiday</option>
                        <option value="ADMIN_DAY">Admin Day</option>
                      </select>
                    ) : (
                        <span className="text-slate-300 bg-slate-800 px-2 py-1 rounded text-xs">{entry.activityType.replace('_', ' ')}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {entry.activityType === 'FIELD_WORK' && (
                      isEditable ? (
                        <select
                          className="bg-[#020617]/50 border border-slate-600 rounded text-slate-200 p-1.5 text-xs w-full focus:ring-1 focus:ring-[#8B1E1E] outline-none"
                          value={entry.territoryId || ''}
                          onChange={(e) => updateEntry(idx, 'territoryId', e.target.value)}
                        >
                          <option value="">-- Select --</option>
                          {user.territories.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      ) : <span className="text-white">{entry.territoryName}</span>
                    )}
                  </td>
                  {showJointWork && (
                    <td className="p-3">
                      {entry.activityType === 'FIELD_WORK' && (
                        isEditable ? (
                          <select
                            className="bg-[#020617]/50 border border-slate-600 rounded text-slate-200 p-1.5 text-xs w-full focus:ring-1 focus:ring-[#8B1E1E] outline-none"
                            value={entry.jointWorkWithUid || ''}
                            onChange={(e) => updateEntry(idx, 'jointWorkWithUid', e.target.value)}
                          >
                            <option value="">None</option>
                            {allUsers.filter(u => u.uid !== user.uid).map(u => (
                              <option key={u.uid} value={u.uid}>{u.displayName}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-400 text-xs">{allUsers.find(u => u.uid === entry.jointWorkWithUid)?.displayName || '-'}</span>
                        )
                      )}
                    </td>
                  )}
                  <td className="p-3">
                    {isEditable ? (
                      <input
                        className="bg-[#020617]/50 border border-slate-600 rounded text-slate-200 p-1.5 text-xs w-full focus:ring-1 focus:ring-[#8B1E1E] outline-none placeholder-slate-600"
                        value={entry.notes || ''}
                        onChange={(e) => updateEntry(idx, 'notes', e.target.value)}
                        placeholder="Notes..."
                      />
                    ) : <span className="text-slate-400 text-xs italic">{entry.notes}</span>}
                  </td>
                  <td className="p-3 text-center">
                    {entry.territoryId && (
                      <button
                        title="Get Smart Route"
                        onClick={() => handleSuggestRoute(entry.date, entry.territoryId!)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
                      >
                        <Navigation size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Smart Route Modal */}
      {suggestedRoute && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-6 w-[450px] max-w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Navigation className="mr-2 text-[#8B1E1E]" size={20} />
                Smart Route Suggestion
              </h3>
              <button onClick={() => setSuggestedRoute(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 bg-slate-800/50 p-2 rounded border border-slate-700">
              Optimized sequence for <span className="text-white font-bold">{new Date(suggestedRoute.date).toLocaleDateString()}</span> based on geo-locations.
            </p>

            {suggestedRoute.customers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic border border-dashed border-slate-700 rounded-lg">
                  No customers found with location data in this territory.
              </div>
            ) : (
              <div className="space-y-0 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {suggestedRoute.customers.map((c, i) => (
                  <div key={c.id} className="flex items-start p-3 hover:bg-white/5 rounded-lg transition-colors relative group">
                    {i !== suggestedRoute.customers.length - 1 && (
                        <div className="absolute left-[19px] top-8 bottom-[-12px] w-0.5 bg-slate-700 group-hover:bg-slate-600 transition-colors"></div>
                    )}
                    <div className="bg-[#8B1E1E] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 shadow-lg shadow-red-900/30 z-10">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-medium text-slate-200 text-sm">{c.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {c.type} • Cat {c.category} • {c.specialty}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-700/50">
              <Button onClick={() => setSuggestedRoute(null)} className="bg-slate-700 hover:bg-slate-600 text-white border-none">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};