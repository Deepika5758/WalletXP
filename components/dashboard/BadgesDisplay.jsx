import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Crown, Shield, Gem, Target, Rocket, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Badges are earned at level 5 multiples: Level 1 (beginner), Level 5, Level 10, Level 15, Level 20, Level 25
const BADGE_CONFIG = [
  { level: 1, id: 'beginner', icon: Star, color: 'from-green-400 to-emerald-500', name: 'Beginner', description: 'Started your financial journey!' },
  { level: 5, id: 'saver', icon: Shield, color: 'from-blue-400 to-cyan-500', name: 'Saver', description: 'Reached Level 5' },
  { level: 10, id: 'challenger', icon: Target, color: 'from-purple-400 to-violet-500', name: 'Challenger', description: 'Reached Level 10' },
  { level: 15, id: 'expert', icon: Gem, color: 'from-yellow-400 to-orange-500', name: 'Expert', description: 'Reached Level 15' },
  { level: 20, id: 'master', icon: Crown, color: 'from-pink-400 to-rose-500', name: 'Master', description: 'Reached Level 20' },
  { level: 25, id: 'legend', icon: Rocket, color: 'from-indigo-400 to-purple-600', name: 'Legend', description: 'Reached Level 25' },
];

export default function BadgesDisplay({ level = 1 }) {
  // Generate badges based on level - badges are awarded at level 5 multiples
  // Reading lessons -> Earn XP -> Level Up -> Get badge at 5 multiple levels
  const earnedBadges = BADGE_CONFIG.filter(badge => level >= badge.level);
  const nextBadge = BADGE_CONFIG.find(badge => level < badge.level);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">Your Badges</h3>
        </div>
        <span className="text-sm text-gray-500">{earnedBadges.length}/{BADGE_CONFIG.length}</span>
      </div>
      
      <TooltipProvider>
        <div className="flex flex-wrap gap-3">
          {earnedBadges.map((badge, index) => {
            const IconComponent = badge.icon;
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    className={`bg-gradient-to-br ${badge.color} p-3 rounded-xl shadow-md cursor-pointer hover:scale-110 transition-transform relative`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                    {index === earnedBadges.length - 1 && earnedBadges.length > 1 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-xs text-gray-400">{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {earnedBadges.length === 0 && (
            <p className="text-gray-400 text-sm">Complete lessons & challenges to level up and earn badges!</p>
          )}
        </div>
      </TooltipProvider>

      {/* Next Badge Progress */}
      {nextBadge && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-gray-600">
              Next badge: <span className="font-semibold text-purple-600">{nextBadge.name}</span> at Level {nextBadge.level}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {nextBadge.level - level} more level{nextBadge.level - level !== 1 ? 's' : ''} to go! (Earn XP by completing lessons & challenges)
          </p>
        </div>
      )}
    </div>
  );
}
