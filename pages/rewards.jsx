import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import CouponCard from '@/components/coupons/CouponCard';
import { ArrowLeft, Gift, Ticket, CheckCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Confetti handled with UI feedback

const AVAILABLE_COUPONS = [
  { title: "10% Off", description: "On your next food order", discount: "10% OFF", brand: "Swiggy", category: "food", xp_cost: 500 },
  { title: "₹100 Off", description: "On orders above ₹500", discount: "₹100 OFF", brand: "Zomato", category: "food", xp_cost: 400 },
  { title: "Free Delivery", description: "On your next 3 orders", discount: "FREE DELIVERY", brand: "Swiggy", category: "food", xp_cost: 300 },
  { title: "20% Off", description: "On first ride of the day", discount: "20% OFF", brand: "Uber", category: "transport", xp_cost: 450 },
  { title: "₹50 Off", description: "On your next ride", discount: "₹50 OFF", brand: "Ola", category: "transport", xp_cost: 350 },
  { title: "10% Cashback", description: "On shopping up to ₹200", discount: "10% CASHBACK", brand: "Amazon", category: "shopping", xp_cost: 600 },
  { title: "₹150 Off", description: "On orders above ₹1000", discount: "₹150 OFF", brand: "Flipkart", category: "shopping", xp_cost: 550 },
];

export default function Rewards() {
  const { user, updateUser } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [couponsData, challengesData] = await Promise.all([
        base44.entities.Coupon.filter({ user_id: user.id }),
        base44.entities.CompletedChallenge.filter({ user_id: user.id }, '-completed_at')
      ]);
      setCoupons(couponsData);
      setCompletedChallenges(challengesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemCoupon = async (coupon) => {
    if ((user.xp_points || 0) < coupon.xp_cost) return;

    const code = generateCouponCode(coupon.brand);
    
    await base44.entities.Coupon.create({
      user_id: user.id,
      title: coupon.title,
      description: coupon.description,
      discount: coupon.discount,
      brand: coupon.brand,
      category: coupon.category,
      code: code,
      xp_cost: coupon.xp_cost,
      status: 'redeemed',
      redeemed_at: new Date().toISOString()
    });

    await updateUser({
      xp_points: (user.xp_points || 0) - coupon.xp_cost
    });

    loadData();
  };

  const generateCouponCode = (brand) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = brand.toUpperCase().slice(0, 3);
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const redeemedCoupons = coupons.filter(c => c.status === 'redeemed');
  const usedCoupons = coupons.filter(c => c.status === 'used');

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
            <h1 className="text-xl font-bold text-white">Rewards</h1>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Your XP Balance</p>
                <p className="text-3xl font-bold text-white">{(user.xp_points || 0).toLocaleString()} XP</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 pt-6">
        <Tabs defaultValue="redeem" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="redeem">Redeem</TabsTrigger>
            <TabsTrigger value="my-coupons">My Coupons</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="redeem" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {AVAILABLE_COUPONS.map((coupon, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CouponCard
                    coupon={{ ...coupon, status: 'available' }}
                    onRedeem={handleRedeemCoupon}
                    userXP={user.xp_points || 0}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-coupons" className="space-y-4">
            {redeemedCoupons.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white rounded-xl">
                <Ticket className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No coupons yet</p>
                <p className="text-sm">Redeem XP to get coupons!</p>
              </div>
            ) : (
              redeemedCoupons.map((coupon, index) => (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CouponCard coupon={coupon} userXP={user.xp_points || 0} />
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* Completed Challenges */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Completed Challenges
              </h3>
              {completedChallenges.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white rounded-xl">
                  No completed challenges yet
                </div>
              ) : (
                <div className="space-y-2">
                  {completedChallenges.slice(0, 10).map((challenge, index) => (
                    <div key={challenge.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{challenge.challenge_title}</p>
                        <p className="text-xs text-gray-500">{new Date(challenge.completed_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-green-600 font-semibold">+{challenge.xp_earned} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Used Coupons */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                Used Coupons
              </h3>
              {usedCoupons.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white rounded-xl">
                  No used coupons yet
                </div>
              ) : (
                usedCoupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} userXP={user.xp_points || 0} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
