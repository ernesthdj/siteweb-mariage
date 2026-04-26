
import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { WallSection, ExhibitionTheme } from '../types';
import { EXHIBITION_THEMES, GALLERY_ALBUMS, GalleryAlbum } from '../constants';
import ThemeCanvas from './ThemeCanvas';
import GalleryView from './GalleryView';
import MosaicGalleryView from './MosaicGalleryView';
import MockGalleryView from './MockGalleryView';
import { LoveNote } from './ArtisticAccents';
import PhotoFrame from './PhotoFrame';

interface GalleryWallProps {
  activeSection: WallSection;
  onSectionChange: (section: WallSection) => void;
}

const GalleryWall: React.FC<GalleryWallProps> = ({ activeSection, onSectionChange }) => {
  const [selectedTheme, setSelectedTheme] = useState<ExhibitionTheme | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [mosaicScrollPosition, setMosaicScrollPosition] = useState<number>(0);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const { scrollXProgress } = useScroll({
    container: horizontalScrollRef
  });

  // scrollWidth disponible pour animation future
  useSpring(scrollXProgress, { stiffness: 60, damping: 25 });

  // Fermer toutes les galeries quand on navigue vers une autre section
  useEffect(() => {
    setSelectedTheme(null);
    setSelectedAlbum(null);
  }, [activeSection]);

  // Navigation SPATIALE : Translation fluide au clic sur les menus
  useEffect(() => {
    const el = horizontalScrollRef.current;
    if (!el) return;

    let targetX = 0;
    if (activeSection === WallSection.HOME) targetX = homeRef.current?.offsetLeft || 0;
    if (activeSection === WallSection.PORTFOLIO) targetX = portfolioRef.current?.offsetLeft || 0;
    if (activeSection === WallSection.CONTACT) targetX = contactRef.current?.offsetLeft || 0;

    el.scrollTo({ left: targetX, behavior: 'smooth' });

    // Reset du scroll vertical de l'accueil quand on change de section
    if (activeSection !== WallSection.HOME && homeRef.current) {
      homeRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSection]);

  // Gestion du scroll à la molette - GLISSEMENT DOUX
  useEffect(() => {
    const el = horizontalScrollRef.current;
    if (!el) return;

    let targetScroll = el.scrollLeft;
    let animationFrameId: number | null = null;

    // ====== PARAMÈTRES DE FLUIDITÉ (identiques au carousel) ======
    const EASE_FACTOR = 0.05;      // Facteur d'interpolation (plus bas = plus doux)
    const WHEEL_SENSITIVITY = 3.0; // Sensibilité de la molette
    // =============================================================

    const smoothScroll = () => {
      const currentScroll = el.scrollLeft;
      const diff = targetScroll - currentScroll;

      // Simple interpolation linéaire, pas de ressort
      if (Math.abs(diff) > 0.5) {
        el.scrollLeft = currentScroll + diff * EASE_FACTOR;
        animationFrameId = requestAnimationFrame(smoothScroll);
      } else {
        el.scrollLeft = targetScroll;
        animationFrameId = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Si on est sur l'Accueil ou Contact, on laisse le comportement vertical par défaut
      if (activeSection !== WallSection.PORTFOLIO) return;

      // Si on est dans le Portfolio, on capture le scroll vertical pour le rendre horizontal
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();

        // Limites strictes : ne pas sortir du mur Portfolio
        const portStart = portfolioRef.current?.offsetLeft || 0;
        const portEnd = contactRef.current?.offsetLeft || el.scrollWidth;
        const maxPossible = portEnd - el.clientWidth;

        // Mise à jour du target
        targetScroll = el.scrollLeft + e.deltaY * WHEEL_SENSITIVITY;
        targetScroll = Math.max(portStart, Math.min(targetScroll, maxPossible));

        // Démarrer l'animation si pas déjà en cours
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(smoothScroll);
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [activeSection]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white wall-texture">
      <motion.div
        ref={horizontalScrollRef}
        className="flex h-full w-full overflow-x-auto overflow-y-hidden items-center select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >

        {/* MUR 1: ACCUEIL + À PROPOS */}
        <section
          ref={homeRef}
          className="flex-shrink-0 w-screen h-full overflow-y-auto overflow-x-hidden relative scroll-smooth bg-[#faf8f5] wall-texture"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Hero */}
          <div className="w-full h-full flex flex-col justify-center px-6 md:px-[10vw] relative shrink-0 overflow-hidden">

            {/* ========== IMAGE HERO PRINCIPALE - RESPONSIVE ========== */}
            <motion.img
              src="https://res.cloudinary.com/dzoshz4ut/image/upload/v1770059801/photo_mockup_2_gkf5p1.png"
              alt="Photo hero"
              initial={{ opacity: 0, scale: 0.9, rotate: 8 }}
              animate={{ opacity: 1, scale: 1, rotate: 5 }}
              whileHover={{
                scale: 1.02,
                rotate: 1,
                transition: { duration: 0.5 }
              }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute z-[3] h-auto object-contain cursor-pointer
                hidden sm:block
                right-[5%] sm:right-[10%] md:right-[15%]
                top-[15%] sm:top-[10%]
                w-[200px] sm:w-[350px] md:w-[500px] lg:w-[700px] xl:w-[900px]"
              style={{
                filter: 'drop-shadow(10px 15px 30px rgba(0,0,0,0.2))',
              }}
            />
            {/* ========== FIN IMAGE HERO ========== */}

            <div className="max-w-4xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
              >
                <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-black mb-4 md:mb-6">Photographe de mariage & famille</p>
                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl serif italic tracking-tight leading-[0.9] mb-4 md:mb-6 text-black">
                  Ernest H<span className="text-black/40">.</span> Photography
                </h1>

                {/* Promesse principale - phrase courte et élégante */}
                <p className="text-base sm:text-lg md:text-xl text-black/80 font-light mb-6 md:mb-8 max-w-md leading-relaxed">
                  Des émotions vraies, une lumière naturelle,<br className="hidden sm:block" />
                  <span className="italic">des souvenirs pour toujours.</span>
                </p>

                <div className="w-16 md:w-24 h-[1px] bg-zinc-200 mb-8 md:mb-10" />

                {/* CTA Principal - bouton élégant avec effet papier */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mb-6">
                  <button
                    onClick={() => onSectionChange(WallSection.PORTFOLIO)}
                    className="group relative px-8 py-4 bg-[#1a1a1a] text-white overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                  >
                    <span className="relative z-10 text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-medium">
                      Découvrir mes collections
                    </span>
                    <div className="absolute inset-0 bg-[#2a2a2a] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </button>

                  {/* CTA Secondaire - très fin */}
                  <button
                    onClick={() => onSectionChange(WallSection.PORTFOLIO)}
                    className="group flex items-center gap-3 text-zinc-400 hover:text-zinc-700 transition-colors duration-300"
                  >
                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em]">Voir un mariage complet</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </button>
                </div>

                {/* Signal de confiance - localisation */}
                <div className="flex items-center gap-3 text-zinc-400 mt-8 md:mt-12">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-[10px] md:text-xs tracking-wide">Basé en Belgique — Disponible pour vos événements en Europe</span>
                </div>

                {/* Citation client manuscrite */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="mt-8 md:mt-12 pl-4 border-l border-zinc-200"
                >
                  <p className="handwritten text-xl md:text-2xl text-zinc-400 italic leading-relaxed">
                    "Il a su capturer l'essence même de notre journée..."
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-300 mt-2">— Marie & Thomas, 2024</p>
                </motion.div>
              </motion.div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20">
              <span className="text-[7px] uppercase tracking-[0.4em]">Défiler</span>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-[1px] h-8 bg-black" />
            </div>
          </div>

          {/* À Propos */}
          <div className="w-full py-12 sm:py-20 md:py-40 px-4 sm:px-6 md:px-[10vw] relative border-t border-zinc-100/50 overflow-hidden">
            {/* Image décorative - cachée sur mobile, visible sur tablette+ */}
            <motion.img
              src="https://res.cloudinary.com/dzoshz4ut/image/upload/v1770078835/photo_mockup_4_qp4qt7.png"
              alt="Décoration"
              initial={{ opacity: 0, x: 50, rotate: 0 }}
              whileInView={{ opacity: 0.85, x: 0, rotate: -10 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute h-auto object-contain pointer-events-none z-[1]
                hidden md:block
                right-[40%] lg:right-[47%]
                top-[75%] lg:top-[78%]
                w-[400px] lg:w-[500px] xl:w-[600px]"
              style={{
                filter: 'drop-shadow(4px 6px 12px rgba(0,0,0,0.15))',
              }}
            />
            <div className="max-w-7xl mx-auto">
              {/* Header avec photo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center mb-16 md:mb-24">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.5 }}
                  className="space-y-6 md:space-y-8"
                >
                  <h2 className="text-3xl sm:text-5xl md:text-7xl serif italic leading-tight">L'Âme derrière<br />l'Objectif</h2>
                  <div className="w-20 h-[1px] bg-black/10" />
                  <p className="text-xl md:text-2xl serif italic text-zinc-600">
                    "Un conteur passionné..."
                  </p>
                </motion.div>
                <div className="flex justify-center md:justify-end">
                  <PhotoFrame
                    index={0}
                    photo={{
                      id: 'ernest',
                      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800',
                      title: 'Ernest',
                      subtitle: 'Photographe',
                      width: 280,
                      height: 400,
                      rotation: 1.5,
                      mount: 'corners'
                    }}
                  />
                </div>
              </div>

              {/* Texte principal */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="max-w-3xl"
              >
                <div className="space-y-6 text-zinc-500 font-light leading-relaxed">
                  <p>
                    La photographie est ma passion depuis que j'ai pris mon premier appareil photo à l'âge de 16 ans. Ce qui n'était au départ qu'une simple fascination pour la lumière et la composition est rapidement devenu un amour durable pour raconter des histoires à travers les images.
                  </p>
                  <p>En 2020, j'ai décidé de consacrer plus de temps à cet art, transformant cette passion de toujours en un engagement plus profond pour capturer le monde tel que je le perçois.</p>
                  <p>
                    Mon approche photographique repose sur <span className="text-zinc-700 font-normal">l'authenticité, l'émotion et l'humanité</span>. <p>Je m'efforce de raconter des histoires qui résonnent, des histoires qui vont au-delà de la surface pour révéler des connexions sincères et des moments bruts.</p>
                  </p>
                  <p>
                    Que ce soit la joie d'un mariage, le charme d'un paysage urbain ou la beauté discrète de la vie quotidienne, mon objectif est de documenter l'essence brute et non filtrée de chaque scène.
                  </p>
                  <p>
                    Fort de plusieurs années d'expérience dans des contextes variés, des mariages aux événements corporate, je me concentre sur la création d'images aussi réelles et uniques que les personnes et les lieux qu'elles représentent.
                  </p>
                  <p className="text-zinc-700 italic serif text-lg md:text-xl">
                    Ma photographie ne cherche pas la perfection ; elle s'attache à la vérité : "trouver la beauté dans l'éphémère, le spontané et l'imparfait".
                  </p>
                  <p>
                    À travers mon objectif, je vise à préserver des souvenirs qui évoquent non seulement un lieu ou un moment, mais aussi les émotions qui rendent chaque instant inoubliable. <p>Créons ensemble quelque chose d'intemporel.</p>
                  </p>
                </div>

                <div className="pt-10 md:pt-16 flex items-center gap-6">
                  <LoveNote text="Ernest H." className="text-4xl md:text-5xl" rotation={-1} />
                  <img
                    src="https://res.cloudinary.com/dzoshz4ut/image/upload/v1769987602/Cachet_gx0gvs.png"
                    alt="Cachet Ernest H. Photography"
                    className="w-16 h-16 md:w-20 md:h-20 object-contain opacity-80"
                    style={{ filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.25))' }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* MUR 2: PORTFOLIO (Irrégulier & Confondu) */}
        <div ref={portfolioRef} className="flex-shrink-0 flex items-center h-full bg-[#faf8f5] wall-texture px-2 sm:px-[3vw] md:px-[5vw] relative">
          {/* Couche d'ombre portée */}
          <div
            className="absolute inset-0 z-[10] pointer-events-none"
            style={{
              backgroundImage: 'url(https://res.cloudinary.com/dzoshz4ut/image/upload/v1769988211/Ombre_2_dtue5d.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="flex-shrink-0 w-[50vw] sm:w-[45vw] md:w-[40vw] flex flex-col justify-center px-3 sm:px-6 md:px-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl serif italic mb-2 sm:mb-4">Collections</h2>
              <div className="w-12 sm:w-16 h-[1px] bg-black/10 mb-4 sm:mb-6" />
              <p className="text-[7px] sm:text-[8px] md:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.5em] text-zinc-400">
                <span className="hidden md:inline">Navigation à la molette</span>
                <span className="md:hidden">Glissez →</span>
              </p>
            </motion.div>
          </div>

          <div className="flex items-center">
            {EXHIBITION_THEMES.map((theme, idx) => (
              <ThemeCanvas key={theme.id} theme={theme} index={idx} onClick={() => setSelectedTheme(theme)} />
            ))}
          </div>

          {/* Spacer technique pour la fin du mur */}
          <div className="flex-shrink-0 w-[20vw] sm:w-[30vw] h-full" />
        </div>

        {/* MUR 3: CONTACT */}
        <section ref={contactRef} className="flex-shrink-0 w-screen h-full flex flex-col justify-center px-4 sm:px-6 md:px-[10vw] relative bg-[#faf8f5] wall-texture overflow-y-auto">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-20 items-end py-8 sm:py-10 md:py-0">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.5 }}>
              <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl serif italic mb-4 sm:mb-6 md:mb-12">Contact</h2>
              <LoveNote text="Discutons de votre projet" className="text-lg sm:text-2xl md:text-4xl lg:text-5xl text-zinc-300 mb-6 sm:mb-8 md:mb-16" rotation={1} />

              <div className="space-y-4 sm:space-y-6">
                <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-400">Email</p>
                <p className="text-lg sm:text-xl md:text-2xl serif italic hover:translate-x-2 transition-transform cursor-pointer break-all sm:break-normal">hello@atypique-studio.com</p>
              </div>
            </motion.div>

            <div className="relative">
              <div className="bg-white p-4 sm:p-6 md:p-12 shadow-[10px_10px_30px_rgba(0,0,0,0.05)] sm:shadow-[20px_20px_60px_rgba(0,0,0,0.05)] md:shadow-[40px_40px_100px_rgba(0,0,0,0.05)] border border-zinc-50 relative z-10">
                <form className="space-y-4 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label htmlFor="contact-name" className="sr-only">Votre Nom</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Votre Nom"
                      aria-label="Votre Nom"
                      className="w-full border-b border-zinc-100 py-2 sm:py-3 outline-none focus:border-black transition-colors text-sm font-light bg-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="sr-only">Votre message</label>
                    <textarea
                      id="contact-message"
                      placeholder="Votre message..."
                      aria-label="Votre message"
                      className="w-full border-b border-zinc-100 py-2 sm:py-3 outline-none focus:border-black transition-colors text-sm font-light h-20 sm:h-24 resize-none bg-transparent"
                    />
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-3 sm:py-4 text-[8px] sm:text-[9px] uppercase tracking-[0.4em] sm:tracking-[0.5em] mt-4 sm:mt-6">
                    Envoyer
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

      </motion.div>

      <AnimatePresence>
        {/* Mosaïque d'albums - reste visible même quand un album est ouvert (en dessous) */}
        {selectedTheme && selectedTheme.type === 'showcase' && (
          <MosaicGalleryView
            key="mosaic"
            albums={GALLERY_ALBUMS}
            title={selectedTheme.title}
            onClose={() => {
              setSelectedTheme(null);
              setMosaicScrollPosition(0);
            }}
            onAlbumClick={(album) => setSelectedAlbum(album)}
            savedScrollPosition={mosaicScrollPosition}
            onScrollPositionChange={setMosaicScrollPosition}
          />
        )}

        {/* Carousel plein écran - s'affiche par-dessus la mosaïque */}
        {selectedAlbum !== null && (
          <MockGalleryView
            key="carousel"
            photos={selectedAlbum.photos}
            title={selectedAlbum.title}
            startIndex={0}
            onClose={() => setSelectedAlbum(null)}
          />
        )}

        {/* Albums normaux */}
        {selectedTheme && selectedTheme.type !== 'showcase' && (
          <GalleryView
            theme={selectedTheme}
            onClose={() => setSelectedTheme(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryWall;
