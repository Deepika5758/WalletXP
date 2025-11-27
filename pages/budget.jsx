import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Wallet, Lightbulb, PieChart, Target, Plus, List, ArrowLeft, IndianRupee, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

import IncomeExpenseForm from '@/components/budget/IncomeExpenseForm';
import ExpenseInput from '@/components/budget/ExpenseInput';
import ReceiptScanner from '@/components/budget/ReceiptScanner';
import AIInsights from '@/components/budget/AIInsights';
import BudgetPopups from '@/components/budget/BudgetPopups';

export default function Budget() {
  const [user, setUser] = useState(null);
  const [suggestedLimits, setSuggestedLimits] = useState({});
  const [showTips, setShowTips] = useState(false);
  const [showSpending, setShowSpending] = useState(false);
  const [showLimits, setShowLimits] = useState(false);
  
  const queryClient = useQueryClient();
  const currentMonth = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (err) {
        console.error('Error loading user:', err);
      }
    };
    loadUser();
  }, []);

  // Fetch budget
  const { data: budget } = useQuery({
    queryKey: ['budget', user?.email, currentMonth],
    queryFn: async () => {
      if (!user?.email) return null;
      const results = await base44.entities.Budget.filter({ 
        user_email: user.email, 
        month: currentMonth 
      });
      return results[0];
    },
    enabled: !!user?.email
  });

  // Fetch expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Expense.filter({ user_email: user.email }, '-date');
    },
    enabled: !!user?.email
  });

  // Save budget mutation
  const saveBudgetMutation = useMutation({
    mutationFn: async (budgetData) => {
      if (budget?.id) {
        return await base44.entities.Budget.update(budget.id, budgetData);
      } else {
        return await base44.entities.Budget.create({
          ...budgetData,
          user_email: user.email,
          month: currentMonth
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budget']);
      toast.success('Budget saved successfully!');
    }
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (expenseData) => {
      return await base44.entities.Expense.create({
        ...expenseData,
        user_email: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('Expense added!');
    }
  });

  const monthlyExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));

  // Pop-up boxes data
  const popupBoxes = [
    { 
      icon: Lightbulb, 
      title: 'Tips', 
      color: 'from-yellow-400 to-amber-500',
      onClick: () => setShowTips(true)
    },
    { 
      icon: PieChart, 
      title: 'Spending by Category', 
      color: 'from-purple-500 to-indigo-600',
      onClick: () => setShowSpending(true)
    },
    { 
      icon: Target, 
      title: 'Suggested Monthly Limits', 
      color: 'from-blue-500 to-cyan-600',
      onClick: () => setShowLimits(true)
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-green-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Wallet className="w-8 h-8 text-green-600" />
                Budget Dashboard
              </h1>
              <p className="text-gray-500">Track your income, expenses, and savings goals</p>
            </div>
          </div>
        </motion.div>

        {/* Pop-up Boxes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {popupBoxes.map((box, index) => (
            <motion.div
              key={box.title}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={box.onClick}
              className={`bg-gradient-to-br ${box.color} rounded-2xl p-6 text-white shadow-lg cursor-pointer`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <box.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">{box.title}</h3>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Budget Setup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <IncomeExpenseForm
              budget={budget}
              onSave={(data) => saveBudgetMutation.mutate(data)}
              isLoading={saveBudgetMutation.isLoading}
            />
          </motion.div>

          {/* Right Column - Add Expenses */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Manual Entry
                </TabsTrigger>
                <TabsTrigger value="scan" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Scan Receipt
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual">
                <ExpenseInput
                  onAddExpense={(data) => addExpenseMutation.mutate(data)}
                  isLoading={addExpenseMutation.isLoading}
                />
              </TabsContent>
              
              <TabsContent value="scan">
                <ReceiptScanner
                  onExpenseScanned={(data) => addExpenseMutation.mutate(data)}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <AIInsights
            expenses={monthlyExpenses}
            budget={budget}
            onUpdateLimits={setSuggestedLimits}
          />
        </motion.div>

        {/* Recent Expenses & Fixed Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <List className="w-5 h-5 text-purple-600" />
            All Spending
          </h3>
          
          {/* Fixed Expenses Section */}
          {budget?.fixed_expenses && budget.fixed_expenses.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Fixed Monthly Expenses</h4>
              <div className="space-y-3">
                {budget.fixed_expenses.map((expense, index) => (
                  <div key={`fixed-${index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <IndianRupee className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{expense.name}</p>
                        <p className="text-sm text-blue-600 capitalize">{expense.category} • Fixed</p>
                      </div>
                    </div>
                    <span className="font-bold text-blue-700">-₹{expense.amount?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Variable Expenses */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Variable Expenses</h4>
            {monthlyExpenses.length > 0 ? (
              <div className="space-y-3">
                {monthlyExpenses.slice(0, 10).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="capitalize text-sm font-medium text-purple-700">{expense.category?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{expense.description || expense.category}</p>
                        <p className="text-sm text-gray-500">{expense.date}</p>
                      </div>
                    </div>
                    <span className="font-bold text-red-600">-₹{expense.amount?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No expenses recorded yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Popups */}
      <BudgetPopups
        showTips={showTips}
        setShowTips={setShowTips}
        showSpending={showSpending}
        setShowSpending={setShowSpending}
        showLimits={showLimits}
        setShowLimits={setShowLimits}
        expenses={monthlyExpenses}
        suggestedLimits={suggestedLimits}
      />
    </div>
  );
}
