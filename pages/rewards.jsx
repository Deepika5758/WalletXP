import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Gift, Ticket, Zap, Trophy, CheckCircle, 
  Clock, ShoppingBag, Car, Utensils, Film, Package, Star
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

const PARTNER_LOGOS = {
  swiggy: { name: 'Swiggy', color: 'bg-orange-500', icon: Utensils },
  zomato: { name: 'Zomato', color: 'bg-red-500', icon: Utensils },
  uber: { name: 'Uber', color: 'bg-black', icon: Car },
  ola: { name: 'Ola', color: 'bg-green-500', icon: Car },
  amazon: { name: 'Amazon', color: 'bg-yellow-500', icon: ShoppingBag },
  flipkart: { name: 'Flipkart', color: 'bg-blue-500', icon: ShoppingBag },
  bigbasket: { name: 'BigBasket', color: 'bg-green-600', icon: Package },
  myntra: { name: 'Myntra', color: 'bg-pink-500', icon: ShoppingBag },
  bookmyshow: { name: 'BookMyShow', color: 'bg-red-600', icon: Film },
  other: { name: 'Other', color: 'bg-gray-500', icon: Gift }
};

export default function Rewards() {
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

  // Fetch user progress
  const { data: progress } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const results = await base44.entities.UserProgress.filter({ user_email: user.email });
      return results[0] || { total_xp: 0, level: 1 };
    },
    enabled: !!user?.email
  });

  // Fetch available coupons
  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => base44.entities.Coupon.filter({ is_active: true })
  });

  // Fetch user coupons
  const { data: userCoupons = [] } = useQuery({
    queryKey: ['userCoupons', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserCoupon.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  // Fetch challenge history
  const { data: challengeHistory = [] } = useQuery({
    queryKey: ['challengeHistory', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ChallengeHistory.filter({ user_email: user.email }, '-completed_date');
    },
    enabled: !!user?.email
  });

  // Fetch user expenses to recommend coupons
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Expense.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  // Redeem coupon mutation
  const redeemCouponMutation = useMutation({
    mutationFn: async (coupon) => {
      const expiryDate = addDays(new Date(), coupon.expiry_days || 30);
      
      // Create user coupon
      await base44.entities.UserCoupon.create({
        user_email: user.email,
        coupon_id: coupon.id,
        coupon_code: coupon.code,
        coupon_title: coupon.title,
        partner: coupon.partner,
        status: 'available',
        redeemed_date: format(new Date(), 'yyyy-MM-dd'),
        expiry_date: format(expiryDate, 'yyyy-MM-dd'),
        points_spent: coupon.points_required
      });

      // Deduct XP from user progress
      if (progress?.id) {
        await base44.entities.UserProgress.update(progress.id, {
          total_xp: (progress.total_xp || 0) - coupon.points_required
        });
      }
    },
    onSuccess: (_, coupon) => {
      queryClient.invalidateQueries(['userCoupons']);
      queryClient.invalidateQueries(['userProgress']);
      toast.success(`Coupon redeemed! You got ${coupon.title} 🎉`);
    }
  });

  // Mark coupon as used
  const useCouponMutation = useMutation({
    mutationFn: async (userCoupon) => {
      await base44.entities.UserCoupon.update(userCoupon.id, {
        status: 'used',
        used_date: format(new Date(), 'yyyy-MM-dd')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userCoupons']);
      toast.success('Coupon marked as used!');
    }
  });

  // Calculate spending by category for recommendations
  const spendingByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + (exp.amount || 0);
    return acc;
  }, {});

  const topCategory = Object.entries(spendingByCategory)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  // Get recommended coupons based on spending
  const recommendedCoupons = coupons.filter(c => c.category === topCategory);
  const availableUserCoupons = userCoupons.filter(uc => uc.status === 'available');
  const usedUserCoupons = userCoupons.filter(uc => uc.status === 'used');

  const canAfford = (coupon) => (progress?.total_xp || 0) >= coupon.points_required;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
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
                <Gift className="w-8 h-8 text-pink-600" />
                Rewards
              </h1>
              <p className="text-gray-500">Redeem your XP for exciting coupons!</p>
            </div>
          </div>
        </motion.div>

        {/* XP Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-1">
                <Zap className="w-6 h-6" />
                {progress?.total_xp || 0}
              </div>
              <p className="text-purple-200 text-sm">Available XP</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-1">
                <Trophy className="w-6 h-6" />
                Level {progress?.level || 1}
              </div>
              <p className="text-purple-200 text-sm">Current Level</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-1">
                <Ticket className="w-6 h-6" />
                {availableUserCoupons.length}
              </div>
              <p className="text-purple-200 text-sm">Available Coupons</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-1">
                <CheckCircle className="w-6 h-6" />
                {usedUserCoupons.length}
              </div>
              <p className="text-purple-200 text-sm">Used Coupons</p>
            </div>
          </div>
        </motion.div>

        {/* Recommended Section */}
        {recommendedCoupons.length > 0 && topCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-800">Recommended for You</h2>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                Based on {topCategory} spending
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedCoupons.slice(0, 3).map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  canAfford={canAfford(coupon)}
                  onRedeem={() => redeemCouponMutation.mutate(coupon)}
                  isLoading={redeemCouponMutation.isPending}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="available">All Coupons</TabsTrigger>
              <TabsTrigger value="my-coupons">My Coupons ({availableUserCoupons.length})</TabsTrigger>
              <TabsTrigger value="used">Used ({usedUserCoupons.length})</TabsTrigger>
              <TabsTrigger value="history">Challenge History</TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    canAfford={canAfford(coupon)}
                    onRedeem={() => redeemCouponMutation.mutate(coupon)}
                    isLoading={redeemCouponMutation.isPending}
                  />
                ))}
                {coupons.length === 0 && (
                  <p className="col-span-3 text-center py-12 text-gray-400">
                    No coupons available yet
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="my-coupons">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableUserCoupons.map((uc) => (
                  <UserCouponCard
                    key={uc.id}
                    userCoupon={uc}
                    onUse={() => useCouponMutation.mutate(uc)}
                  />
                ))}
                {availableUserCoupons.length === 0 && (
                  <p className="col-span-2 text-center py-12 text-gray-400">
                    No coupons yet. Redeem your XP points!
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="used">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usedUserCoupons.map((uc) => (
                  <UserCouponCard key={uc.id} userCoupon={uc} isUsed />
                ))}
                {usedUserCoupons.length === 0 && (
                  <p className="col-span-2 text-center py-12 text-gray-400">
                    No used coupons yet
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {challengeHistory.map((ch) => (
                  <ChallengeHistoryCard key={ch.id} history={ch} />
                ))}
                {challengeHistory.length === 0 && (
                  <p className="text-center py-12 text-gray-400">
                    No completed challenges yet. Start completing challenges to earn XP!
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

function CouponCard({ coupon, canAfford, onRedeem, isLoading }) {
  const partner = PARTNER_LOGOS[coupon.partner] || PARTNER_LOGOS.other;
  const PartnerIcon = partner.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
    >
      <div className={`${partner.color} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PartnerIcon className="w-6 h-6" />
            <span className="font-bold">{partner.name}</span>
          </div>
          <Badge className="bg-white/20 text-white">
            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2">{coupon.title}</h3>
        {coupon.description && (
          <p className="text-sm text-gray-500 mb-3">{coupon.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-purple-600">
            <Zap className="w-4 h-4" />
            <span className="font-bold">{coupon.points_required} XP</span>
          </div>
          <Button
            onClick={onRedeem}
            disabled={!canAfford || isLoading}
            className={canAfford ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-300'}
            size="sm"
          >
            {canAfford ? 'Redeem' : 'Not enough XP'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function UserCouponCard({ userCoupon, onUse, isUsed }) {
  const partner = PARTNER_LOGOS[userCoupon.partner] || PARTNER_LOGOS.other;
  const PartnerIcon = partner.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border ${isUsed ? 'opacity-60' : 'border-green-200'}`}
    >
      <div className={`${partner.color} p-4 text-white`}>
        <div className="flex items-center gap-2">
          <PartnerIcon className="w-6 h-6" />
          <span className="font-bold">{partner.name}</span>
          {isUsed && <Badge className="bg-white/30">Used</Badge>}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2">{userCoupon.coupon_title}</h3>
        <div className="bg-gray-100 rounded-lg p-3 mb-3 text-center">
          <span className="text-lg font-mono font-bold text-gray-800">{userCoupon.coupon_code}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              {isUsed 
                ? `Used on ${userCoupon.used_date}`
                : `Expires ${userCoupon.expiry_date}`
              }
            </span>
          </div>
          {!isUsed && onUse && (
            <Button onClick={onUse} size="sm" variant="outline">
              Mark as Used
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ChallengeHistoryCard({ history }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">{history.challenge_title}</h3>
            <p className="text-sm text-gray-500">Completed on {history.completed_date}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-purple-600 font-bold">
              <Zap className="w-4 h-4" />
              +{history.xp_earned} XP
            </div>
            {history.savings_earned > 0 && (
              <p className="text-sm text-green-600">₹{history.savings_earned.toLocaleString('en-IN')} saved</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
