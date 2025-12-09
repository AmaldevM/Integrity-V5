import React, { useState, useEffect } from 'react';
import { UserProfile, AppraisalRecord, PerformanceMetrics } from '../types';
import { getAllUsers, saveAppraisal, calculatePerformanceMetrics } from '../services/mockDatabase';
import { Button } from './Button';
import { Search, Star, Save, X, User, TrendingUp, Phone, CalendarCheck, Award } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const AdminAppraisalView: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [rating, setRating] = useState(0);
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAllUsers().then(setUsers);
    }, []);

    const handleSelectUser = async (user: UserProfile) => {
        setSelectedUser(user);
        setLoading(true);
        const now = new Date();
        // Calculate metrics for previous month
        const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

        const m = await calculatePerformanceMetrics(user.uid, month, year);
        setMetrics(m);
        setRating(0);
        setComments('');
        setLoading(false);
    };

    const handleSubmitAppraisal = async () => {
        if (!selectedUser || !metrics) return;

        const now = new Date();
        const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

        // Calculate Final Score (Weighted)
        const salesScore = Math.min((metrics.salesAchieved / metrics.salesTarget) * 100, 120); 
        const callScore = Math.min((metrics.callAverage / 10) * 100, 120);
        const attScore = Math.min((metrics.attendanceDays / 24) * 100, 100);
        const compScore = metrics.tourCompliance;

        // Base score (max 80 points)
        const dataScore = (salesScore * 0.4) + (callScore * 0.3) + (attScore * 0.2) + (compScore * 0.1);

        // Rating score (max 20 points)
        const ratingScore = (rating / 5) * 20;

        const finalScore = Math.round(dataScore * 0.8 + ratingScore);

        const record: AppraisalRecord = {
            id: uuidv4(),
            userId: selectedUser.uid,
            month,
            year,
            metrics,
            adminRating: rating,
            comments,
            finalScore,
            createdAt: new Date().toISOString()
        };

        await saveAppraisal(record);
        alert(`Appraisal submitted for ${selectedUser.displayName}. Score: ${finalScore}/100`);
        setSelectedUser(null);
    };

    return (
        <div className="max-w-7xl mx-auto p-2">
            <h2 className="text-2xl font-bold mb-6 text-white tracking-tight flex items-center gap-3">
                <Award className="text-[#8B1E1E]" /> 
                Staff Performance Appraisal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* ----------------- User List Sidebar ----------------- */}
                <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-4 h-[calc(100vh-180px)] overflow-hidden flex flex-col">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            className="w-full bg-[#020617]/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] placeholder-slate-600 transition-all"
                        />
                    </div>
                    <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {users.map(u => (
                            <div
                                key={u.uid}
                                onClick={() => handleSelectUser(u)}
                                className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-200 border ${
                                    selectedUser?.uid === u.uid 
                                    ? 'bg-[#8B1E1E]/10 border-[#8B1E1E]/50 shadow-[0_0_15px_rgba(139,30,30,0.1)]' 
                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-slate-700'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${selectedUser?.uid === u.uid ? 'bg-[#8B1E1E] text-white' : 'bg-slate-800 text-slate-400'}`}>
                                    {u.displayName.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <div className={`font-medium truncate ${selectedUser?.uid === u.uid ? 'text-white' : 'text-slate-300'}`}>
                                        {u.displayName}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">{u.role} • {u.hqLocation || 'HQ'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ----------------- Appraisal Form Area ----------------- */}
                <div className="md:col-span-2">
                    {selectedUser && metrics ? (
                        <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden h-full">
                             {/* Ambient Glow */}
                             <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B1E1E] opacity-10 blur-[100px] pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-2xl font-bold text-slate-300 shadow-inner">
                                        {selectedUser.displayName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{selectedUser.displayName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8B1E1E]/20 text-red-200 border border-[#8B1E1E]/30 uppercase tracking-wider">
                                                {selectedUser.role}
                                            </span>
                                            <span className="text-slate-500 text-sm">Appraisal for Last Month</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-lg hover:bg-white/10">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
                                {/* Sales Card */}
                                <div className="bg-[#020617]/40 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={14} className="text-green-400" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales</span>
                                    </div>
                                    <div className="font-bold text-xl text-white">₹{metrics.salesAchieved.toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Target: ₹{metrics.salesTarget.toLocaleString()}</div>
                                </div>

                                {/* Calls Card */}
                                <div className="bg-[#020617]/40 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Phone size={14} className="text-blue-400" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calls/Day</span>
                                    </div>
                                    <div className="font-bold text-xl text-white">{metrics.callAverage}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Avg per working day</div>
                                </div>

                                {/* Attendance Card */}
                                <div className="bg-[#020617]/40 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CalendarCheck size={14} className="text-purple-400" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</span>
                                    </div>
                                    <div className="font-bold text-xl text-white">{metrics.attendanceDays} <span className="text-sm font-normal text-slate-400">Days</span></div>
                                    <div className="text-[10px] text-slate-500 mt-1">Present this month</div>
                                </div>

                                {/* Compliance Card */}
                                <div className="bg-[#020617]/40 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award size={14} className="text-[#8B1E1E]" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</span>
                                    </div>
                                    <div className="font-bold text-xl text-white">{metrics.tourCompliance}%</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Tour plan adherence</div>
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-700/50 mb-8"></div>

                            {/* Rating Section */}
                            <div className="mb-8 relative z-10">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Manager Rating</label>
                                <div className="inline-flex items-center gap-4 bg-[#020617]/30 p-4 rounded-xl border border-slate-800">
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={`p-1 rounded-full transition-all transform hover:scale-110 ${rating >= star ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-slate-700 hover:text-slate-500'}`}
                                            >
                                                <Star size={32} fill={rating >= star ? "currentColor" : "none"} strokeWidth={1.5} />
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-slate-400 text-sm font-medium border-l border-slate-700 pl-4 ml-2">
                                        {rating === 0 ? 'Not Rated' : rating === 5 ? 'Exceptional' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Needs Improvement' : 'Unsatisfactory'}
                                    </span>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="mb-8 relative z-10">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Qualitative Feedback</label>
                                <textarea
                                    className="w-full bg-[#020617]/50 border border-slate-700 rounded-xl p-4 text-white focus:ring-1 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] focus:outline-none placeholder-slate-600 min-h-[120px] resize-none shadow-inner text-sm"
                                    placeholder="Enter detailed feedback regarding their performance, strengths, and areas for improvement..."
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex justify-end relative z-10">
                                <Button 
                                    onClick={handleSubmitAppraisal} 
                                    disabled={rating === 0}
                                    className="bg-gradient-to-r from-[#6e1212] to-[#8B1E1E] hover:from-[#8B1E1E] hover:to-[#a02626] text-white shadow-lg shadow-red-900/30 border-none px-8 py-3 h-auto text-sm font-bold uppercase tracking-wide"
                                >
                                    <Save size={18} className="mr-2" />
                                    Submit Appraisal
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#0F172A]/40 backdrop-blur-md border border-dashed border-slate-700 rounded-2xl h-full flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
                            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <User size={40} className="text-slate-600" />
                            </div>
                            <p className="text-lg font-medium text-slate-400">No Employee Selected</p>
                            <p className="text-sm mt-1 opacity-60">Select a staff member from the list to start their appraisal.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};