import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Gift, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CouponCard({ coupon, onRedeem, userXP }) {
  const isAvailable = coupon.status === 'available';
  const isRedeemed = coupon.status === 'redeemed';
  const isUsed = coupon.status === 'used';
  const canAfford = userXP >= coupon.xp_cost;

  const getBrandColor = (brand) => {
    const colors = {
      'Swiggy': 'from-orange-500 to-red-500',
      'Zomato': 'from-red-500 to-pink-500',
      'Amazon': 'from-yellow-500 to-orange-500',
      'Flipkart': 'from-blue-500 to-indigo-500',
      'Uber': 'from-gray-700 to-gray-900',
      'Ola': 'from-green-500 to-emerald-500',
      'default': 'from-indigo-500 to-purple-500'
    };
    return colors[brand] || colors.default;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden shadow-lg ${
        isUsed ? 'opacity-60' : ''
      }`}
    >
      <div className={`bg-gradient-to-r ${getBrandColor(coupon.brand)} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            <span className="font-bold">{coupon.brand}</span>
          </div>
          {isRedeemed && (
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
              Redeemed
            </span>
          )}
          {isUsed && (
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs flex items-center gap-1">
              <Check className="w-3 h-3" /> Used
            </span>
          )}
        </div>
        <div className="text-3xl font-bold mt-2">{coupon.discount}</div>
        <p className="text-white/80 text-sm mt-1">{coupon.description}</p>
      </div>
      
      <div className="bg-white p-4">
        {isRedeemed && coupon.code && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Coupon Code</p>
            <p className="font-mono font-bold text-lg text-gray-800">{coupon.code}</p>
          </div>
        )}
        
        {isAvailable && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-gray-800">{coupon.xp_cost} XP</span>
            </div>
            <Button
              onClick={() => onRedeem(coupon)}
              disabled={!canAfford}
              size="sm"
              className={canAfford 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                : 'bg-gray-200 text-gray-500'
              }
            >
              {canAfford ? 'Redeem' : 'Not enough XP'}
            </Button>
          </div>
        )}
        
        {isRedeemed && (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Valid for 7 days
          </p>
        )}
      </div>
    </motion.div>
  );
}
