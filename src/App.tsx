/**
 * App — Point d'entree avec React Router
 * Route "/" -> site public (GalleryWall avec scroll horizontal : Accueil + Portfolio + Contact)
 * Route "/portfolio/:id/*" -> sous-pages albums/photos
 * Route "/admin" -> LoginPage si pas connecte, sinon site WYSIWYG + AdminToolbar
 * Route "/admin/portfolio/:id/*" -> sous-pages albums/photos en mode admin
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { WallSection } from '../types';
import Navigation from '../components/Navigation';
import GalleryWall from '../components/GalleryWall';
import AudioPlayer, { AudioPlayerRef } from '../components/AudioPlayer';
import { AdminProvider } from './components/admin/AdminContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/admin/LoginPage';
import AdminToolbar from './components/admin/AdminToolbar';
import AlbumSection from './components/AlbumSection';
import PhotoSection from './components/PhotoSection';

/** Site public : galerie, navigation, audio, grain overlay */
const PublicSite: React.FC<{ isAdmin?: boolean }> = ({ isAdmin: _isAdmin = false }) => {
  const [activeSection, setActiveSection] = useState<WallSection>(WallSection.HOME);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const hasTriggeredMusic = useRef(false);
  const location = useLocation();

  // Auto-scroll vers portfolio quand on revient d'une sous-page
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo === 'portfolio') {
      setActiveSection(WallSection.PORTFOLIO);
      // Nettoyer le state pour eviter re-scroll
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const handleNavigate = useCallback((section: WallSection) => {
    if (section === WallSection.PORTFOLIO && !hasTriggeredMusic.current) {
      hasTriggeredMusic.current = true;
      audioPlayerRef.current?.triggerPlay();
    }
    setActiveSection(section);
  }, []);

  return (
    <div className="relative min-h-screen">
      <Navigation
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <div className="fixed top-12 left-12 z-50 pointer-events-none hidden lg:block">
        <span className="text-[10px] uppercase tracking-[0.5em] vertical-text">
          Ernest H. Photography — L'imparfait sublime
        </span>
      </div>

      <main>
        <GalleryWall
          activeSection={activeSection}
          onSectionChange={handleNavigate}
        />
      </main>

      <AudioPlayer ref={audioPlayerRef} />

      {/* Texture de grain globale */}
      <div className="grain-border fixed inset-0 pointer-events-none z-[200] border-[30px] border-[var(--wall-bg)] mix-blend-multiply opacity-20 transition-all duration-[600ms]" />
    </div>
  );
};

/** Wrapper avec Navigation pour les pages portfolio (public) */
const PortfolioLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const nav = useNavigate();

  const handleNavigate = useCallback((section: WallSection) => {
    if (section === WallSection.PORTFOLIO) {
      nav('/', { state: { scrollTo: 'portfolio' } });
    } else {
      nav('/');
    }
  }, [nav]);

  return (
    <div className="relative min-h-screen">
      <Navigation
        activeSection={WallSection.PORTFOLIO}
        onNavigate={handleNavigate}
      />

      <div className="fixed top-12 left-12 z-50 pointer-events-none hidden lg:block">
        <span className="text-[10px] uppercase tracking-[0.5em] vertical-text">
          Ernest H. Photography — L'imparfait sublime
        </span>
      </div>

      <main>{children}</main>

      <AudioPlayer ref={audioPlayerRef} />

      {/* Texture de grain globale */}
      <div className="grain-border fixed inset-0 pointer-events-none z-[200] border-[30px] border-[var(--wall-bg)] mix-blend-multiply opacity-20 transition-all duration-[600ms]" />
    </div>
  );
};

/** Wrapper avec Navigation + AdminToolbar pour les pages portfolio admin */
const AdminPortfolioLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const nav = useNavigate();

  const handleNavigate = useCallback((section: WallSection) => {
    if (section === WallSection.PORTFOLIO) {
      nav('/admin', { state: { scrollTo: 'portfolio' } });
    } else {
      nav('/admin');
    }
  }, [nav]);

  if (loading) {
    return (
      <div className="min-h-screen wall-texture flex items-center justify-center">
        <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-400">
          Chargement...
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return <LoginPage />;
  }

  return (
    <div className="relative min-h-screen">
      <Navigation
        activeSection={WallSection.PORTFOLIO}
        onNavigate={handleNavigate}
      />

      <div className="fixed top-12 left-12 z-50 pointer-events-none hidden lg:block">
        <span className="text-[10px] uppercase tracking-[0.5em] vertical-text">
          Ernest H. Photography — L'imparfait sublime
        </span>
      </div>

      <main>{children}</main>

      <AudioPlayer ref={audioPlayerRef} />

      {/* Texture de grain globale */}
      <div className="grain-border fixed inset-0 pointer-events-none z-[200] border-[30px] border-[var(--wall-bg)] mix-blend-multiply opacity-20 transition-all duration-[600ms]" />

      <AdminToolbar />
    </div>
  );
};

/** Route admin : LoginPage si pas connecte, sinon site public + AdminToolbar */
const AdminRoute: React.FC = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen wall-texture flex items-center justify-center">
        <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-400">
          Chargement...
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return <LoginPage />;
  }

  return (
    <>
      <PublicSite isAdmin />
      <AdminToolbar />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AdminProvider>
        <Routes>
          {/* Routes admin portfolio (CMS) */}
          <Route
            path="/admin/portfolio/:collectionId/:albumId"
            element={
              <AdminPortfolioLayout>
                <PhotoSection />
              </AdminPortfolioLayout>
            }
          />
          <Route
            path="/admin/portfolio/:collectionId"
            element={
              <AdminPortfolioLayout>
                <AlbumSection />
              </AdminPortfolioLayout>
            }
          />
          {/* /admin/portfolio redirige vers la page principale */}
          <Route path="/admin/portfolio" element={<Navigate to="/admin" state={{ scrollTo: 'portfolio' }} replace />} />

          {/* Route admin accueil (site original + toolbar) */}
          <Route path="/admin" element={<AdminRoute />} />

          {/* Routes portfolio publiques (CMS) */}
          <Route
            path="/portfolio/:collectionId/:albumId"
            element={
              <PortfolioLayout>
                <PhotoSection />
              </PortfolioLayout>
            }
          />
          <Route
            path="/portfolio/:collectionId"
            element={
              <PortfolioLayout>
                <AlbumSection />
              </PortfolioLayout>
            }
          />
          {/* /portfolio redirige vers la page principale */}
          <Route path="/portfolio" element={<Navigate to="/" state={{ scrollTo: 'portfolio' }} replace />} />

          {/* Route publique par defaut (site original) */}
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </AdminProvider>
    </BrowserRouter>
  );
};

export default App;
