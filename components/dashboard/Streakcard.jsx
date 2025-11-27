import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Zap } from 'lucide-react';

// Streak XP rewards: +10 XP per consecutive day, bonus at milestones
const getStreakXPBonus = (streak) => {
  if (streak >= 30) return 50; // 30 day streak bonus
  if (streak >= 14) return 30; // 2 week streak bonus
  if (streak >= 7) return 20;  // 1 week streak bonus
  if (streak >= 3) return 10;  // 3 day streak bonus
  return 0;
};

export default function StreakCard({ currentStreak, longestStreak }) {
  const dailyStreakXP = currentStreak * 5; // 5 XP per streak day
  const bonusXP = getStreakXPBonus(currentStreak);
  const totalStreakXP = dailyStreakXP + bonusXP;

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Flame className="w-5 h-5" />
          </div>
          <span className="font-semibold">Daily Streak</span>
        </div>
        {totalStreakXP > 0 && (
          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
            <Zap className="w-3 h-3 text-yellow-300" />
            <span>+{totalStreakXP} XP</span>
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-2 mb-2">
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold"
        >
          {currentStreak}
        </motion.span>
        <span className="text-orange-200 mb-1">days</span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-orange-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Best: {longestStreak} days</span>
        </div>
        {bonusXP > 0 && (
          <span className="text-yellow-300">+{bonusXP} bonus!</span>
        )}
      </div>
    </div>
  );
}
