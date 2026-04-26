/**
 * App — Point d'entree avec React Router
 * Route "/" -> site public (GalleryWall, Navigation, AudioPlayer)
 * Route "/admin" -> LoginPage si pas connecte, sinon site WYSIWYG + AdminToolbar
 */

import React, { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WallSection } from '../types';
import Navigation from '../components/Navigation';
import GalleryWall from '../components/GalleryWall';
import AudioPlayer, { AudioPlayerRef } from '../components/AudioPlayer';
import { AdminProvider } from './components/admin/AdminContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/admin/LoginPage';
import AdminToolbar from './components/admin/AdminToolbar';

/** Site public : galerie, navigation, audio, grain overlay */
const PublicSite: React.FC = () => {
  const [activeSection, setActiveSection] = useState<WallSection>(WallSection.HOME);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const hasTriggeredMusic = useRef(false);

  const handleNavigate = (section: WallSection) => {
    if (section === WallSection.PORTFOLIO && !hasTriggeredMusic.current) {
      hasTriggeredMusic.current = true;
      audioPlayerRef.current?.triggerPlay();
    }
    setActiveSection(section);
  };

  return (
    <div className="relative min-h-screen">
      <Navigation
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <div className="fixed top-12 left-12 z-50 pointer-events-none hidden lg:block">
        <span className="text-[10px] uppercase tracking-[0.5em] text-black vertical-text">
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
      <div className="fixed inset-0 pointer-events-none z-[200] border-[30px] border-white mix-blend-multiply opacity-20" />
    </div>
  );
};

/** Route admin : LoginPage si pas connecte, sinon site public + AdminToolbar */
const AdminRoute: React.FC = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
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
      <PublicSite />
      <AdminToolbar />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AdminProvider>
        <Routes>
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </AdminProvider>
    </BrowserRouter>
  );
};

export default App;
