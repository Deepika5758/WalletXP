import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import XPProgress from '@/components/ui/XPProgress';
import { 
  Wallet, PiggyBank, Trophy, BookOpen, Target, Gift, 
  Plus, TrendingUp, Flame, ChevronRight, Sparkles,
  User, Lock, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const { user, updateUser, login, signup, loading: authLoading } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading2, setAuthLoading2] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
      checkAndUpdateStreak();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [expensesData, goalsData, challengesData] = await Promise.all([
        base44.entities.Expense.filter({ user_id: user.id }, '-created_date', 5),
        base44.entities.SavingGoal.filter({ user_id: user.id, status: 'active' }),
        base44.entities.Challenge.filter({ user_id: user.id, status: 'active' })
      ]);
      setExpenses(expensesData);
      setGoals(goalsData);
      setChallenges(challengesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkAndUpdateStreak = async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (user.last_activity_date === today) return;
    
    let newStreak = 1;
    if (user.last_activity_date === yesterday) {
      newStreak = (user.current_streak || 0) + 1;
    }
    
    const streakXP = newStreak > 1 ? Math.min(newStreak * 10, 100) : 0;
    const newXP = (user.xp_points || 0) + streakXP;
    const newLevel = Math.floor(newXP / 1000) + 1;
    
    let badges = [...(user.badges || ['Beginner'])];
    if (newLevel % 5 === 0 && newLevel > (user.level || 1)) {
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
    
    await updateUser({
      last_activity_date: today,
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, user.longest_streak || 0),
      xp_points: newXP,
      level: newLevel,
      badges
    });
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  };

  const quickActions = [
    { icon: Plus, label: 'Add Expense', href: 'Budget', color: 'from-blue-500 to-cyan-500' },
    { icon: Target, label: 'Savings', href: 'Savings', color: 'from-green-500 to-emerald-500' },
    { icon: Trophy, label: 'Challenges', href: 'Challenges', color: 'from-amber-500 to-orange-500' },
    { icon: BookOpen, label: 'Learn', href: 'Learn', color: 'from-purple-500 to-pink-500' },
  ];

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setAuthLoading2(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setAuthLoading2(false);
          return;
        }
        if (password.length < 4) {
          setError('Password must be at least 4 characters');
          setAuthLoading2(false);
          return;
        }
        await signup(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setAuthLoading2(false);
    }
  };

  // Show login/signup if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4"
            >
              <Wallet className="w-10 h-10 text-indigo-600" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">WalletXP</h1>
            <p className="text-white/70">Level up your finances</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: Trophy, text: "Earn XP & Level Up", color: "text-amber-500" },
              { icon: Target, text: "Track Savings Goals", color: "text-green-500" },
              { icon: Flame, text: "Build Streaks", color: "text-orange-500" },
              { icon: Sparkles, text: "Win Rewards", color: "text-purple-500" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3"
              >
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
                <span className="text-white text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={authLoading2}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg"
              >
                {authLoading2 ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 pt-8 pb-20 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm">Welcome back,</p>
              <h1 className="text-2xl font-bold text-white">{user.username}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white font-semibold">{user.current_streak || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 -mt-14">
        {/* XP Card */}
        <XPProgress
          xp={user.xp_points || 0}
          level={user.level || 1}
          streak={user.current_streak || 0}
          badges={user.badges || ['Beginner']}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">This Month</p>
                <p className="text-lg font-bold text-gray-800">₹{getTotalExpenses().toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Goals</p>
                <p className="text-lg font-bold text-gray-800">{goals.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} to={createPageUrl(action.href)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg mb-2`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 text-center">{action.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Challenges */}
        {challenges.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">Active Challenges</h2>
              <Link to={createPageUrl('Challenges')} className="text-indigo-600 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {challenges.slice(0, 2).map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{challenge.title}</p>
                      <p className="text-sm text-amber-600">+{challenge.xp_reward} XP</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards */}
        <Link to={createPageUrl('Rewards')}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Rewards Store</h3>
                  <p className="text-white/80 text-sm">Redeem XP for coupons</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-white font-semibold">{user.xp_points || 0}</span>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
