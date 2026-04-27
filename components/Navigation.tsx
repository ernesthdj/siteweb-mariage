
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WallSection } from '../types';

interface NavigationProps {
  activeSection: WallSection;
  onNavigate: (section: WallSection) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, onNavigate }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const sections = [
    { id: WallSection.HOME, label: 'Accueil' },
    { id: WallSection.PORTFOLIO, label: 'Portfolio' },
    { id: WallSection.CONTACT, label: 'Contact' },
  ];

  return (
    <nav className="fixed top-14 md:top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 sm:gap-8 md:gap-12 backdrop-blur-xl px-4 sm:px-8 md:px-12 py-3 md:py-4 rounded-full border border-black/[0.03] shadow-sm"
      style={{ backgroundColor: 'color-mix(in srgb, var(--wall-bg) 60%, transparent)' }}>
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

      {/* Toggle dark/light */}
      <button
        onClick={() => setIsDark(prev => !prev)}
        className="ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {isDark ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </nav>
  );
};

export default Navigation;
