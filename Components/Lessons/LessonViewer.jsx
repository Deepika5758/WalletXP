import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Note: confetti effect simulated with CSS animation

export default function LessonViewer({ lesson, onClose, onComplete, isCompleted }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const cards = lesson.cards || [];
  const isLastCard = currentCard === cards.length - 1;

  const nextCard = () => {
    if (isLastCard) {
      if (!isCompleted) {
        setShowCompletion(true);
        onComplete(lesson);
      } else {
        onClose();
      }
    } else {
      setDirection(1);
      setCurrentCard(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setDirection(-1);
      setCurrentCard(prev => prev - 1);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  if (showCompletion) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lesson Complete!</h2>
          <p className="text-gray-600 mb-4">You've mastered "{lesson.title}"</p>
          <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-xl mb-6">
            <Star className="w-6 h-6" />
            <span>+{lesson.xp_reward} XP</span>
          </div>
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg">{lesson.title}</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentCard + 1) / cards.length) * 100}%` }}
                className="h-full bg-white rounded-full"
              />
            </div>
            <span className="text-sm">{currentCard + 1}/{cards.length}</span>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="relative h-80 overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentCard}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 p-6"
            >
              {cards[currentCard] && (
                <div className="h-full flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {cards[currentCard].title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed flex-1 overflow-y-auto">
                    {cards[currentCard].content}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Navigation */}
        <div className="p-4 border-t flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevCard}
            disabled={currentCard === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            onClick={nextCard}
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            {isLastCard ? (isCompleted ? 'Finish' : 'Complete') : 'Next'}
            {!isLastCard && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
