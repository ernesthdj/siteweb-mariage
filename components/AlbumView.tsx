
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExhibitionTheme } from '../types';
import PhotoFrame from './PhotoFrame';
import { LoveNote, InkBlot } from './ArtisticAccents';

interface AlbumViewProps {
  album: ExhibitionTheme;
  onClose: () => void;
}

const AlbumView: React.FC<AlbumViewProps> = ({ album, onClose }) => {
  const [stage, setStage] = useState<'animating' | 'opened'>('animating');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => setStage('opened'), 1400);
    return () => {
      document.body.style.overflow = 'auto';
      clearTimeout(timer);
    };
  }, []);

  const isMaternity = album.type === 'birth';
  const isWedding = album.type === 'wedding';
  const isEngagement = album.type === 'portrait';
  const coverBg = isWedding ? '#5d3a1a' : isMaternity ? '#f8d7da' : '#222';

  return (
    <motion.div 
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className={`absolute inset-0 z-0 backdrop-blur-3xl
          ${isMaternity ? 'bg-[#fff5f5]/95' : isWedding ? 'bg-[#fdfbf7]/98' : 'bg-[#fcfcfc]/98'}
        `}
      />

      {/* Objet Album en transition - z-index géré pour ne pas gêner le contenu final */}
      <div className={`relative w-full h-full flex items-center justify-center pointer-events-none transition-all duration-700 ${stage === 'opened' ? 'z-10 opacity-0' : 'z-50'}`}>
        <AnimatePresence mode="wait">
          {stage === 'animating' && (
            <motion.div 
              layoutId={`album-cover-${album.id}`}
              className={`relative shadow-2xl
                ${isWedding ? 'w-[340px] h-[400px] rounded-[4px]' : ''}
                ${isMaternity ? 'w-[320px] h-[320px] rounded-[40px]' : ''}
                ${isEngagement ? 'w-[420px] h-[300px] rounded-sm' : ''}
              `}
              style={{ transformStyle: 'preserve-3d', originX: 0 }}
              initial={false}
              animate={{ 
                scale: 1.4,
                rotateY: 0,
                y: -30 
              }}
              exit={{ opacity: 0, scale: 1.8, transition: { duration: 0.6 } }}
              transition={{ 
                layout: { duration: 0.9, ease: [0.65, 0, 0.35, 1] },
                scale: { duration: 1.2, ease: [0.65, 0, 0.35, 1] }
              }}
            >
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -155 }}
                transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.1 }}
                style={{ transformStyle: 'preserve-3d', originX: 0, backfaceVisibility: 'hidden' }}
                className="absolute inset-0 z-20 rounded-[inherit] shadow-2xl flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0" style={{ backgroundColor: coverBg }}>
                   <div className="absolute inset-0 opacity-40 mix-blend-multiply" 
                        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")' }} />
                </div>
                
                <div className="w-40 h-56 bg-white p-1 shadow-inner overflow-hidden relative z-10">
                   <img src={album.coverUrl} className="w-full h-full object-cover grayscale brightness-90" alt="" />
                </div>

                <div 
                  className="absolute inset-0 z-10 rounded-[inherit] flex items-center justify-center bg-[#fdfbf7]"
                  style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                   <div className="p-8 text-center opacity-30">
                      <InkBlot className="w-12 mx-auto mb-4" />
                      <p className="handwritten text-lg">Chapitre I</p>
                   </div>
                </div>
              </motion.div>
              <div className="absolute inset-0 bg-[#fdfbf7] -z-10 shadow-xl rounded-[inherit] border-l border-black/5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONTENU DE L'ALBUM - Z-index élevé pour être au premier plan */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={stage === 'opened' ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`absolute inset-0 overflow-y-auto wall-texture z-[70]
          ${stage === 'opened' ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
        style={{ scrollbarWidth: 'none' }}
      >
        <button 
          onClick={onClose}
          className="fixed top-12 left-12 z-[80] group flex items-center gap-6"
        >
          <div className={`w-12 h-16 flex items-center justify-center group-hover:h-20 transition-all duration-500 shadow-md
            ${isWedding ? 'bg-[#b58b4c]' : isMaternity ? 'bg-pink-200' : 'bg-black'}
          `}
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500 group-hover:text-black transition-colors font-bold">Quitter le carnet</span>
        </button>

        <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-multiply" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />

        <div className="fixed top-0 bottom-0 left-1/2 w-[3px] bg-black/[0.03] z-0 pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.05)]" />

        <div className="max-w-7xl mx-auto px-4 md:px-10 pt-48 pb-96 relative z-10">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={stage === 'opened' ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ delay: 0.4, duration: 1.2 }}
            className="text-center mb-80"
          >
            <LoveNote 
              text={album.title} 
              className={`text-6xl md:text-[9rem] mb-12 ${isWedding ? 'text-[#4a2e15]' : isMaternity ? 'text-pink-400/60' : ''}`} 
              rotation={-0.5} 
            />
            <div className="max-w-xl mx-auto">
               <p className="text-gray-500 font-light italic leading-[2.5] text-lg px-6 md:text-xl handwritten">
                {album.description}
               </p>
            </div>
          </motion.div>

          <div className="relative w-full space-y-[-10rem] md:space-y-[-20rem]">
            {album.photos.map((photo, i) => {
              // Calcul de positions décalées pour briser le grid
              const isEven = i % 2 === 0;
              const sideOffset = isEven ? 'md:ml-[-10%] md:mr-[auto]' : 'md:mr-[-10%] md:ml-[auto]';
              const verticalShift = i === 0 ? 'mt-0' : 'mt-40 md:mt-64';

              return (
                <div 
                  key={photo.id} 
                  className={`flex items-center justify-center w-full relative ${verticalShift}`}
                  style={{ zIndex: 10 + i }}
                >
                  <div className={`transition-transform duration-1000 ${sideOffset}`}>
                    <PhotoFrame photo={photo} index={i} />
                  </div>
                  
                  {/* Notes et taches d'encre décoratives aléatoires */}
                  {i % 2 === 0 && (
                    <div className="absolute top-1/2 -right-10 pointer-events-none opacity-10 rotate-12 scale-150 hidden md:block">
                      <InkBlot className="w-32" />
                    </div>
                  )}
                  {i === 2 && (
                    <div className="absolute -top-20 -left-20 pointer-events-none opacity-20 rotate-[-45deg] hidden md:block">
                      <LoveNote text="Souvenirs précieux" className="text-2xl" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-96 text-center pb-20 opacity-30">
             <InkBlot className="w-16 mx-auto mb-10" />
             <LoveNote text="Fin de ce carnet" className="text-5xl" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AlbumView;
