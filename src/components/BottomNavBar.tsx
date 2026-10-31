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
      // Vibrazione aptica discreta su mobile se supportata
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 40, 60]);
        } catch {}
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
      className="fixed bottom-[max(0.85rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md select-none"
    >
      <div className="relative flex items-center justify-between px-2.5 py-1.5 rounded-[26px] border border-[#FF0033]/45 liquid-glass shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(255,0,51,0.2)] backdrop-blur-2xl">
        
        {/* Pulsante 1: HOME */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[48px] rounded-2xl transition-all duration-200 active:scale-95 ${
            currentTab === 'home'
              ? 'text-[#FF0033] font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Vai a Home"
        >
          <Home className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'home' ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
          <span className="text-[11px] font-semibold tracking-tight mt-1">Home</span>
        </button>

        {/* Pulsante 2: FEED */}
        <button
          onClick={() => onTabChange('feed')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[48px] rounded-2xl transition-all duration-200 active:scale-95 ${
            currentTab === 'feed'
              ? 'text-[#FF0033] font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Vai a Feed"
        >
          <Layers className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'feed' ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
          <span className="text-[11px] font-semibold tracking-tight mt-1">Feed</span>
        </button>

        {/* Pulsante 3: ARCHIVIO (con secret hold di 2s invisibile e protetto dal context menu) */}
        <div className="flex-1 relative flex flex-col items-center justify-center">
          <button
            onClick={handleArchiveClick}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onTouchCancel={cancelLongPress}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-full flex flex-col items-center justify-center py-2 px-1 min-h-[48px] rounded-2xl relative select-none transition-all duration-200 active:scale-95 ${
              currentTab === 'archive'
                ? 'text-[#FF0033] font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="Vai ad Archivio"
          >
            <Archive className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'archive' ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
            <span className="text-[11px] font-semibold tracking-tight mt-1">
              Archivio
            </span>
          </button>
        </div>

        {/* Pulsante 4: TASTO "+" (Rotondo, touch-friendly 50px, integrato a destra) */}
        <div className="pl-1.5 pr-0.5">
          <button
            onClick={onOpenNewGossip}
            className="w-12 h-12 rounded-full bg-[#FF0033] text-white flex items-center justify-center shadow-[0_0_18px_rgba(255,0,51,0.6)] border-2 border-white/25 active:scale-90 transition-all duration-200 hover:brightness-110"
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
