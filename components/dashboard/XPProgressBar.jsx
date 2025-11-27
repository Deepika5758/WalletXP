import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy } from 'lucide-react';

export default function XPProgressBar({ currentXP, level }) {
  const XP_PER_LEVEL = 1000;
  const xpForNextLevel = level * XP_PER_LEVEL;
  const xpInCurrentLevel = currentXP % XP_PER_LEVEL;
  const progress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-purple-200 text-sm">Current Level</p>
            <p className="text-3xl font-bold">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-yellow-300">
            <Zap className="w-5 h-5" />
            <span className="text-2xl font-bold">{currentXP}</span>
          </div>
          <p className="text-purple-200 text-sm">Total XP</p>
        </div>
      </div>
      
      <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
        />
      </div>
      <div className="flex justify-between mt-2 text-sm text-purple-200">
        <span>{xpInCurrentLevel} XP</span>
        <span>{XP_PER_LEVEL - xpInCurrentLevel} XP to Level {level + 1}</span>
      </div>
    </div>
  );
}
