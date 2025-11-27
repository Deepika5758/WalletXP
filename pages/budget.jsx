import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import AddExpenseModal from '@/components/budget/AddExpenseModal';
import { 
  ArrowLeft, Plus, Wallet, TrendingUp, PieChart, 
  Lightbulb, BarChart3, IndianRupee, X, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CATEGORIES = {
  food: { label: '🍔 Food', color: 'bg-orange-500' },
  transport: { label: '🚗 Transport', color: 'bg-blue-500' },
  shopping: { label: '🛍️ Shopping', color: 'bg-pink-500' },
  entertainment: { label: '🎬 Entertainment', color: 'bg-purple-500' },
  utilities: { label: '💡 Utilities', color: 'bg-yellow-500' },
  healthcare: { label: '🏥 Healthcare', color: 'bg-red-500' },
  education: { label: '📚 Education', color: 'bg-indigo-500' },
  rent: { label: '🏠 Rent', color: 'bg-gray-500' },
  groceries: { label: '🛒 Groceries', color: 'bg-green-500' },
  other: { label: '📦 Other', color: 'bg-slate-500' },
};

export default function Budget() {
  const { user, updateUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showSpending, setShowSpending] = useState(false);
  const [showLimits, setShowLimits] = useState(false);
  const [newIncome, setNewIncome] = useState('');
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    try {
      const data = await base44.entities.Expense.filter({ user_id: user.id }, '-date');
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await base44.entities.Expense.create({
        ...expenseData,
        user_id: user.id
      });
      loadExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateIncome = async () => {
    if (!newIncome) return;
    await updateUser({ monthly_income: parseFloat(newIncome) });
    setShowIncomeModal(false);
    setNewIncome('');
  };

  const getSpendingByCategory = () => {
    const spending = {};
    expenses.forEach(exp => {
      spending[exp.category] = (spending[exp.category] || 0) + exp.amount;
    });
    return spending;
  };

  const getTotalSpent = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const spendingData = getSpendingByCategory();
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this spending data and provide financial advice in Indian Rupees (₹):
        Monthly Income: ₹${user.monthly_income || 0}
        Spending by category: ${JSON.stringify(spendingData)}
        Total spent: ₹${getTotalSpent()}
        
        Provide:
        1. Top 3 tips to save money
        2. Suggested monthly limits for each category
        3. Categories where spending is too high`,
        response_json_schema: {
          type: "object",
          properties: {
            tips: { type: "array", items: { type: "string" } },
            suggested_limits: { 
              type: "object",
              additionalProperties: { type: "number" }
            },
            high_spending_categories: { type: "array", items: { type: "string" } }
          }
        }
      });
      setInsights(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const spendingByCategory = getSpendingByCategory();
  const totalSpent = getTotalSpent();

  if (!user) {
    window.location.href = createPageUrl('Login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-500 pt-6 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">Budget Dashboard</h1>
          </div>
          
          {/* Income Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Monthly Income</p>
                <p className="text-3xl font-bold text-white">
                  ₹{(user.monthly_income || 0).toLocaleString()}
                </p>
              </div>
              <Button
                onClick={() => setShowIncomeModal(true)}
                variant="ghost"
                className="text-white hover:bg-white/20 border border-white/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Update Income
              </Button>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>Spent</span>
                <span>₹{totalSpent.toLocaleString()} / ₹{(user.monthly_income || 0).toLocaleString()}</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalSpent / (user.monthly_income || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 -mt-8">
        {/* Action Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { getAIInsights(); setShowTips(true); }}
            className="bg-white rounded-xl p-4 shadow-lg flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Tips</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSpending(true)}
            className="bg-white rounded-xl p-4 shadow-lg flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Spending</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { getAIInsights(); setShowLimits(true); }}
            className="bg-white rounded-xl p-4 shadow-lg flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Limits</span>
          </motion.button>
        </div>

        {/* Add Expense Button */}
        <Button
          onClick={() => setShowAddExpense(true)}
          className="w-full h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl mb-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Expense
        </Button>

        {/* Recent Expenses */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Recent Expenses</h2>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No expenses yet</div>
            ) : (
              expenses.slice(0, 10).map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${CATEGORIES[expense.category]?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center text-white text-lg`}>
                      {CATEGORIES[expense.category]?.label.split(' ')[0] || '📦'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{expense.description || expense.category}</p>
                      <p className="text-xs text-gray-500">{expense.date}</p>
                      {expense.is_fixed && (
                        <span className="text-xs text-blue-600 font-medium">Fixed expense</span>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-gray-800">₹{expense.amount.toLocaleString()}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSubmit={handleAddExpense}
      />

      {/* Income Modal */}
      <Dialog open={showIncomeModal} onOpenChange={setShowIncomeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Monthly Income</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
              <Input
                type="number"
                placeholder="50000"
                value={newIncome}
                onChange={(e) => setNewIncome(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>
            <Button onClick={handleUpdateIncome} className="w-full">Update Income</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tips Modal */}
      <Dialog open={showTips} onOpenChange={setShowTips}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              AI Financial Tips
            </DialogTitle>
          </DialogHeader>
          {loadingInsights ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : insights?.tips ? (
            <div className="space-y-3">
              {insights.tips.map((tip, index) => (
                <div key={index} className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Add some expenses first to get tips</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Spending Modal */}
      <Dialog open={showSpending} onOpenChange={setShowSpending}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              Spending by Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {Object.entries(spendingByCategory).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${CATEGORIES[category]?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center text-white`}>
                    {CATEGORIES[category]?.label.split(' ')[0] || '📦'}
                  </div>
                  <span className="font-medium text-gray-700 capitalize">{category}</span>
                </div>
                <span className="font-bold text-gray-800">₹{amount.toLocaleString()}</span>
              </div>
            ))}
            {Object.keys(spendingByCategory).length === 0 && (
              <p className="text-gray-500 text-center py-4">No spending data yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Limits Modal */}
      <Dialog open={showLimits} onOpenChange={setShowLimits}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Suggested Monthly Limits
            </DialogTitle>
          </DialogHeader>
          {loadingInsights ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : insights?.suggested_limits ? (
            <div className="space-y-3">
              {Object.entries(insights.suggested_limits).map(([category, limit]) => (
                <div key={category} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 capitalize">{category}</span>
                    <span className="font-bold text-green-600">₹{limit.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        (spendingByCategory[category] || 0) > limit ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, ((spendingByCategory[category] || 0) / limit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Spent: ₹{(spendingByCategory[category] || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Add income and expenses first</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
