import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, BrainCircuit } from 'lucide-react';
import { UserProfile } from '../types';

interface SmartAssistantProps {
    user: UserProfile;
}

interface Message {
    id: string;
    text: string;
    sender: 'USER' | 'BOT';
    timestamp: Date;
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: `Hi ${user.displayName.split(' ')[0]}! I'm your AI ERP Assistant. Ask me about sales, inventory, or tour plans.`, sender: 'BOT', timestamp: new Date() }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'USER', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Real AI processing simulation
        let responseText = "I'm not sure about that yet.";
        const lowerInput = userMsg.text.toLowerCase();

        try {
            if (lowerInput.includes('sales') || lowerInput.includes('target')) {
                const { getSalesTarget } = await import('../services/mockDatabase');
                // Mock import for forecasting service if it doesn't exist in your tree yet
                // const { predictSales } = await import('../services/ai/ForecastingService'); 
                
                const now = new Date();
                const target = await getSalesTarget(user.uid, now.getMonth(), now.getFullYear());
                
                // Mock forecast value for demo purposes since service might be missing
                const forecastAmount = target ? target.achievedAmount * 1.2 : 0; 

                if (target) {
                    const pct = Math.round((target.achievedAmount / target.targetAmount) * 100);
                    responseText = `You've achieved ${pct}% of your target (₹${target.achievedAmount.toLocaleString()}). My forecast suggests you'll reach ₹${forecastAmount.toLocaleString()} by month-end based on current trends.`;
                } else {
                    responseText = "I couldn't find a sales target for this month.";
                }
            } else if (lowerInput.includes('leave') || lowerInput.includes('holiday')) {
                // Mock leave data
                const approved = 2;
                const pending = 1;
                responseText = `You have ${approved} approved leaves and ${pending} pending application. Would you like to apply for a new one?`;
            } else if (lowerInput.includes('stock') || lowerInput.includes('inventory')) {
                // Mock inventory check
                responseText = `You are running low on 2 items (Sample Kits). I recommend restocking before your next tour.`;
            } else if (lowerInput.includes('plan') || lowerInput.includes('tour')) {
                responseText = `I've analyzed your territory. Visiting the 'North Zone' doctors on Monday would optimize your travel time by 15%.`;
            }
        } catch (error) {
            console.error(error);
            responseText = "I encountered an error while analyzing your data.";
        }

        const botMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'BOT', timestamp: new Date() };
        setMessages(prev => [...prev, botMsg]);
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-[#8B1E1E] hover:bg-[#a02626] text-white p-4 rounded-full shadow-[0_0_20px_rgba(139,30,30,0.5)] transition-all z-50 flex items-center justify-center hover:scale-110 active:scale-95 group"
                >
                    <Sparkles className="h-6 w-6 animate-pulse group-hover:rotate-12 transition-transform" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-[#0F172A]/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-700 overflow-hidden font-sans animate-in slide-in-from-bottom-10 fade-in duration-300">
                    
                    {/* Header */}
                    <div className="bg-slate-900/90 p-4 flex justify-between items-center text-white border-b border-slate-700">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-[#8B1E1E]/20 rounded-lg border border-[#8B1E1E]/30">
                                <Bot size={20} className="text-[#8B1E1E]" />
                            </div>
                            <div>
                                <span className="font-bold text-sm block">Tertius AI</span>
                                <span className="text-[10px] text-green-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#020617] to-[#0F172A] custom-scrollbar">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                                    msg.sender === 'USER'
                                        ? 'bg-[#8B1E1E] text-white rounded-br-sm'
                                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
                                }`}>
                                    {msg.sender === 'BOT' && (
                                        <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                            <BrainCircuit size={12} className="text-indigo-400"/> Assistant
                                        </div>
                                    )}
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900 border-t border-slate-700">
                        <div className="flex space-x-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about sales, stocks, plans..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-transparent placeholder-slate-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="bg-[#8B1E1E] hover:bg-[#a02626] text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};