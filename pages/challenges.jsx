import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import SpinWheel from '@/components/ui/SpinWheel';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import { ArrowLeft, Trophy, Zap, Timer, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Confetti effect handled with UI feedback

const WEEKLY_CHALLENGES = [
  { title: "No Dining Out", description: "Cook all meals at home for a week", xp: 300, type: "weekly" },
  { title: "Public Transport Week", description: "Use only public transport for commuting", xp: 250, type: "weekly" },
  { title: "Entertainment Detox", description: "No paid entertainment subscriptions for a week", xp: 200, type: "weekly" },
  { title: "Grocery Budget", description: "Spend under ₹2000 on groceries this week", xp: 350, type: "weekly" },
  { title: "Cash Only Week", description: "Use only cash for all purchases", xp: 280, type: "weekly" },
];

export default function Challenges() {
  const { user, updateUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    try {
      const [challengesData, completedData] = await Promise.all([
        base44.entities.Challenge.filter({ user_id: user.id }),
        base44.entities.CompletedChallenge.filter({ user_id: user.id }, '-completed_at')
      ]);
      setChallenges(challengesData);
      setCompletedChallenges(completedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpinComplete = async (challenge) => {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      await base44.entities.Challenge.create({
        user_id: user.id,
        title: challenge.title,
        description: challenge.description,
        xp_reward: challenge.xp,
        type: 'daily',
        status: 'active',
        accepted_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });
      loadChallenges();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptWeekly = async (challenge) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      await base44.entities.Challenge.create({
        user_id: user.id,
        title: challenge.title,
        description: challenge.description,
        xp_reward: challenge.xp,
        type: 'weekly',
        status: 'active',
        accepted_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });
      loadChallenges();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteChallenge = async (challenge) => {
    try {
      await base44.entities.Challenge.update(challenge.id, { status: 'completed' });
      
      await base44.entities.CompletedChallenge.create({
        user_id: user.id,
        challenge_title: challenge.title,
        xp_earned: challenge.xp_reward,
        completed_at: new Date().toISOString(),
        type: challenge.type
      });

      const newXP = (user.xp_points || 0) + challenge.xp_reward;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      let badges = [...(user.badges || ['Beginner'])];
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
      loadChallenges();
    } catch (err) {
      console.error(err);
    }
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const pendingChallenges = challenges.filter(c => c.status === 'pending');

  if (!user) {
    window.location.href = createPageUrl('Login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 pt-6 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">Challenges</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">{completedChallenges.length}</span>
                <span className="text-white/70 text-sm">Completed</span>
              </div>
            </div>
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">{activeChallenges.length}</span>
                <span className="text-white/70 text-sm">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Spin Wheel */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Daily Challenge Spin</h2>
            <p className="text-sm text-gray-500">Spin to get a random daily challenge!</p>
          </div>
          <SpinWheel onSpinComplete={handleSpinComplete} />
        </div>

        {/* Challenge Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {activeChallenges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No active challenges</p>
                <p className="text-sm">Spin the wheel or accept a weekly challenge!</p>
              </div>
            ) : (
              activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onComplete={handleCompleteChallenge}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-3">
            {WEEKLY_CHALLENGES.map((challenge, index) => {
              const isAccepted = challenges.some(
                c => c.title === challenge.title && (c.status === 'active' || c.status === 'pending')
              );
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-xl p-4 border-2 ${
                    isAccepted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        Weekly
                      </span>
                      <h4 className="font-semibold text-gray-800 mt-1">{challenge.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                      <div className="flex items-center gap-1 text-amber-600 font-medium mt-2">
                        <Zap className="w-4 h-4" />
                        <span>+{challenge.xp} XP</span>
                      </div>
                    </div>
                    {!isAccepted && (
                      <Button
                        onClick={() => handleAcceptWeekly(challenge)}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        Accept
                      </Button>
                    )}
                    {isAccepted && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Active
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          <TabsContent value="all" className="space-y-3">
            {[...WEEKLY_CHALLENGES].map((challenge, index) => {
              const isAccepted = challenges.some(
                c => c.title === challenge.title && (c.status === 'active' || c.status === 'pending')
              );
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl p-4 border-2 ${
                    isAccepted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        challenge.type === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {challenge.type === 'daily' ? '24h' : 'Weekly'}
                      </span>
                      <h4 className="font-semibold text-gray-800 mt-1">{challenge.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                      <div className="flex items-center gap-1 text-amber-600 font-medium mt-2">
                        <Zap className="w-4 h-4" />
                        <span>+{challenge.xp} XP</span>
                      </div>
                    </div>
                    {!isAccepted && (
                      <Button
                        onClick={() => handleAcceptWeekly(challenge)}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        Accept
                      </Button>
                    )}
                    {isAccepted && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Active
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
