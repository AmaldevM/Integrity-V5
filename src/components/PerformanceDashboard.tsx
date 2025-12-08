import React, { useState, useEffect } from 'react';
import { UserProfile, PerformanceMetrics, AppraisalRecord } from '../types';
import { calculatePerformanceMetrics, getAppraisals } from '../services/mockDatabase';
import { TrendingUp, Award, Calendar, CheckCircle2, AlertCircle, BarChart3, Phone, UserCheck, Map } from 'lucide-react';
import { getMonthName } from '../utils';

interface PerformanceDashboardProps {
    user: UserProfile;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ user }) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [appraisal, setAppraisal] = useState<AppraisalRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [user.uid]);

    const loadData = async () => {
        setLoading(true);
        const now = new Date();
        // Get metrics for current month
        const m = await calculatePerformanceMetrics(user.uid, now.getMonth(), now.getFullYear());
        setMetrics(m);

        // Get latest appraisal
        const appraisals = await getAppraisals(user.uid);
        if (appraisals.length > 0) {
            // Sort by date desc
            setAppraisal(appraisals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]);
        }
        setLoading(false);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-[#8B1E1E] rounded-full animate-spin"></div>
            Loading Performance Data...
        </div>
    );

    if (!metrics) return <div className="p-8 text-center text-slate-400">No data available.</div>;

    const salesPct = Math.round((metrics.salesAchieved / metrics.salesTarget) * 100);
    const projectedBonus = salesPct >= 100 ? (metrics.salesAchieved * 0.02) : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center bg-[#0F172A]/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B1E1E] opacity-10 blur-[80px] pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center tracking-tight">
                        <TrendingUp className="mr-3 text-[#8B1E1E]" />
                        My Performance Dashboard
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Track your monthly goals and achievements.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Sales Card */}
                <div className="bg-[#0F172A]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg hover:border-slate-600 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales Achievement</div>
                        <BarChart3 size={16} className={salesPct >= 100 ? 'text-green-500' : 'text-blue-500'} />
                    </div>
                    <div className={`text-3xl font-bold tracking-tight ${salesPct >= 100 ? 'text-green-400' : 'text-white'}`}>
                        {salesPct}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-mono">
                        ₹{metrics.salesAchieved.toLocaleString()} <span className="text-slate-600">/</span> ₹{metrics.salesTarget.toLocaleString()}
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ${salesPct >= 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-600'}`} 
                            style={{ width: `${Math.min(salesPct, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Calls Card */}
                <div className="bg-[#0F172A]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg hover:border-slate-600 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Call Average</div>
                        <Phone size={16} className="text-slate-500" />
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{metrics.callAverage}</div>
                    <div className="text-xs text-slate-500 mt-1">Target: 10 calls/day</div>
                    <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ${metrics.callAverage >= 10 ? 'bg-green-500' : 'bg-amber-500'}`} 
                            style={{ width: `${Math.min((metrics.callAverage / 12) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Attendance Card */}
                <div className="bg-[#0F172A]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg hover:border-slate-600 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</div>
                        <UserCheck size={16} className="text-slate-500" />
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{metrics.attendanceDays} <span className="text-sm font-normal text-slate-500">Days</span></div>
                    <div className="text-xs text-slate-500 mt-1">Working Days: 24</div>
                    <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${Math.min((metrics.attendanceDays / 24) * 100, 100)}%` }}></div>
                    </div>
                </div>

                {/* Tour Compliance Card */}
                <div className="bg-[#0F172A]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg hover:border-slate-600 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</div>
                        <Map size={16} className="text-slate-500" />
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{metrics.tourCompliance}%</div>
                    <div className="text-xs text-slate-500 mt-1">Plan vs Actual</div>
                    <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-[#8B1E1E]" style={{ width: `${Math.min(metrics.tourCompliance, 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* AI Insight & Bonus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bonus Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8B1E1E] to-[#5a1212] p-6 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                    
                    <h3 className="text-lg font-bold flex items-center mb-4 relative z-10">
                        <div className="p-1.5 bg-white/20 rounded-lg mr-2 backdrop-blur-sm">
                            <Award className="text-yellow-300" size={20} />
                        </div>
                        Projected Bonus
                    </h3>
                    
                    <div className="text-4xl font-bold mb-2 tracking-tight relative z-10">
                        ₹{projectedBonus.toLocaleString()}
                    </div>
                    
                    <p className="text-red-100 text-sm mb-4 relative z-10 leading-relaxed opacity-90">
                        {salesPct >= 100
                            ? "Excellent work! You've unlocked the 2% sales incentive based on current achievement."
                            : `You are ₹{(metrics.salesTarget - metrics.salesAchieved).toLocaleString()} away from your target to unlock bonuses.`}
                    </p>
                    
                    {salesPct < 100 && (
                        <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 text-xs border border-white/10 relative z-10 flex items-start gap-2">
                            <AlertCircle size={14} className="text-yellow-300 mt-0.5 flex-shrink-0" />
                            <span><span className="font-bold text-yellow-300">Tip:</span> Focus on your 'Category A' doctors in the next 5 days to close the gap.</span>
                        </div>
                    )}
                </div>

                {/* Latest Appraisal Status */}
                <div className="bg-[#0F172A]/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 p-6 flex flex-col">
                    <h3 className="text-sm font-bold flex items-center mb-6 text-slate-400 uppercase tracking-widest border-b border-slate-700/50 pb-4">
                        <Calendar className="mr-2 text-indigo-500" size={16} />
                        Latest Appraisal
                    </h3>
                    
                    {appraisal ? (
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-lg font-bold text-white">{getMonthName(appraisal.month)} {appraisal.year}</div>
                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Rated on {new Date(appraisal.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-4 py-1.5 rounded-lg text-sm font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                    Score: {appraisal.finalScore}/100
                                </div>
                            </div>

                            <div className="space-y-4 bg-[#020617]/40 p-4 rounded-xl border border-slate-800/50">
                                <div className="flex justify-between text-sm items-center border-b border-slate-800 pb-2">
                                    <span className="text-slate-400">Manager Rating</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <div key={star} className={`w-2 h-2 rounded-full ${star <= (appraisal.managerRating || 0) ? 'bg-yellow-400' : 'bg-slate-700'}`}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-slate-400">Admin Rating</span>
                                    <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-xs">{appraisal.adminRating || '-'}/5</span>
                                </div>
                            </div>

                            {appraisal.comments && (
                                <div className="mt-4 bg-slate-800/30 p-3 rounded-lg text-xs text-slate-300 italic border border-slate-700/50 leading-relaxed">
                                    "{appraisal.comments}"
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 py-8">
                            <AlertCircle size={32} className="mb-3 opacity-20" />
                            <p className="text-sm">No appraisal records found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};