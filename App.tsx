
import React, { useState, useRef } from 'react';
import { WallSection } from './types';
import Navigation from './components/Navigation';
import GalleryWall from './components/GalleryWall';
import AudioPlayer, { AudioPlayerRef } from './components/AudioPlayer';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<WallSection>(WallSection.HOME);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const hasTriggeredMusic = useRef(false);

  const handleNavigate = (section: WallSection) => {
    // Déclencher la musique au premier clic sur Portfolio uniquement
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
          Ernest H. Photography — L'imparfait sublimé
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

export default App;
