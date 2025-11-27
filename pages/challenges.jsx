import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar, CheckCircle, Zap, Trophy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

import SpinWheel from '@/components/challenges/SpinWheel';
import ChallengeCard from '@/components/challenges/ChallengeCard';

export default function Challenges() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

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

  // Fetch all challenges
  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  // Fetch user challenges
  const { data: userChallenges = [] } = useQuery({
    queryKey: ['userChallenges', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserChallenge.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  // Fetch user progress
  const { data: progress } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const results = await base44.entities.UserProgress.filter({ user_email: user.email });
      return results[0];
    },
    enabled: !!user?.email
  });

  // Accept challenge mutation - spin wheel challenges are 1 day, weekly are 7 days
  const acceptChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      const startDate = new Date();
      // Spin wheel challenges = 1 day, weekly challenges use their duration or default 7 days
      const durationDays = challenge.is_weekly ? (challenge.duration_days || 7) : 1;
      const endDate = addDays(startDate, durationDays);
      
      return await base44.entities.UserChallenge.create({
        user_email: user.email,
        challenge_id: challenge.id,
        status: 'active',
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userChallenges']);
      toast.success('Challenge accepted! Good luck! 🎯');
    }
  });

  // Complete challenge mutation
  const completeChallengeMutation = useMutation({
    mutationFn: async ({ userChallenge, challenge }) => {
      // Update user challenge
      await base44.entities.UserChallenge.update(userChallenge.id, {
        status: 'completed',
        completed_date: format(new Date(), 'yyyy-MM-dd')
      });

      // Update user progress
      const newXP = (progress?.total_xp || 0) + challenge.xp_reward;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const newSavings = (progress?.total_savings || 0) + (challenge.savings_estimate || 0);

      if (progress?.id) {
        await base44.entities.UserProgress.update(progress.id, {
          total_xp: newXP,
          level: newLevel,
          completed_challenges_count: (progress.completed_challenges_count || 0) + 1,
          total_savings: newSavings
        });
      } else {
        await base44.entities.UserProgress.create({
          user_email: user.email,
          total_xp: newXP,
          level: newLevel,
          completed_challenges_count: 1,
          total_savings: newSavings
        });
      }

      // Save to challenge history
      await base44.entities.ChallengeHistory.create({
        user_email: user.email,
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        xp_earned: challenge.xp_reward,
        savings_earned: challenge.savings_estimate || 0,
        completed_date: format(new Date(), 'yyyy-MM-dd'),
        duration_days: challenge.duration_days || 1
      });
    },
    onSuccess: (_, { challenge }) => {
      queryClient.invalidateQueries(['userChallenges']);
      queryClient.invalidateQueries(['userProgress']);
      queryClient.invalidateQueries(['challengeHistory']);
      toast.success(`Challenge completed! +${challenge.xp_reward} XP earned! 🎉`);
    }
  });

  // Fail challenge mutation
  const failChallengeMutation = useMutation({
    mutationFn: async (userChallenge) => {
      await base44.entities.UserChallenge.update(userChallenge.id, {
        status: 'failed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userChallenges']);
      toast.error('Challenge failed. Try again next time!');
    }
  });

  // Filter challenges
  const weeklyChallenges = challenges.filter(c => c.is_weekly);
  const activeChallenges = userChallenges.filter(uc => uc.status === 'active');
  const spinWheelChallenges = challenges.filter(c => !c.is_weekly);

  const getChallengeById = (id) => challenges.find(c => c.id === id);
  const getUserChallengeForChallenge = (challengeId) => 
    userChallenges.find(uc => uc.challenge_id === challengeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-violet-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Target className="w-8 h-8 text-purple-600" />
                Challenges
              </h1>
              <p className="text-gray-500">Complete challenges to earn XP and save money!</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-8"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-1">
                <Trophy className="w-6 h-6" />
                {progress?.completed_challenges_count || 0}
              </div>
              <p className="text-purple-200 text-sm">Completed</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-1">
                <Zap className="w-6 h-6" />
                {progress?.total_xp || 0}
              </div>
              <p className="text-purple-200 text-sm">Total XP</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">
                ₹{(progress?.total_savings || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-purple-200 text-sm">Total Saved</p>
            </div>
          </div>
        </motion.div>

        {/* Spin Wheel Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <SpinWheel
            challenges={spinWheelChallenges}
            onChallengeSelected={() => {}}
            onAccept={(challenge) => acceptChallengeMutation.mutate(challenge)}
            onDecline={() => {}}
          />
        </motion.div>

        {/* Challenges Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Active ({activeChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                All
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {activeChallenges.length > 0 ? (
                    activeChallenges.map((uc) => {
                      const challenge = getChallengeById(uc.challenge_id);
                      if (!challenge) return null;
                      return (
                        <ChallengeCard
                          key={uc.id}
                          challenge={challenge}
                          userChallenge={uc}
                          onComplete={() => completeChallengeMutation.mutate({ userChallenge: uc, challenge })}
                          onFail={() => failChallengeMutation.mutate(uc)}
                        />
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-2 text-center py-12 text-gray-400"
                    >
                      <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No active challenges</p>
                      <p className="text-sm">Spin the wheel to get a new challenge!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="weekly">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weeklyChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    userChallenge={getUserChallengeForChallenge(challenge.id)}
                    onComplete={() => {
                      const uc = getUserChallengeForChallenge(challenge.id);
                      if (uc) completeChallengeMutation.mutate({ userChallenge: uc, challenge });
                    }}
                    onFail={() => {
                      const uc = getUserChallengeForChallenge(challenge.id);
                      if (uc) failChallengeMutation.mutate(uc);
                    }}
                    onAccept={(c) => acceptChallengeMutation.mutate(c)}
                  />
                ))}
                {weeklyChallenges.length === 0 && (
                  <p className="col-span-2 text-center py-8 text-gray-400">
                    No weekly challenges available
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    userChallenge={getUserChallengeForChallenge(challenge.id)}
                    onComplete={() => {
                      const uc = getUserChallengeForChallenge(challenge.id);
                      if (uc) completeChallengeMutation.mutate({ userChallenge: uc, challenge });
                    }}
                    onFail={() => {
                      const uc = getUserChallengeForChallenge(challenge.id);
                      if (uc) failChallengeMutation.mutate(uc);
                    }}
                    onAccept={(c) => acceptChallengeMutation.mutate(c)}
                  />
                ))}
                {challenges.length === 0 && (
                  <p className="col-span-2 text-center py-8 text-gray-400">
                    No challenges available
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
