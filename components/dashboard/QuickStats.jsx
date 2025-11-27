import React from 'react';
import { Wallet, TrendingDown, CheckCircle, BookOpen } from 'lucide-react';

export default function QuickStats({ totalSavings, monthlySpent, challengesCompleted, lessonsCompleted }) {
  const stats = [
    {
      icon: Wallet,
      label: 'Total Saved',
      value: `₹${(totalSavings || 0).toLocaleString('en-IN')}`,
      color: 'bg-green-50 text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      icon: TrendingDown,
      label: 'This Month',
      value: `₹${(monthlySpent || 0).toLocaleString('en-IN')}`,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      icon: CheckCircle,
      label: 'Challenges',
      value: challengesCompleted || 0,
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      icon: BookOpen,
      label: 'Lessons',
      value: lessonsCompleted || 0,
      color: 'bg-orange-50 text-orange-600',
      iconBg: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.color} rounded-xl p-4 border border-white/50`}>
          <div className={`${stat.iconBg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm opacity-80">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
