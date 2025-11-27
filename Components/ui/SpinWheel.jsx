import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const CHALLENGES = [
  { title: "Walk Instead of Uber", description: "Take a walk instead of booking a cab today", xp: 50 },
  { title: "No Food Delivery", description: "Cook at home instead of ordering food", xp: 75 },
  { title: "Skip Coffee Shop", description: "Make coffee at home instead of buying", xp: 30 },
  { title: "Free Entertainment", description: "Watch free content instead of paid streaming", xp: 40 },
  { title: "Pack Lunch", description: "Bring lunch from home to work", xp: 60 },
  { title: "No Online Shopping", description: "Avoid any online purchases today", xp: 80 },
  { title: "Use Public Transport", description: "Take bus/metro instead of personal vehicle", xp: 45 },
  { title: "DIY Day", description: "Do something yourself instead of paying for service", xp: 55 },
];

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

export default function SpinWheel({ onSpinComplete }) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const wheelRef = useRef(null);

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedChallenge(null);
    
    const randomIndex = Math.floor(Math.random() * CHALLENGES.length);
    const segmentAngle = 360 / CHALLENGES.length;
    const targetRotation = 360 * 5 + (randomIndex * segmentAngle) + (segmentAngle / 2);
    
    setRotation(prev => prev + targetRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedChallenge(CHALLENGES[randomIndex]);
    }, 4000);
  };

  const handleAccept = () => {
    if (selectedChallenge && onSpinComplete) {
      onSpinComplete(selectedChallenge);
      setSelectedChallenge(null);
    }
  };

  const segmentAngle = 360 / CHALLENGES.length;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-amber-500 drop-shadow-lg" />
        </div>
        
        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="w-72 h-72 rounded-full relative overflow-hidden shadow-2xl border-4 border-amber-400"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "easeOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {CHALLENGES.map((challenge, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = startAngle + segmentAngle;
              const largeArc = segmentAngle > 180 ? 1 : 0;
              
              const x1 = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
              const y2 = 50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);
              
              const textAngle = startAngle + segmentAngle / 2 - 90;
              const textX = 50 + 30 * Math.cos(textAngle * Math.PI / 180);
              const textY = 50 + 30 * Math.sin(textAngle * Math.PI / 180);
              
              return (
                <g key={index}>
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="3"
                    fontWeight="bold"
                    transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                  >
                    {challenge.title.split(' ').slice(0, 2).join(' ')}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
            <span className="text-amber-500 font-bold text-xs">SPIN</span>
          </div>
        </motion.div>
      </div>
      
      <button
        onClick={spin}
        disabled={isSpinning}
        className={`px-8 py-3 rounded-full font-bold text-white text-lg shadow-lg transition-all transform hover:scale-105 ${
          isSpinning 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
        }`}
      >
        {isSpinning ? 'Spinning...' : 'SPIN THE WHEEL!'}
      </button>
      
      {selectedChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-amber-200 max-w-sm text-center"
        >
          <div className="text-amber-500 text-sm font-semibold mb-2">🎉 Challenge Unlocked!</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedChallenge.title}</h3>
          <p className="text-gray-600 mb-3">{selectedChallenge.description}</p>
          <div className="text-amber-600 font-bold mb-4">+{selectedChallenge.xp} XP</div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSelectedChallenge(null)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600"
            >
              Accept Challenge
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
