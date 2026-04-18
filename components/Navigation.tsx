
import React from 'react';
import { motion } from 'framer-motion';
import { WallSection } from '../types';

interface NavigationProps {
  activeSection: WallSection;
  onNavigate: (section: WallSection) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, onNavigate }) => {
  const sections = [
    { id: WallSection.HOME, label: 'Accueil' },
    { id: WallSection.PORTFOLIO, label: 'Portfolio' },
    { id: WallSection.CONTACT, label: 'Contact' },
  ];

  return (
    <nav className="fixed top-14 md:top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 sm:gap-8 md:gap-12 bg-white/60 backdrop-blur-xl px-4 sm:px-8 md:px-12 py-3 md:py-4 rounded-full border border-black/[0.03] shadow-sm">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onNavigate(section.id)}
          className="relative group py-1 outline-none"
          aria-label={`Naviguer vers ${section.label}`}
        >
          <span className={`text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all duration-700 font-medium ${
            activeSection === section.id ? 'text-black' : 'text-zinc-400 group-hover:text-zinc-600'
          }`}>
            {section.label}
          </span>
          {activeSection === section.id && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-1 left-0 right-0 h-[1px] bg-black/40"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
