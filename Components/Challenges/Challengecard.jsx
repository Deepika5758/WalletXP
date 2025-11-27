import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, CheckCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChallengeCard({ challenge, onAccept, onComplete }) {
  const isActive = challenge.status === 'active';
  const isPending = challenge.status === 'pending';
  const isCompleted = challenge.status === 'completed';

  const getTimeRemaining = () => {
    if (!challenge.expires_at) return null;
    const now = new Date();
    const expires = new Date(challenge.expires_at);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours}h left`;
    return 'Less than 1h left';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 border-2 transition-all ${
        isCompleted 
          ? 'bg-green-50 border-green-200' 
          : isActive 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-white border-gray-100 hover:border-indigo-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
            {isActive && <Timer className="w-4 h-4 text-amber-500 animate-pulse" />}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              challenge.type === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}>
              {challenge.type === 'daily' ? '24h' : 'Weekly'}
            </span>
          </div>
          <h4 className="font-semibold text-gray-800">{challenge.title}</h4>
          {challenge.description && (
            <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-amber-600 font-medium">
              <Zap className="w-4 h-4" />
              <span>+{challenge.xp_reward} XP</span>
            </div>
            {isActive && (
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Clock className="w-3 h-3" />
                <span>{getTimeRemaining()}</span>
              </div>
            )}
          </div>
        </div>
        
        {isPending && onAccept && (
          <Button
            onClick={() => onAccept(challenge)}
            size="sm"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            Accept
          </Button>
        )}
        
        {isActive && onComplete && (
          <Button
            onClick={() => onComplete(challenge)}
            size="sm"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            Complete
          </Button>
        )}
        
        {isCompleted && (
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Done
          </div>
        )}
      </div>
    </motion.div>
  );
}
