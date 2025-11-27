import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star } from 'lucide-react';

export default function XPProgress({ xp, level, streak, badges }) {
  const xpForNextLevel = 1000;
  const currentLevelXP = xp % xpForNextLevel;
  const progress = (currentLevelXP / xpForNextLevel) * 100;

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-5 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Trophy className="w-7 h-7 text-yellow-300" />
          </div>
          <div>
            <p className="text-white/70 text-sm">Level</p>
            <p className="text-3xl font-bold">{level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-lg">{streak} day streak</span>
          </div>
          <p className="text-white/70 text-sm">{xp.toLocaleString()} XP total</p>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress to Level {level + 1}</span>
          <span>{currentLevelXP}/{xpForNextLevel} XP</span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
          />
        </div>
      </div>
      
      {badges && badges.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-4">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1"
            >
              <Star className="w-3 h-3 text-yellow-300" />
              {badge}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
