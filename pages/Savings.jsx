import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import SavingGoalCard from '@/components/savings/SavingGoalCard';
import AddSavingModal from '@/components/savings/AddSavingModal';
import CreateGoalModal from '@/components/savings/CreateGoalModal';
import { ArrowLeft, Target, Plus, PiggyBank, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Confetti handled with UI feedback

export default function Savings() {
  const { user, updateUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [savingLogs, setSavingLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showAddSaving, setShowAddSaving] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [goalsData, logsData] = await Promise.all([
        base44.entities.SavingGoal.filter({ user_id: user.id }),
        base44.entities.SavingLog.filter({ user_id: user.id }, '-date')
      ]);
      setGoals(goalsData);
      setSavingLogs(logsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData) => {
    try {
      await base44.entities.SavingGoal.create({
        ...goalData,
        user_id: user.id
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSavings = async (savingData) => {
    try {
      await base44.entities.SavingLog.create({
        ...savingData,
        user_id: user.id
      });

      const goal = goals.find(g => g.id === savingData.goal_id);
      const newAmount = (goal.current_amount || 0) + savingData.amount;
      
      await base44.entities.SavingGoal.update(goal.id, {
        current_amount: newAmount
      });

      // Check if goal is completed
      if (newAmount >= goal.target_amount) {
        await base44.entities.SavingGoal.update(goal.id, { status: 'completed' });

        // Award XP and badge
        const newXP = (user.xp_points || 0) + 500;
        const newLevel = Math.floor(newXP / 1000) + 1;
        let badges = [...(user.badges || ['Beginner'])];
        
        if (!badges.includes('Goal Achiever')) {
          badges.push('Goal Achiever');
        }
        
        if (newLevel % 5 === 0 && newLevel > user.level) {
          const badgeNames = {
            5: 'Bronze Saver',
            10: 'Silver Saver',
            15: 'Gold Saver',
            20: 'Platinum Saver',
            25: 'Diamond Saver'
          };
          if (badgeNames[newLevel] && !badges.includes(badgeNames[newLevel])) {
            badges.push(badgeNames[newLevel]);
          }
        }

        await updateUser({ xp_points: newXP, level: newLevel, badges });
      }

      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddSaving = (goal) => {
    setSelectedGoal(goal);
    setShowAddSaving(true);
  };

  const getTotalSaved = () => {
    return goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
  };

  const getActiveGoals = () => goals.filter(g => g.status === 'active');
  const getCompletedGoals = () => goals.filter(g => g.status === 'completed');

  if (!user) {
    window.location.href = createPageUrl('Login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 pt-6 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">Saving Goals</h1>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="w-5 h-5 text-white" />
                <span className="text-white/70 text-sm">Total Saved</span>
              </div>
              <p className="text-2xl font-bold text-white">₹{getTotalSaved().toLocaleString()}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-white" />
                <span className="text-white/70 text-sm">Active Goals</span>
              </div>
              <p className="text-2xl font-bold text-white">{getActiveGoals().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 -mt-8">
        {/* Create Goal Button */}
        <Button
          onClick={() => setShowCreateGoal(true)}
          className="w-full h-14 bg-white shadow-lg hover:shadow-xl text-green-600 border-2 border-green-100 rounded-xl mb-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Goal
        </Button>

        {/* Active Goals */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Active Goals</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : getActiveGoals().length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-xl">
              <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No active goals yet</p>
              <p className="text-sm">Create a goal to start saving!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getActiveGoals().map((goal) => (
                <SavingGoalCard
                  key={goal.id}
                  goal={goal}
                  onAddSavings={openAddSaving}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {getCompletedGoals().length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Completed Goals</h2>
            <div className="space-y-4">
              {getCompletedGoals().map((goal) => (
                <SavingGoalCard
                  key={goal.id}
                  goal={goal}
                  onAddSavings={openAddSaving}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGoalModal
        isOpen={showCreateGoal}
        onClose={() => setShowCreateGoal(false)}
        onSubmit={handleCreateGoal}
      />

      {selectedGoal && (
        <AddSavingModal
          isOpen={showAddSaving}
          onClose={() => { setShowAddSaving(false); setSelectedGoal(null); }}
          goal={selectedGoal}
          onSubmit={handleAddSavings}
        />
      )}
    </div>
  );
}
