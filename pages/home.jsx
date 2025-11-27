import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Wallet, Target, BookOpen, Zap, TrendingUp, 
  ChevronRight, Flame, Award, Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

import XPProgressBar from '@/components/dashboard/XPProgressBar';
import StreakCard from '@/components/dashboard/StreakCard';
import BadgesDisplay from '@/components/dashboard/BadgesDisplay';
import QuickStats from '@/components/dashboard/QuickStats';

export default function Home() {
  const [user, setUser] = useState(null);

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

  // Fetch user progress
  const { data: progress } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const results = await base44.entities.UserProgress.filter({ user_email: user.email });
      return results[0] || { total_xp: 0, level: 1, current_streak: 0, longest_streak: 0, completed_lessons: [], badges: [] };
    },
    enabled: !!user?.email
  });

  // Fetch monthly expenses
  const currentMonth = format(new Date(), 'yyyy-MM');
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', user?.email, currentMonth],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Expense.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  const monthlySpent = expenses
    .filter(e => e.date?.startsWith(currentMonth))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const quickLinks = [
    { 
      title: 'Budget', 
      description: 'Manage your income & expenses',
      icon: Wallet, 
      color: 'from-green-500 to-emerald-600',
      page: 'Budget'
    },
    { 
      title: 'Challenges', 
      description: 'Spin & save with fun challenges',
      icon: Target, 
      color: 'from-purple-500 to-violet-600',
      page: 'Challenges'
    },
    { 
      title: 'Learn', 
      description: 'Improve your financial knowledge',
      icon: BookOpen, 
      color: 'from-blue-500 to-indigo-600',
      page: 'Learn'
    },
    { 
      title: 'Rewards', 
      description: 'Redeem XP for discount coupons',
      icon: TrendingUp, 
      color: 'from-pink-500 to-rose-600',
      page: 'Rewards'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Explorer'}! 👋
          </h1>
          <p className="text-gray-500">Let's level up your financial game today!</p>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <XPProgressBar 
            currentXP={progress?.total_xp || 0} 
            level={progress?.level || 1} 
          />
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <StreakCard 
            currentStreak={progress?.current_streak || 0}
            longestStreak={progress?.longest_streak || 0}
          />
          <div className="md:col-span-2">
            <BadgesDisplay badges={progress?.badges} level={progress?.level || 1} />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <QuickStats
            totalSavings={progress?.total_savings || 0}
            monthlySpent={monthlySpent}
            challengesCompleted={progress?.completed_challenges_count || 0}
            lessonsCompleted={progress?.completed_lessons?.length || 0}
          />
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {quickLinks.map((link, index) => (
            <Link key={link.page} to={createPageUrl(link.page)}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-gradient-to-br ${link.color} rounded-2xl p-6 text-white shadow-lg cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <link.icon className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-70" />
                </div>
                <h3 className="text-xl font-bold mb-1">{link.title}</h3>
                <p className="text-white/80 text-sm">{link.description}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Motivational Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Daily Tip 💡</h3>
              <p className="text-white/90">
                Complete challenges to earn XP and redeem them for discount coupons on Swiggy, Zomato, Amazon & more!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
