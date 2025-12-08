
import React, { useState, useEffect } from 'react';
import { MonthlyExpenseSheet, ExpenseCategory, UserRole, Customer, VisitRecord, UserStock, CustomerCategory } from '../types';
import { getCustomersByTerritory, getVisits, getUserStock, getSalesTarget, getAllCustomers, getUser } from '../services/mockDatabase';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, BarChart3, Package, PhoneMissed } from 'lucide-react';

interface AIInsightsProps {
  sheet: MonthlyExpenseSheet | null;
  userName: string;
  userRole: UserRole;
  userId: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ sheet, userName, userRole, userId }) => {
  const [insightCards, setInsightCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [userId, sheet]);

  const generateInsights = async () => {
    setLoading(true);
    const cards = [];

    // 1. Sales & Target Insight (Real Data)
    const today = new Date();
    const target = await getSalesTarget(userId, today.getMonth(), today.getFullYear());

    if (target) {
      const percentage = Math.round((target.achievedAmount / target.targetAmount) * 100);
      cards.push({
        type: 'SALES',
        title: 'Target Progress',
        value: `${percentage}%`,
        desc: `₹${target.achievedAmount.toLocaleString()} / ₹${target.targetAmount.toLocaleString()}`,
        status: percentage >= 80 ? 'good' : 'bad'
      });

      // Sales Gap Alert (Mid-month check)
      if (today.getDate() > 15 && percentage < 50) {
        cards.push({
          type: 'GAP',
          title: 'Sales Gap Alert',
          value: 'Critical Lag',
          desc: '< 50% achieved by mid-month',
          status: 'bad'
        });
      }
    }

    // 2. Doctor Visit Gaps (Missed Calls)
    if (userRole === UserRole.MR) {
      const user = await getUser(userId);
      if (user) {
        const territoryIds = user.territories.map(t => t.id);
        const allCustomers = await getAllCustomers();
        const myCustomers = allCustomers.filter(c => territoryIds.includes(c.territoryId));

        // Get visits for this month
        // Note: getVisits takes a specific date, we need a range or all visits. 
        // For efficiency in this mock, we'll fetch all visits and filter.
        // In real app, use a date range query.
        const { getAllVisits } = await import('../services/mockDatabase'); // Dynamic import to avoid circular dep if any
        const allVisits = await getAllVisits();

        const currentMonthStr = today.toISOString().slice(0, 7); // YYYY-MM
        const myVisitsThisMonth = allVisits.filter(v =>
          v.userId === userId && v.date.startsWith(currentMonthStr)
        );

        const visitedCustomerIds = new Set(myVisitsThisMonth.map(v => v.customerId));
        const missedCustomers = myCustomers.filter(c => !visitedCustomerIds.has(c.id));

        if (missedCustomers.length > 0) {
          cards.push({
            type: 'MISSED',
            title: 'Missed Calls',
            value: `${missedCustomers.length} Pending`,
            desc: `${Math.round((visitedCustomerIds.size / myCustomers.length) * 100)}% Coverage`,
            status: missedCustomers.length > 10 ? 'bad' : 'good'
          });
        }
      }

      const stock = await getUserStock(userId);
      const lowStock = stock.filter(s => s.quantity < 10);

      if (lowStock.length > 0) {
        cards.push({
          type: 'STOCK',
          title: 'Low Inventory',
          value: `${lowStock.length} Items`,
          desc: `Restock needed: ${lowStock[0].itemName}`,
          status: 'bad'
        });
      }
    }

    // 3. Expense/Compliance (Existing logic)
    if (sheet) {
      const hqDays = sheet.entries.filter(e => e.category === ExpenseCategory.HQ).length;
      const hqCompliance = hqDays >= 8;
      cards.push({
        type: 'COMPLIANCE',
        title: 'HQ Compliance',
        value: `${hqDays}/8 Days`,
        desc: hqCompliance ? 'On Track' : 'Plan more HQ days',
        status: hqCompliance ? 'good' : 'bad'
      });
    }

    setInsightCards(cards);
    setLoading(false);
  };

  if (loading) return <div className="animate-pulse bg-indigo-100 h-32 rounded-lg mb-6"></div>;

  if (insightCards.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Sparkles size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-yellow-300" />
              AI Optimization Insights
            </h3>
            <p className="text-xs text-indigo-200 mt-1">Analyzing patterns for {userName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insightCards.map((card, idx) => (
            <div key={idx} className={`bg-white/10 backdrop-blur-sm rounded p-3 border ${card.status === 'good' ? 'border-green-400/30' : 'border-amber-400/30'}`}>
              <div className="flex items-center text-indigo-200 text-xs font-medium mb-1 uppercase">
                {card.type === 'SALES' && <BarChart3 size={14} className="mr-1" />}
                {card.type === 'STOCK' && <Package size={14} className="mr-1" />}
                {card.type === 'GAP' && <TrendingUp size={14} className="mr-1" />}
                {card.type === 'COMPLIANCE' && <CheckCircle2 size={14} className="mr-1" />}
                {card.type === 'MISSED' && <PhoneMissed size={14} className="mr-1" />}
                {card.title}
              </div>
              <div className="text-lg font-bold truncate">{card.value}</div>
              <div className="text-[10px] text-indigo-200 mt-1 truncate">
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
