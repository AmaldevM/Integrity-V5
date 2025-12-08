import React, { useState } from 'react';
import { Rates, UserRole, UserStatus, RateConfig } from '../types';
import { Button } from './Button';
import { Settings, Save, AlertCircle, ShieldCheck } from 'lucide-react';

interface AdminSettingsProps {
  currentRates: Rates;
  onSave: (rates: Rates) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentRates, onSave }) => {
  const [rates, setRates] = useState<Rates>(currentRates);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.MR);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(UserStatus.CONFIRMED);

  const currentKey = `${selectedRole}_${selectedStatus}`;
  const config = rates[currentKey] || { hqAllowance: 0, exHqAllowance: 0, outstationAllowance: 0, kmRate: 0 };

  const handleConfigChange = (key: keyof RateConfig, value: string) => {
    const newVal = Number(value);
    setRates(prev => ({
      ...prev,
      [currentKey]: {
        ...prev[currentKey],
        [key]: newVal
      }
    }));
  };

  const roles = Object.values(UserRole).filter(r => r !== UserRole.ADMIN);

  return (
    <div className="bg-[#0F172A]/90 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-2xl max-w-5xl mx-auto relative overflow-hidden">
       {/* Background Ambient Glow */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B1E1E] opacity-5 blur-[100px] pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-8 border-b border-slate-700/50 pb-6">
        <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <Settings className="text-slate-400" size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Master Configuration</h2>
            <p className="text-slate-400 text-sm">Set global allowance rates and travel policies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Selection Panel */}
        <div className="md:col-span-1 bg-[#020617]/50 p-6 rounded-xl border border-slate-700/50 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-[#8B1E1E]" />
            <h3 className="font-bold text-slate-300 text-xs uppercase tracking-widest">Select Profile</h3>
          </div>
          
          <div className="space-y-4">
            <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">1. User Role</label>
                <select 
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] outline-none transition-all"
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as UserRole)}
                >
                {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
                </select>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">2. Status</label>
                <select 
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] outline-none transition-all"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value as UserStatus)}
                >
                <option value={UserStatus.TRAINEE}>Trainee / Probation</option>
                <option value={UserStatus.CONFIRMED}>Confirmed</option>
                </select>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 text-slate-400 text-xs rounded-lg border border-slate-700/50 flex items-start leading-relaxed">
             <AlertCircle size={14} className="mr-2 mt-0.5 flex-shrink-0 text-blue-400"/>
             Expenses for <span className="text-white font-bold mx-1">{selectedRole}</span> ({selectedStatus}) will be calculated using the rates set on the right.
          </div>
        </div>

        {/* Input Panel */}
        <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8B1E1E]"></div>
                    Configure Rates
                </h3>
                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    {selectedRole} • {selectedStatus}
                </span>
            </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Daily Allowances Column */}
              <div className="space-y-5 bg-[#020617]/30 p-5 rounded-xl border border-slate-700/30">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700 pb-2 mb-2">Daily Allowances (DA)</h4>
                
                <div className="group">
                  <label className="block text-xs font-medium text-slate-400 mb-1 group-focus-within:text-white transition-colors">HQ Allowance (₹)</label>
                  <input 
                    type="number" 
                    value={config.hqAllowance} 
                    onChange={(e) => handleConfigChange('hqAllowance', e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] outline-none transition-all placeholder-slate-600"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-xs font-medium text-slate-400 mb-1 group-focus-within:text-white transition-colors">Ex-HQ Allowance (₹)</label>
                  <input 
                    type="number" 
                    value={config.exHqAllowance} 
                    onChange={(e) => handleConfigChange('exHqAllowance', e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] outline-none transition-all placeholder-slate-600"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-xs font-medium text-slate-400 mb-1 group-focus-within:text-white transition-colors">Outstation Allowance (₹)</label>
                  <input 
                    type="number" 
                    value={config.outstationAllowance} 
                    onChange={(e) => handleConfigChange('outstationAllowance', e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] outline-none transition-all placeholder-slate-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Travel Column */}
              <div className="space-y-5 bg-[#020617]/30 p-5 rounded-xl border border-slate-700/30 h-fit">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700 pb-2 mb-2">Travel Parameters</h4>
                
                <div className="group">
                  <label className="block text-xs font-medium text-slate-400 mb-1 group-focus-within:text-white transition-colors">Rate per KM (₹)</label>
                  <input 
                    type="number" step="0.1"
                    value={config.kmRate} 
                    onChange={(e) => handleConfigChange('kmRate', e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] outline-none transition-all placeholder-slate-600"
                    placeholder="0.00"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 italic">
                    * Applied automatically to Ex-HQ and fixed distances.
                  </p>
                </div>
              </div>
           </div>
        </div>

      </div>

      <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-end">
        <Button 
            onClick={() => onSave(rates)}
            className="bg-gradient-to-r from-[#6e1212] to-[#8B1E1E] hover:from-[#8B1E1E] hover:to-[#a02626] text-white shadow-lg shadow-red-900/20 border-none px-6 py-2.5 font-bold tracking-wide"
        >
           <Save size={18} className="mr-2"/> Save Configuration
        </Button>
      </div>
    </div>
  );
};