import React, { useState, useEffect } from 'react';
import { SalesTarget } from '../types';
import { BarChart3, TrendingUp, Lightbulb, Phone } from 'lucide-react';
import { getDashboardStats, getSalesTarget } from '../services/mockDatabase';
import { getAuth } from 'firebase/auth';

export const MRAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [target, setTarget] = useState<SalesTarget | null>(null);
  const [callTrend, setCallTrend] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const s = await getDashboardStats(currentUser.uid);
    setStats(s);

    const now = new Date();
    const t = await getSalesTarget(currentUser.uid, now.getMonth(), now.getFullYear());
    setTarget(t);

    // Simulate last 7 days call trend
    const trend = Array.from({ length: 7 }, () => Math.max(0, Math.round(Number(s.avgCalls) + (Math.random() * 4 - 2))));
    setCallTrend(trend);

    setLoading(false);
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="animate-pulse h-40 bg-[#0F172A]/50 border border-slate-700/50 rounded-xl"></div>
        <div className="animate-pulse h-40 bg-[#0F172A]/50 border border-slate-700/50 rounded-xl"></div>
        <div className="animate-pulse h-40 bg-[#0F172A]/50 border border-slate-700/50 rounded-xl"></div>
    </div>
  );

  const targetVal = target?.targetAmount || 1;
  const achievedVal = target?.achievedAmount || 0;
  const pct = Math.round((achievedVal / targetVal) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {/* CARD 1: Call Average Trend */}
      <div className="bg-[#0F172A]/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 blur-[60px] pointer-events-none group-hover:opacity-10 transition-opacity"></div>
        
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
          <BarChart3 size={14} className="mr-2 text-blue-500" /> Call Average (Last 7 Days)
        </h3>
        
        <div className="flex items-end justify-between h-32 gap-3">
          {callTrend.map((val, i) => (
            <div key={i} className="w-full bg-slate-800/50 rounded-t-sm relative group/bar h-full flex items-end overflow-hidden">
              <div 
                className="w-full bg-blue-600 transition-all duration-500 ease-out group-hover/bar:bg-blue-400" 
                style={{ height: `${Math.min(100, (val / 15) * 100)}%` }}
              ></div>
              
              {/* Tooltipish Value */}
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">
                {val}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-slate-500 mt-4 font-mono flex justify-center items-center gap-2">
            <Phone size={12} /> Avg: <span className="text-white font-bold">{stats?.avgCalls}</span> Calls/Day
        </div>
      </div>

      {/* CARD 2: Sales Target Donut */}
      <div className="bg-[#0F172A]/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50 relative overflow-hidden">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
          <TrendingUp size={14} className="mr-2 text-[#8B1E1E]" /> Monthly Target
        </h3>
        
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-28 w-28 rounded-full border-[6px] border-slate-800 flex items-center justify-center shadow-inner">
            {/* CSS-only Progress Arc Approximation */}
            <div 
                className={`absolute inset-0 rounded-full border-[6px] 
                ${pct >= 80 ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : pct >= 50 ? 'border-blue-500' : 'border-[#8B1E1E] shadow-[0_0_15px_rgba(139,30,30,0.4)]'} 
                border-l-transparent border-b-transparent rotate-45 transition-all duration-1000`}
            ></div>
            
            <div className="text-center z-10">
              <span className="block text-2xl font-bold text-white tracking-tighter">{pct}%</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wide">Achieved</span>
            </div>
          </div>
          
          <div className="mt-4 text-xs font-mono text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
            <span className="text-white font-bold">₹{achievedVal.toLocaleString()}</span> 
            <span className="mx-1 text-slate-600">/</span> 
            ₹{targetVal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* CARD 3: ROI Insight */}
      <div className="bg-[#0F172A]/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50 relative overflow-hidden flex flex-col">
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500 opacity-5 blur-[60px] pointer-events-none"></div>

        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
          <Lightbulb size={14} className="mr-2 text-amber-400" /> Visit ROI Insight
        </h3>
        
        <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            <span className="text-white font-semibold">Dr. Sharma (Cat A)</span> has received <span className="text-white font-bold">3 visits</span> this month but sales are down <span className="text-red-400">10%</span>.
            </p>
            
            <div className="bg-amber-900/10 p-3 rounded-lg border border-amber-900/30 text-xs text-amber-200 flex items-start gap-2">
            <TrendingUp size={14} className="mt-0.5 flex-shrink-0" />
            <span>
                <span className="font-bold uppercase text-[10px] text-amber-500 block mb-1">Recommendation</span>
                Discuss new product range "CardioPlus" in next visit to boost engagement.
            </span>
            </div>
        </div>
      </div>

    </div>
  );
};