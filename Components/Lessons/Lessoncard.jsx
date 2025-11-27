import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Star, ChevronRight } from 'lucide-react';

export default function LessonCard({ lesson, isCompleted, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all shadow-lg ${
        isCompleted 
          ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300' 
          : 'bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-xl'
      }`}
    >
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isCompleted ? 'bg-green-500' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
        }`}>
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">{lesson.title}</h3>
          <p className="text-sm text-gray-500 mb-2">{lesson.cards?.length || 0} cards</p>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">+{lesson.xp_reward} XP</span>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
      </div>
    </motion.div>
  );
}
