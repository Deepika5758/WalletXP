import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, TrendingUp, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, differenceInDays } from 'date-fns';

export default function SavingGoalCard({ goal, onAddSavings, onComplete }) {
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const daysRemaining = differenceInDays(new Date(goal.deadline), new Date());
  const isCompleted = goal.status === 'completed' || progress >= 100;
  
  const getRemainingAmount = () => goal.target_amount - goal.current_amount;
  
  const getDailySavingsNeeded = () => {
    if (daysRemaining <= 0) return getRemainingAmount();
    return Math.ceil(getRemainingAmount() / daysRemaining);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border-2 transition-all ${
        isCompleted 
          ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300' 
          : 'bg-white border-gray-100 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isCompleted ? 'bg-green-500' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
          }`}>
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <Target className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{goal.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>
        
        {isCompleted && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Achieved!
          </span>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-800">{Math.min(100, Math.round(progress))}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isCompleted 
                ? 'bg-green-500' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}
          />
        </div>
      </div>
      
      {/* Amount Info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Saved</p>
          <p className="font-bold text-gray-800">₹{goal.current_amount.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Target</p>
          <p className="font-bold text-gray-800">₹{goal.target_amount.toLocaleString()}</p>
        </div>
      </div>
      
      {!isCompleted && (
        <>
          {/* Insight */}
          <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <p className="text-sm text-indigo-700">
              Save ₹{getDailySavingsNeeded().toLocaleString()} daily to reach your goal
            </p>
          </div>
          
          {/* Action */}
          <Button
            onClick={() => onAddSavings(goal)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Savings
          </Button>
        </>
      )}
      
      {isCompleted && !goal.status === 'completed' && (
        <Button
          onClick={() => onComplete(goal)}
          className="w-full bg-green-500 hover:bg-green-600"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark as Complete
        </Button>
      )}
    </motion.div>
  );
}
