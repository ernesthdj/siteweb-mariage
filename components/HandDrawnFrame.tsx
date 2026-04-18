
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HandDrawnFrameProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

const HandDrawnFrame: React.FC<HandDrawnFrameProps> = ({ width, height, children }) => {
  const path = useMemo(() => {
    const jitter = 4;
    const w = width;
    const h = height;
    
    // Create a slightly irregular rectangle path
    return `
      M ${jitter},${jitter} 
      Q ${w/2 + (Math.random()-0.5)*jitter},${(Math.random()-0.5)*jitter} ${w-jitter},${jitter}
      Q ${w + (Math.random()-0.5)*jitter},${h/2} ${w-jitter},${h-jitter}
      Q ${w/2},${h + (Math.random()-0.5)*jitter} ${jitter},${h-jitter}
      Q ${(Math.random()-0.5)*jitter},${h/2} ${jitter},${jitter}
      Z
    `;
  }, [width, height]);

  return (
    <div className="relative p-8 group">
      <div className="relative z-10" style={{ width, height }}>
        {children}
      </div>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-500 group-hover:scale-[1.02]"
        viewBox={`0 0 ${width + 64} ${height + 64}`}
        preserveAspectRatio="none"
      >
        <motion.path
          d={path}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          transform="translate(32, 32)"
        />
        {/* Decorative double line effect */}
        <motion.path
          d={path}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="0.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          transform="translate(35, 35)"
        />
      </svg>
    </div>
  );
};

export default HandDrawnFrame;
