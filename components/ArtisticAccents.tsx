
import React from 'react';
import { motion } from 'framer-motion';

export const InkBlot: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <motion.path
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 0.15, scale: 1 }}
      d="M20,50 Q25,30 50,20 T80,50 T50,80 T20,50 M30,40 Q35,35 40,40 T45,35"
      fill="currentColor"
    />
  </svg>
);

export const BowTie: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" stroke="currentColor" strokeWidth="0.8">
    <motion.path
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      transition={{ duration: 2 }}
      d="M50,30 L20,10 Q10,10 10,30 Q10,50 20,50 L50,30 L80,50 Q90,50 90,30 Q90,10 80,10 L50,30 Z"
    />
    <circle cx="50" cy="30" r="4" />
  </svg>
);

export const FlowerBranch: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 200" className={className} fill="none" stroke="currentColor" strokeWidth="0.5">
    <motion.path
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      transition={{ duration: 3 }}
      d="M50,180 Q40,120 60,80 T50,20 M60,80 Q80,70 75,90 M40,110 Q20,100 25,120 M55,40 Q70,30 65,50"
    />
  </svg>
);

export const LoveNote: React.FC<{ text: string, className?: string, rotation?: number }> = ({ text, className, rotation = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 0.4, y: 0 }}
    style={{ rotate: rotation }}
    className={`handwritten text-3xl md:text-5xl pointer-events-none select-none ${className}`}
  >
    {text}
  </motion.div>
);
