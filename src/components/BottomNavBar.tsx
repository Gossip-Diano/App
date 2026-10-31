import React, { useRef, useEffect } from 'react';
import { Home, Layers, Archive, Plus } from 'lucide-react';
import { ScreenTab } from '../types';

interface BottomNavBarProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  onOpenNewGossip: () => void;
  onAdminTrigger: () => void;
  pendingAdminCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewGossip,
  onAdminTrigger
}) => {
  // Silent 2-second secret timer for Admin access on Archivio button
  const pressTimerRef = useRef<number | null>(null);
  const isSecretAdminTriggeredRef = useRef<boolean>(false);

  const startLongPress = () => {
    isSecretAdminTriggeredRef.current = false;
    pressTimerRef.current = window.setTimeout(() => {
      isSecretAdminTriggeredRef.current = true;
      // Discreta vibrazione aptica se supportata
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 40, 80]);
      }
      onAdminTrigger();
    }, 2000);
  };

  const cancelLongPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleArchiveClick = () => {
    // Se non è stato appena attivato il trigger admin segreto, naviga normalmente ad archivio
    if (!isSecretAdminTriggeredRef.current) {
      onTabChange('archive');
    }
  };

  useEffect(() => {
    return () => {
      cancelLongPress();
    };
  }, []);

  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.75rem)] max-w-md"
    >
      <div className="relative flex items-center justify-between px-3 py-2 rounded-[24px] border border-[#FF0033]/45 liquid-glass shadow-2xl backdrop-blur-2xl">
        
        {/* Pulsante 1: HOME */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[44px] rounded-xl transition-all duration-200 ${
            currentTab === 'home'
              ? 'text-[#FF0033] scale-105 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Vai a Home"
        >
          <Home className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1">Home</span>
        </button>

        {/* Pulsante 2: FEED */}
        <button
          onClick={() => onTabChange('feed')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[44px] rounded-xl transition-all duration-200 ${
            currentTab === 'feed'
              ? 'text-[#FF0033] scale-105 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Vai a Feed"
        >
          <Layers className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'feed' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1">Feed</span>
        </button>

        {/* Pulsante 3: ARCHIVIO (con secret hold di 2s del tutto invisibile all'utente) */}
        <div className="flex-1 relative flex flex-col items-center justify-center">
          <button
            onClick={handleArchiveClick}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onTouchCancel={cancelLongPress}
            className={`w-full flex flex-col items-center justify-center py-1.5 px-1 min-h-[44px] rounded-xl relative select-none transition-all duration-200 ${
              currentTab === 'archive'
                ? 'text-[#FF0033] scale-105 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="Vai ad Archivio"
          >
            <Archive className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'archive' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px] font-medium tracking-tight mt-1">
              Archivio
            </span>
          </button>
        </div>

        {/* Pulsante 4: TASTO "+" (Rotondo, leggermente più grande, integrato a destra) */}
        <div className="pl-2 pr-1">
          <button
            onClick={onOpenNewGossip}
            className="w-12 h-12 rounded-full bg-[#FF0033] text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,0,51,0.55)] border-2 border-white/20 active:scale-95 transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,0,51,0.8)]"
            aria-label="Aggiungi nuovo gossip"
            title="Nuovo Gossip"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

      </div>
    </nav>
  );
};
