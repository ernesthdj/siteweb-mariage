/**
 * Breadcrumb — Fil d'Ariane pour la navigation hierarchique
 * Positionne sous la navbar existante : fixed top-[72px] md:top-[88px], centre
 * text-[8px] uppercase tracking-[0.3em]
 * Separateur : > (chevron)
 * Animation fadeIn + slideRight (Framer Motion)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
/** Segment de breadcrumb pour la navigation hierarchique */
interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ segments }) => {
  if (segments.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-[72px] md:top-[88px] left-1/2 -translate-x-1/2 z-[190] flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-black/[0.03]"
        aria-label="Fil d'Ariane"
      >
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Separateur chevron */}
              {index > 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="text-[7px] text-zinc-200 mx-0.5 select-none"
                >
                  &rsaquo;
                </motion.span>
              )}

              {/* Segment */}
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.08,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                {isLast || !segment.onClick ? (
                  <span
                    className={`text-[8px] uppercase tracking-[0.3em] ${
                      isLast ? 'text-zinc-500' : 'text-zinc-300'
                    }`}
                  >
                    {segment.label}
                  </span>
                ) : (
                  <button
                    onClick={segment.onClick}
                    className="text-[8px] uppercase tracking-[0.3em] text-zinc-300 hover:text-zinc-600 transition-colors duration-200"
                  >
                    {segment.label}
                  </button>
                )}
              </motion.span>
            </React.Fragment>
          );
        })}
      </motion.nav>
    </AnimatePresence>
  );
};

export default Breadcrumb;
