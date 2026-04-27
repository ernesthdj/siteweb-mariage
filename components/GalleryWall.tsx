
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { WallSection } from '../types';
import { useItems } from '../src/hooks/useItems';
import { useAdmin } from '../src/components/admin/AdminContext';
import ItemControls from '../src/components/admin/ItemControls';
import AddItemButton from '../src/components/admin/AddItemButton';
import ItemForm from '../src/components/admin/ItemForm';
import { LoveNote } from './ArtisticAccents';
import PhotoFrame from './PhotoFrame';
import type { Item, CreateItemPayload, UpdateItemPayload } from '../src/types';

/** Carte visuelle d'une collection — style galerie murale */
const CollectionCard: React.FC<{
  item: Item;
  index: number;
  onClick: () => void;
}> = ({ item, index, onClick }) => {
  const variations = [
    { rotate: -3, y: -60, scale: 0.85, aspect: 'aspect-[3/4]' },
    { rotate: 2.5, y: 40, scale: 0.95, aspect: 'aspect-[4/5]' },
    { rotate: -1, y: -15, scale: 0.8, aspect: 'aspect-[2/3]' },
    { rotate: 4, y: 70, scale: 0.9, aspect: 'aspect-[3/4]' },
    { rotate: -4.5, y: -80, scale: 1.0, aspect: 'aspect-[4/5]' },
    { rotate: 1.5, y: 25, scale: 0.82, aspect: 'aspect-[3/4]' },
    { rotate: -3.8, y: -35, scale: 0.92, aspect: 'aspect-[2/3]' },
    { rotate: 2.5, y: 60, scale: 0.78, aspect: 'aspect-[3/4]' },
  ];

  const variant = variations[index % variations.length];

  const frameStyles: Record<string, string> = {
    wedding: 'shadow-[20px_20px_60px_rgba(0,0,0,0.1)] border-[10px] border-white',
    culinary: 'shadow-[10px_10px_40px_rgba(0,0,0,0.06)] border-[1px] border-black/10',
    urban: 'shadow-2xl border-[12px] border-zinc-900',
    birth: 'rounded-[40px] shadow-lg border-[6px] border-white/80',
    nature: 'shadow-2xl border-[8px] border-[#1e272e]',
    fashion: 'shadow-[20px_20px_0px_rgba(0,0,0,0.02)] border-[1.5px] border-black',
    architecture: 'shadow-none border-[1px] border-zinc-300',
    portrait: 'shadow-2xl border-[15px] border-white outline outline-1 outline-black/5',
    showcase: '',
  };

  const frameClass = frameStyles[item.variant] ?? '';

  // Rendu pour showcase et standard (PNG transparent, pas de cadre)
  if (item.variant === 'showcase' || item.variant === 'standard') {
    return (
      <motion.div
        onClick={onClick}
        style={{ rotate: -2, y: -20, scale: 0.95 }}
        whileHover={{
          y: -40,
          scale: 1.02,
          rotate: 0,
          transition: { duration: 0.5, ease: 'easeOut' },
        }}
        whileTap={{ scale: 0.98 }}
        className="relative cursor-pointer flex-shrink-0 mx-4 sm:mx-8 md:mx-12 lg:mx-20 flex flex-col items-center canvas-spotlight"
      >
        {item.url && (
          <motion.img
            src={item.url}
            alt={item.label}
            className="h-auto object-contain transition-transform duration-500
              w-[200px] sm:w-[280px] md:w-[400px] lg:w-[500px] xl:w-[550px]"
            style={{ filter: 'drop-shadow(8px 12px 25px rgba(0,0,0,0.2))' }}
          />
        )}
        <div className="mt-2 sm:mt-4 text-center">
          <h3 className="handwritten text-lg sm:text-xl md:text-2xl lg:text-3xl text-black/90">
            {item.label}
          </h3>
        </div>
      </motion.div>
    );
  }

  // Rendu standard avec cadre
  return (
    <motion.div
      onClick={onClick}
      style={{
        rotate: variant.rotate * 0.5,
        y: variant.y * 0.5,
        scale: variant.scale,
      }}
      whileHover={{
        y: variant.y - 20,
        scale: variant.scale * 1.08,
        rotate: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
      }}
      whileTap={{ scale: variant.scale * 0.95 }}
      className={`relative cursor-pointer flex-shrink-0
        w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px]
        mx-3 sm:mx-6 md:mx-12 lg:mx-20
        overflow-hidden canvas-spotlight ${variant.aspect} ${frameClass}`}
    >
      {item.url && (
        <img
          src={item.url}
          alt={item.label}
          className="absolute inset-0 w-full h-full object-contain grayscale-[0.4] hover:grayscale-0 transition-all duration-1000"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-3 sm:left-4 md:left-5 right-3 sm:right-4 md:right-5 text-white">
        <p className="text-[6px] sm:text-[7px] mb-0.5 sm:mb-1 uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-70 font-medium">
          {item.subtitle}
        </p>
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl serif italic leading-none">
          {item.label}
        </h3>
      </div>

      <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 mix-blend-difference">
        <span className="text-[6px] sm:text-[7px] text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
          Coll. {index + 1}
        </span>
      </div>
    </motion.div>
  );
};

interface GalleryWallProps {
  activeSection: WallSection;
  onSectionChange: (section: WallSection) => void;
}

const GalleryWall: React.FC<GalleryWallProps> = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Données Supabase
  const { items, loading, fetchItems, createItem, updateItem, deleteItem } = useItems();
  const { isAdmin, isEditing } = useAdmin();

  // État formulaire CMS
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);

  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const { scrollXProgress } = useScroll({
    container: horizontalScrollRef
  });

  // scrollWidth disponible pour animation future
  useSpring(scrollXProgress, { stiffness: 60, damping: 25 });

  // Charger les collections au montage
  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  // Recaler le scroll quand le nombre d'items change (ribbon effect)
  useEffect(() => {
    const el = horizontalScrollRef.current;
    if (!el || !contactRef.current) return;
    const maxScroll = contactRef.current.offsetLeft;
    if (el.scrollLeft > maxScroll) {
      el.scrollTo({ left: maxScroll, behavior: 'smooth' });
    }
  }, [items.length]);

  // ===== Handlers CRUD =====
  const handleCollectionClick = useCallback(
    (item: Item) => {
      const basePath = isAdminRoute ? '/admin/portfolio' : '/portfolio';
      navigate(`${basePath}/${item.id}`);
    },
    [navigate, isAdminRoute]
  );

  const handleEdit = useCallback((item: Item) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (item: Item) => {
      await deleteItem(item.id);
    },
    [deleteItem]
  );

  const handleToggleVisible = useCallback(
    async (item: Item) => {
      await updateItem(item.id, { visible: !item.visible });
    },
    [updateItem]
  );

  const handleAdd = useCallback(() => {
    setEditingItem(undefined);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback(
    async (data: CreateItemPayload | UpdateItemPayload) => {
      if (editingItem) {
        await updateItem(editingItem.id, data as UpdateItemPayload);
      } else {
        await createItem(data as CreateItemPayload);
      }
      setFormOpen(false);
      setEditingItem(undefined);
    },
    [editingItem, createItem, updateItem]
  );

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingItem(undefined);
  }, []);

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
    <div className="relative w-screen h-screen overflow-hidden wall-texture">
      <motion.div
        ref={horizontalScrollRef}
        className="flex h-full w-full overflow-x-auto overflow-y-hidden items-center select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >

        {/* MUR 1: ACCUEIL + À PROPOS */}
        <section
          ref={homeRef}
          className="flex-shrink-0 w-screen h-full overflow-y-auto overflow-x-hidden relative scroll-smooth wall-texture"
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

        {/* MUR 2: PORTFOLIO — Collections dynamiques (Supabase) */}
        <div ref={portfolioRef} className="flex-shrink-0 flex items-center h-full wall-texture px-2 sm:px-[3vw] md:px-[5vw] relative">
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
            {loading ? (
              <div className="flex-shrink-0 flex items-center justify-center w-[40vw]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="w-6 h-6 border border-zinc-200 border-t-[#8b7355] rounded-full"
                />
              </div>
            ) : (
              items.map((item, idx) => {
                const card = (
                  <CollectionCard
                    key={item.id}
                    item={item}
                    index={idx}
                    onClick={() => handleCollectionClick(item)}
                  />
                );

                if (isAdmin && isEditing) {
                  return (
                    <ItemControls
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={(i) => void handleDelete(i)}
                      onToggleVisible={(i) => void handleToggleVisible(i)}
                    >
                      {card}
                    </ItemControls>
                  );
                }

                return card;
              })
            )}

            {/* Bouton Ajouter une collection (admin) */}
            {isAdmin && isEditing && (
              <AddItemButton
                onClick={handleAdd}
                variant="collection"
                label="Ajouter une collection"
              />
            )}
          </div>

          {/* Spacer technique pour la fin du mur */}
          <div className="flex-shrink-0 w-[20vw] sm:w-[30vw] h-full" />
        </div>

        {/* MUR 3: CONTACT */}
        <section ref={contactRef} className="flex-shrink-0 w-screen h-full flex flex-col justify-center px-4 sm:px-6 md:px-[10vw] relative wall-texture overflow-y-auto">
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
              {/* Glass card — style 21st.dev */}
              <div className="glass-card relative z-10 flex flex-col gap-6 rounded-2xl border border-white/30 bg-white/30 p-5 sm:p-8 md:p-12 backdrop-blur-md">
                <form className="flex flex-col gap-5 sm:gap-7" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label htmlFor="contact-name" className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2 block">Votre Nom</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Marie & Thomas"
                      aria-label="Votre Nom"
                      className="w-full border-b border-black/10 py-2 sm:py-3 outline-none focus:border-black/30 transition-colors text-sm font-light bg-transparent placeholder:text-zinc-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2 block">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="hello@exemple.com"
                      aria-label="Email"
                      className="w-full border-b border-black/10 py-2 sm:py-3 outline-none focus:border-black/30 transition-colors text-sm font-light bg-transparent placeholder:text-zinc-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2 block">Message</label>
                    <textarea
                      id="contact-message"
                      placeholder="Parlez-nous de votre projet..."
                      aria-label="Votre message"
                      className="w-full border-b border-black/10 py-2 sm:py-3 outline-none focus:border-black/30 transition-colors text-sm font-light h-24 sm:h-28 resize-none bg-transparent placeholder:text-zinc-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group relative w-full py-3 sm:py-4 mt-2 sm:mt-4 rounded-xl bg-black/85 overflow-hidden transition-all duration-500 hover:bg-black/90"
                  >
                    <span className="relative z-10 text-[8px] sm:text-[9px] uppercase tracking-[0.5em] font-medium text-white/90">
                      Envoyer
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

      </motion.div>

      {/* Formulaire CMS admin */}
      <AnimatePresence>
        {formOpen && (
          <ItemForm
            mode={editingItem ? 'edit' : 'create'}
            item={editingItem}
            parentId={null}
            itemType="collection"
            onClose={handleCloseForm}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryWall;
