import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, SalesTarget, Customer } from '../types';
import { getAllUsers, getSalesTarget, setSalesTarget, getCustomersByTerritory, updateCustomerSales, getDashboardStats } from '../services/mockDatabase';
import { getDownstreamUserIds } from '../utils';
import { Button } from './Button';
import { BarChart3, TrendingUp, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, CalendarRange, Clock, Phone, Target, User, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ManagerDashboardProps {
  user: UserProfile;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user }) => {
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [targets, setTargets] = useState<Record<string, SalesTarget>>({});
  const [stats, setStats] = useState<Record<string, any>>({});

  // Aggregate State
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalAchieved, setTotalAchieved] = useState(0);

  // Sales Input State
  const [selectedMR, setSelectedMR] = useState('');
  const [mrCustomers, setMrCustomers] = useState<Customer[]>([]);
  const [selectedCust, setSelectedCust] = useState('');
  const [salesAmount, setSalesAmount] = useState(0);

  // Quarterly Target State
  const [targetUser, setTargetUser] = useState('');
  const [targetQuarter, setTargetQuarter] = useState('Q1');
  const [quarterAmount, setQuarterAmount] = useState(0);

  useEffect(() => {
    loadTeamData();
  }, [user.uid]);

  const loadTeamData = async () => {
    const all = await getAllUsers();
    let members: UserProfile[] = [];

    if (user.role === UserRole.ADMIN) {
      members = all.filter(u => u.role !== UserRole.ADMIN);
    } else {
      const subordinateIds = getDownstreamUserIds(user.uid, all);
      members = all.filter(u => subordinateIds.includes(u.uid));
    }

    setTeam(members);

    const now = new Date();
    const tMap: Record<string, SalesTarget> = {};
    const statsMap: Record<string, any> = {};
    let tTarget = 0;
    let tAchieved = 0;

    for (const m of members) {
      const t = await getSalesTarget(m.uid, now.getMonth(), now.getFullYear());
      if (t) {
        tMap[m.uid] = t;
        tTarget += t.targetAmount;
        tAchieved += t.achievedAmount;
      }
      const s = await getDashboardStats(m.uid);
      statsMap[m.uid] = s;
    }
    setTargets(tMap);
    setStats(statsMap);
    setTotalTarget(tTarget);
    setTotalAchieved(tAchieved);
  };

  const handleFetchCustomers = async (mrId: string) => {
    setSelectedMR(mrId);
    const mr = team.find(u => u.uid === mrId);
    if (mr && mr.territories.length > 0) {
      const c = await getCustomersByTerritory(mr.territories[0].id);
      setMrCustomers(c);
    } else {
      setMrCustomers([]);
    }
  };

  const handleUpdateSales = async () => {
    if (!selectedCust || salesAmount < 0) return;
    await updateCustomerSales(selectedCust, salesAmount);

    const tgt = targets[selectedMR];
    if (tgt) {
      const newAchieved = tgt.achievedAmount + salesAmount;
      const updatedTgt = { ...tgt, achievedAmount: newAchieved };
      await setSalesTarget(updatedTgt);
      setTargets(prev => ({ ...prev, [selectedMR]: updatedTgt }));
    } else {
      const now = new Date();
      const newTgt = {
        id: 'new', userId: selectedMR, month: now.getMonth(), year: now.getFullYear(),
        targetAmount: 200000, achievedAmount: salesAmount
      };
      await setSalesTarget(newTgt);
      setTargets(prev => ({ ...prev, [selectedMR]: newTgt }));
    }
    setTotalAchieved(prev => prev + salesAmount);
    alert("Sales Recorded!");
    setSalesAmount(0);
  };

  const handleSetQuarterlyTarget = async () => {
    if (!targetUser || !targetQuarter || quarterAmount <= 0) return;
    const monthlyAmount = Math.floor(quarterAmount / 3);
    const year = new Date().getFullYear();
    let startMonth = 0;
    if (targetQuarter === 'Q1') startMonth = 0;
    if (targetQuarter === 'Q2') startMonth = 3;
    if (targetQuarter === 'Q3') startMonth = 6;
    if (targetQuarter === 'Q4') startMonth = 9;

    for (let i = 0; i < 3; i++) {
      const month = startMonth + i;
      const existing = await getSalesTarget(targetUser, month, year);
      const newTgt: SalesTarget = {
        id: existing ? existing.id : `tgt_${targetUser}_${month}`,
        userId: targetUser,
        month,
        year,
        targetAmount: monthlyAmount,
        achievedAmount: existing ? existing.achievedAmount : 0
      };
      await setSalesTarget(newTgt);
    }
    alert(`Target set for ${targetQuarter}!`);
    setQuarterAmount(0);
    loadTeamData();
  };

  const overallPct = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;
  const isPositive = overallPct >= 80;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center bg-[#0F172A]/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B1E1E] opacity-10 blur-[80px] pointer-events-none"></div>
         <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white flex items-center tracking-tight">
                <PieChart className="mr-3 text-[#8B1E1E]" /> 
                Sales Dashboard
            </h2>
            <p className="text-sm text-slate-400 mt-1">Overview of team performance and targets.</p>
         </div>
      </div>

      {/* 1. Overall Trend Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Target Card */}
          <div className="bg-[#0F172A]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg hover:border-slate-600 transition-all">
            <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Target</div>
                <Target size={16} className="text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">₹{(totalTarget / 100000).toFixed(1)}L</div>
            <div className="text-xs text-slate-500 mt-1">Team Aggregate</div>
          </div>

          {/* Achievement Card */}
          <div className="bg-[#0F172A]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg hover:border-slate-600 transition-all">
            <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sales</div>
                <DollarSign size={16} className="text-[#8B1E1E]" />
            </div>
            <div className="text-2xl font-bold text-[#8B1E1E] tracking-tight">₹{(totalAchieved / 100000).toFixed(1)}L</div>
            <div className="text-xs text-slate-500 mt-1">Current Month</div>
          </div>

          {/* Percentage Card */}
          <div className="bg-[#0F172A]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg hover:border-slate-600 transition-all">
            <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Achievement %</div>
                <TrendingUp size={16} className={isPositive ? 'text-green-500' : 'text-amber-500'} />
            </div>
            <div className={`text-2xl font-bold flex items-center ${isPositive ? 'text-green-400' : 'text-amber-400'}`}>
                {overallPct}%
                {isPositive ? <ArrowUpRight size={20} className="ml-1" /> : <ArrowDownRight size={20} className="ml-1" />}
            </div>
            <div className="text-xs text-slate-500 mt-1">vs Target</div>
          </div>

          {/* Gap Card */}
          <div className="bg-[#0F172A]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg hover:border-slate-600 transition-all">
            <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deficit / Gap</div>
                <div className="h-4 w-4 rounded-full bg-slate-800 border border-slate-600"></div>
            </div>
            <div className="text-2xl font-bold text-slate-300 tracking-tight">₹{Math.max(0, totalTarget - totalAchieved).toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">To reach 100%</div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1.5. Sales vs Target Chart */}
        <div className="lg:col-span-2 bg-[#0F172A]/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 p-6">
          <h2 className="text-sm font-bold text-slate-400 flex items-center mb-6 uppercase tracking-widest">
            <BarChart3 className="mr-2 text-blue-500" size={16} />
            Team Performance Chart
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={team.map(m => ({
                  name: m.displayName.split(' ')[0],
                  Target: targets[m.uid]?.targetAmount || 0,
                  Achieved: targets[m.uid]?.achievedAmount || 0
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Target" fill="#475569" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Achieved" fill="#8B1E1E" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Quarterly Targets Input (Side Panel) */}
        {(user.role === UserRole.ADMIN || user.role === UserRole.ZM || user.role === UserRole.RM) && (
            <div className="bg-[#0F172A]/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 p-6 h-fit">
            <h2 className="text-sm font-bold text-slate-400 flex items-center mb-6 uppercase tracking-widest border-b border-slate-700/50 pb-4">
                <CalendarRange className="mr-2 text-indigo-500" size={16} />
                Set Quarterly Targets
            </h2>
            <div className="space-y-4">
                <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Employee</label>
                <div className="relative">
                    <select
                        className="w-full bg-[#020617]/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] outline-none appearance-none"
                        value={targetUser}
                        onChange={e => setTargetUser(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {team.map(t => (
                        <option key={t.uid} value={t.uid}>{t.displayName}</option>
                        ))}
                    </select>
                    <User size={16} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                </div>
                </div>
                
                <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quarter</label>
                <select
                    className="w-full bg-[#020617]/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] outline-none"
                    value={targetQuarter}
                    onChange={e => setTargetQuarter(e.target.value)}
                >
                    <option value="Q1">Q1 (Jan-Mar)</option>
                    <option value="Q2">Q2 (Apr-Jun)</option>
                    <option value="Q3">Q3 (Jul-Sep)</option>
                    <option value="Q4">Q4 (Oct-Dec)</option>
                </select>
                </div>

                <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Amount (₹)</label>
                <input
                    type="number"
                    className="w-full bg-[#020617]/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] outline-none"
                    value={quarterAmount}
                    onChange={e => setQuarterAmount(Number(e.target.value))}
                />
                </div>

                <Button 
                    onClick={handleSetQuarterlyTarget} 
                    disabled={!targetUser || quarterAmount <= 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none mt-2"
                >
                Set Target
                </Button>
            </div>
            </div>
        )}
      </div>

      {/* 2. Individual Performance Table */}
      <div className="bg-[#0F172A]/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700 bg-slate-800/30">
            <h2 className="text-sm font-bold text-slate-300 flex items-center uppercase tracking-widest">
            <TrendingUp className="mr-2 text-green-500" size={16} />
            Individual Performance
            </h2>
        </div>

        {team.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic">No team members found under your hierarchy.</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#020617] text-slate-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 font-semibold border-b border-slate-800">Employee</th>
                  <th className="p-4 font-semibold border-b border-slate-800">Role</th>
                  <th className="p-4 font-semibold border-b border-slate-800 text-center">Attendance</th>
                  <th className="p-4 font-semibold border-b border-slate-800 text-center">Avg Hours</th>
                  <th className="p-4 font-semibold border-b border-slate-800 text-center">Calls/Day</th>
                  <th className="p-4 font-semibold border-b border-slate-800">Target</th>
                  <th className="p-4 font-semibold border-b border-slate-800">Achieved</th>
                  <th className="p-4 font-semibold border-b border-slate-800 w-1/4">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {team.map(member => {
                  const t = targets[member.uid];
                  const s = stats[member.uid] || { attendancePct: 0, avgHours: 0, avgCalls: 0 };
                  const targetVal = t?.targetAmount || 0;
                  const achievedVal = t?.achievedAmount || 0;
                  const pct = targetVal > 0 ? Math.min(100, Math.round((achievedVal / targetVal) * 100)) : 0;

                  return (
                    <tr key={member.uid} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-white">{member.displayName}</td>
                      <td className="p-4"><span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase tracking-wide">{member.role}</span></td>

                      <td className="p-4 text-center">
                        <span className={`text-xs font-bold ${s.attendancePct >= 90 ? 'text-green-400' : 'text-amber-400'}`}>
                          {s.attendancePct}%
                        </span>
                      </td>
                      <td className="p-4 text-center text-xs text-slate-400 font-mono">
                         {s.avgHours}h
                      </td>
                      <td className="p-4 text-center text-xs text-slate-400 font-mono">
                         {s.avgCalls}
                      </td>

                      <td className="p-4 text-slate-500 font-mono">₹{targetVal.toLocaleString()}</td>
                      <td className="p-4 font-bold text-white font-mono">₹{achievedVal.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-[#8B1E1E]'}`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-xs font-semibold w-8 text-right text-slate-400">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Admin Sales Input (Only Admin) */}
      {user.role === UserRole.ADMIN && (
        <div className="bg-[#0F172A]/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 p-6">
          <h2 className="text-sm font-bold text-slate-400 flex items-center mb-6 uppercase tracking-widest border-b border-slate-700/50 pb-4">
            <DollarSign className="mr-2 text-[#8B1E1E]" size={16} />
            Record Sales Figures
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select MR</label>
              <select
                className="w-full bg-[#020617]/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] outline-none"
                value={selectedMR}
                onChange={e => handleFetchCustomers(e.target.value)}
              >
                <option value="">-- Select MR --</option>
                {team.filter(t => t.role === UserRole.MR).map(t => (
                  <option key={t.uid} value={t.uid}>{t.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Customer</label>
              <div className="relative">
                <select
                    className="w-full bg-[#020617]/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] outline-none appearance-none"
                    value={selectedCust}
                    onChange={e => setSelectedCust(e.target.value)}
                    disabled={!selectedMR}
                >
                    <option value="">-- Select --</option>
                    {mrCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                    ))}
                </select>
                <Search size={16} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
              <input
                type="number"
                className="w-full bg-[#020617]/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] outline-none"
                value={salesAmount}
                onChange={e => setSalesAmount(Number(e.target.value))}
              />
            </div>
            <Button 
                onClick={handleUpdateSales} 
                disabled={!selectedCust}
                className="w-full bg-[#8B1E1E] hover:bg-[#a02626] text-white border-none shadow-lg shadow-red-900/20"
            >
              Submit Sales
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};