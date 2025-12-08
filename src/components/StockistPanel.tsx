import React, { useState, useEffect } from 'react';
import { Stockist, PrimarySale, SecondarySale } from '../types';
import { getStockists, saveStockist, recordPrimarySale, recordSecondarySale } from '../services/mockDatabase';
import { MOCK_INVENTORY_ITEMS } from '../constants';
import { Plus, Package, TrendingUp, Truck, Store, MapPin, Search, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from './Button';

export const StockistPanel: React.FC = () => {
    const [stockists, setStockists] = useState<Stockist[]>([]);
    const [selectedStockist, setSelectedStockist] = useState<Stockist | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPrimaryModal, setShowPrimaryModal] = useState(false);
    const [showSecondaryModal, setShowSecondaryModal] = useState(false);

    // Form States
    const [newStockistName, setNewStockistName] = useState('');
    const [saleItems, setSaleItems] = useState<{ itemId: string; quantity: number }[]>([{ itemId: '', quantity: 0 }]);

    useEffect(() => {
        loadStockists();
    }, []);

    const loadStockists = async () => {
        const data = await getStockists();
        setStockists(data);
    };

    const handleAddStockist = async () => {
        if (!newStockistName) return;
        const newStockist: Stockist = {
            id: uuidv4(),
            name: newStockistName,
            territoryId: 'TERR-001', // Mock default
            currentStock: {}
        };
        await saveStockist(newStockist);
        setNewStockistName('');
        setShowAddModal(false);
        loadStockists();
    };

    const handlePrimarySale = async () => {
        if (!selectedStockist) return;
        const totalAmount = saleItems.reduce((sum, item) => {
            const product = MOCK_INVENTORY_ITEMS.find(i => i.id === item.itemId);
            return sum + (product ? product.unitPrice * item.quantity : 0);
        }, 0);

        const sale: PrimarySale = {
            id: uuidv4(),
            date: new Date().toISOString(),
            stockistId: selectedStockist.id,
            items: saleItems.map(i => {
                const p = MOCK_INVENTORY_ITEMS.find(prod => prod.id === i.itemId);
                return { ...i, rate: p?.unitPrice || 0, amount: (p?.unitPrice || 0) * i.quantity };
            }),
            totalAmount,
            status: 'APPROVED'
        };

        await recordPrimarySale(sale);
        setShowPrimaryModal(false);
        setSaleItems([{ itemId: '', quantity: 0 }]);
        loadStockists();
        const updated = (await getStockists()).find(s => s.id === selectedStockist.id);
        setSelectedStockist(updated || null);
    };

    const handleSecondarySale = async () => {
        if (!selectedStockist) return;
        const totalAmount = saleItems.reduce((sum, item) => {
            const product = MOCK_INVENTORY_ITEMS.find(i => i.id === item.itemId);
            return sum + (product ? product.unitPrice * item.quantity : 0);
        }, 0);

        const sale: SecondarySale = {
            id: uuidv4(),
            date: new Date().toISOString(),
            stockistId: selectedStockist.id,
            customerId: 'CUST-001',
            mrId: 'MR-001', 
            items: saleItems.map(i => {
                const p = MOCK_INVENTORY_ITEMS.find(prod => prod.id === i.itemId);
                return { ...i, rate: p?.unitPrice || 0, amount: (p?.unitPrice || 0) * i.quantity };
            }),
            totalAmount
        };

        await recordSecondarySale(sale);
        setShowSecondaryModal(false);
        setSaleItems([{ itemId: '', quantity: 0 }]);
        loadStockists();
        const updated = (await getStockists()).find(s => s.id === selectedStockist.id);
        setSelectedStockist(updated || null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center bg-[#0F172A]/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B1E1E] opacity-10 blur-[80px] pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-white flex items-center tracking-tight">
                        <Store className="mr-3 text-[#8B1E1E]" /> 
                        Stockist Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Manage stockists, primary billing, and secondary sales.</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="bg-[#8B1E1E] hover:bg-[#a02626] text-white border-none shadow-lg relative z-10">
                    <Plus size={20} className="mr-2" /> Add Stockist
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Stockist List */}
                <div className="bg-[#0F172A]/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
                        <Search size={16} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Select Stockist</span>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {stockists.map(s => (
                            <div
                                key={s.id}
                                onClick={() => setSelectedStockist(s)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                    selectedStockist?.id === s.id 
                                    ? 'bg-[#8B1E1E]/20 border-[#8B1E1E]/50' 
                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-slate-700'
                                }`}
                            >
                                <div className={`font-bold ${selectedStockist?.id === s.id ? 'text-white' : 'text-slate-300'}`}>{s.name}</div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <MapPin size={10} /> Territory: {s.territoryId}
                                </div>
                            </div>
                        ))}
                        {stockists.length === 0 && <div className="p-8 text-center text-slate-500 italic">No stockists found</div>}
                    </div>
                </div>

                {/* Details Panel */}
                <div className="md:col-span-2">
                    {selectedStockist ? (
                        <div className="bg-[#0F172A]/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 p-6 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-8 border-b border-slate-700/50 pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{selectedStockist.name}</h2>
                                    <div className="text-xs font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded w-fit border border-slate-800">
                                        ID: {selectedStockist.id}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowPrimaryModal(true)}
                                        className="px-4 py-2 bg-green-900/20 text-green-400 border border-green-900/50 rounded-lg text-sm font-bold hover:bg-green-900/40 transition-colors flex items-center gap-2"
                                    >
                                        <Truck size={16} /> Primary Billing (In)
                                    </button>
                                    <button
                                        onClick={() => setShowSecondaryModal(true)}
                                        className="px-4 py-2 bg-purple-900/20 text-purple-400 border border-purple-900/50 rounded-lg text-sm font-bold hover:bg-purple-900/40 transition-colors flex items-center gap-2"
                                    >
                                        <TrendingUp size={16} /> Secondary Sales (Out)
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                <Package size={14} className="text-[#8B1E1E]" /> Current Inventory Status
                            </h3>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
                                {Object.entries(selectedStockist.currentStock).map(([itemId, qty]) => {
                                    const item = MOCK_INVENTORY_ITEMS.find(i => i.id === itemId);
                                    return (
                                        <div key={itemId} className="p-4 bg-[#020617]/40 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors group">
                                            <div className="text-sm font-medium text-slate-300 group-hover:text-white mb-2 truncate" title={item?.name}>{item?.name || itemId}</div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-2xl font-bold text-white tracking-tight">{qty}</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold bg-slate-900 px-1.5 py-0.5 rounded">Units</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {Object.keys(selectedStockist.currentStock).length === 0 && (
                                    <div className="col-span-3 py-12 text-center text-slate-500 bg-[#020617]/20 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center">
                                        <Package size={32} className="mb-3 opacity-20" />
                                        No stock available. Record a Primary Sale to add inventory.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-[#0F172A]/40 rounded-2xl border border-dashed border-slate-800 min-h-[400px]">
                            <Store size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-400">No Stockist Selected</p>
                            <p className="text-sm mt-1 opacity-60">Select a stockist from the list to view details.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Stockist Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-6 w-96 max-w-full shadow-2xl relative">
                        <h3 className="text-lg font-bold text-white mb-6">Add New Stockist</h3>
                        <input
                            type="text"
                            placeholder="Stockist Name"
                            className="w-full bg-[#020617] border border-slate-600 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] outline-none mb-6 placeholder-slate-500"
                            value={newStockistName}
                            onChange={e => setNewStockistName(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">Cancel</Button>
                            <Button onClick={handleAddStockist} className="bg-[#8B1E1E] text-white hover:bg-[#a02626]">Save Stockist</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Primary/Secondary Sale Modal */}
            {(showPrimaryModal || showSecondaryModal) && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-6 w-[500px] max-w-full shadow-2xl max-h-[90vh] flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-800">
                            {showPrimaryModal ? <Truck size={20} className="text-green-500" /> : <TrendingUp size={20} className="text-purple-500" />}
                            {showPrimaryModal ? 'Record Primary Sale' : 'Record Secondary Sale'}
                        </h3>

                        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2 mb-6">
                            {saleItems.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center bg-[#020617]/50 p-3 rounded-xl border border-slate-800">
                                    <div className="flex-1">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Product</div>
                                        <select
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-[#8B1E1E] outline-none"
                                            value={item.itemId}
                                            onChange={e => {
                                                const newItems = [...saleItems];
                                                newItems[idx].itemId = e.target.value;
                                                setSaleItems(newItems);
                                            }}
                                        >
                                            <option value="">Select Product</option>
                                            {MOCK_INVENTORY_ITEMS.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Quantity</div>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-center text-white text-sm focus:border-[#8B1E1E] outline-none"
                                            value={item.quantity}
                                            onChange={e => {
                                                const newItems = [...saleItems];
                                                newItems[idx].quantity = parseInt(e.target.value) || 0;
                                                setSaleItems(newItems);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setSaleItems([...saleItems, { itemId: '', quantity: 0 }])}
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-2"
                            >
                                <Plus size={14} /> Add Another Item
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                            <Button variant="ghost" onClick={() => {
                                setShowPrimaryModal(false);
                                setShowSecondaryModal(false);
                                setSaleItems([{ itemId: '', quantity: 0 }]);
                            }} className="text-slate-400 hover:text-white">Cancel</Button>
                            
                            <Button 
                                onClick={showPrimaryModal ? handlePrimarySale : handleSecondarySale}
                                className={showPrimaryModal ? "bg-green-700 hover:bg-green-600 text-white border-none" : "bg-purple-700 hover:bg-purple-600 text-white border-none"}
                            >
                                <ArrowRight size={16} className="mr-2" /> Confirm Sale
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};