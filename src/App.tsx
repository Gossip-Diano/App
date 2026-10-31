/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Flame, MessageCircle, Radio } from 'lucide-react';
import { Gossip, AppSettings, ScreenTab } from './types';
import { 
  getStoredGossips, saveStoredGossips, 
  getStoredSettings, saveStoredSettings, 
  getVotedGossipIds, recordGossipVote,
  getRemainingCooldown, setLastVoteTimestamp, HIPE_COOLDOWN_SECONDS
} from './services/storage';
import { 
  subscribeToGossips, 
  subscribeToConfig, 
  addGossipToFirestore, 
  voteHipeInFirestore, 
  updateGossipInFirestore, 
  deleteGossipFromFirestore, 
  updateConfigInFirestore,
  seedInitialGossipsIfEmpty,
  testFirestoreConnection
} from './services/firebase';
import { triggerFireworkConfetti } from './services/confetti';

import { BottomNavBar } from './components/BottomNavBar';
import { HomeScreen } from './components/HomeScreen';
import { FeedScreen } from './components/FeedScreen';
import { ArchiveScreen } from './components/ArchiveScreen';
import { NewGossipModal } from './components/NewGossipModal';
import { GossipDetailModal } from './components/GossipDetailModal';
import { AdminModal } from './components/AdminModal';

export default function App() {
  const [gossips, setGossips] = useState<Gossip[]>(() => getStoredGossips());
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [votedIds, setVotedIds] = useState<Set<string>>(() => getVotedGossipIds());
  
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [isNewGossipModalOpen, setIsNewGossipModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [selectedGossip, setSelectedGossip] = useState<Gossip | null>(null);
  
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // Cooldown di 10 secondi per i voti Hipe
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() => getRemainingCooldown());
  const [cooldownToast, setCooldownToast] = useState<string | null>(null);

  // Timer cooldown
  useEffect(() => {
    const timer = window.setInterval(() => {
      const remaining = getRemainingCooldown();
      setCooldownRemaining(remaining);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  // 1. Inizializzazione e Sottoscrizione Live Firebase (onSnapshot Stile Social Network)
  useEffect(() => {
    // Test connessione server
    testFirestoreConnection().catch(() => {});

    // Se il database è vuoto, carica automaticamente i primi gossip di partenza
    const initialLocal = getStoredGossips();
    seedInitialGossipsIfEmpty(initialLocal).catch(console.error);

    // Ascolto in tempo reale dei gossip
    const unsubscribeGossips = subscribeToGossips(
      (liveGossips) => {
        if (liveGossips && liveGossips.length > 0) {
          setGossips(liveGossips);
          saveStoredGossips(liveGossips);
        }
        setIsLiveConnected(true);
      },
      (err) => {
        console.warn('Errore connessione live:', err);
        setIsLiveConnected(false);
      }
    );

    // Ascolto in tempo reale della configurazione globale (link WhatsApp, password)
    const unsubscribeConfig = subscribeToConfig((liveConfig) => {
      setSettings(prev => {
        const updated = { ...prev, ...liveConfig };
        saveStoredSettings(updated);
        return updated;
      });
    });

    return () => {
      unsubscribeGossips();
      unsubscribeConfig();
    };
  }, []);

  // Voto Hipe 🔥 con Cooldown di 10 secondi anti-spam e Live Sync Cloud
  const handleVoteHipe = useCallback((gossip: Gossip, e: React.MouseEvent) => {
    e.stopPropagation();

    // Verifica se l'utente è ancora in cooldown
    const remaining = getRemainingCooldown();
    if (remaining > 0) {
      setCooldownToast(`⏳ Attendi ${remaining}s prima di dare un altro Hipe!`);
      setTimeout(() => setCooldownToast(null), 2500);
      return;
    }

    // Registra timestamp e avvia cooldown di 10 secondi
    const now = Date.now();
    setLastVoteTimestamp(now);
    setCooldownRemaining(HIPE_COOLDOWN_SECONDS);

    // Aggiornamento ottimistico locale istantaneo
    setGossips(prev => {
      const updated = prev.map(item => {
        if (item.id === gossip.id) {
          return { ...item, hipe: item.hipe + 1 };
        }
        return item;
      });
      saveStoredGossips(updated);
      return updated;
    });

    if (selectedGossip && selectedGossip.id === gossip.id) {
      setSelectedGossip(prev => prev ? { ...prev, hipe: prev.hipe + 1 } : null);
    }

    recordGossipVote(gossip.id);
    setVotedIds(prev => new Set(prev).add(gossip.id));

    // Effetto grafico
    triggerFireworkConfetti();

    // Sincronizzazione cloud istantanea per tutti i dispositivi
    voteHipeInFirestore(gossip.id).catch((err) => {
      console.warn('Errore voto Firebase:', err);
    });
  }, [selectedGossip]);

  // Invio nuovo gossip
  const handleSubmitGossip = async (newGossip: Gossip) => {
    // Aggiunta immediata locale
    setGossips(prev => {
      const updated = [newGossip, ...prev];
      saveStoredGossips(updated);
      return updated;
    });

    // Scrittura in tempo reale su Firebase (visibile istantaneamente a tutti gli utenti)
    try {
      await addGossipToFirestore(newGossip);
    } catch (err) {
      console.error('Errore invio gossip:', err);
    }
  };

  // Admin: Approva gossip in quarantena
  const handleApproveGossip = (id: string) => {
    setGossips(prev => {
      const updated = prev.map(g => {
        if (g.id === id) {
          return { ...g, status: 'Approvato' as const };
        }
        return g;
      });
      saveStoredGossips(updated);
      return updated;
    });

    updateGossipInFirestore(id, { status: 'Approvato' }).catch(console.error);
  };

  // Admin: Elimina gossip
  const handleDeleteGossip = (id: string) => {
    setGossips(prev => {
      const updated = prev.filter(g => g.id !== id);
      saveStoredGossips(updated);
      return updated;
    });

    deleteGossipFromFirestore(id).catch(console.error);
  };

  // Admin: Modifica testo
  const handleUpdateGossipText = (id: string, newText: string) => {
    setGossips(prev => {
      const updated = prev.map(g => {
        if (g.id === id) {
          return { ...g, text: newText };
        }
        return g;
      });
      saveStoredGossips(updated);
      return updated;
    });

    updateGossipInFirestore(id, { text: newText }).catch(console.error);
  };

  // Admin: Salva impostazioni (link WhatsApp e password)
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);

    updateConfigInFirestore({
      whatsappLink: newSettings.whatsappLink,
      adminPassword: newSettings.adminPassword
    }).catch(console.error);
  };

  const pendingCount = gossips.filter(g => g.status === 'In attesa').length;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col justify-between selection:bg-[#FF0033] selection:text-white">
      
      {/* 1. TOP APP BAR CON BRAND ZONE, STATO LIVE SYNC E WHATSAPP */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-[#07070a]/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between">
          
          {/* Brand Zone */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF0033] to-[#80001a] flex items-center justify-center shadow-[0_0_15px_rgba(255,0,51,0.5)] group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-black tracking-tight text-white font-display">
                Gossip <span className="text-[#FF0033]">Diano</span>
              </span>
            </div>
          </div>

          {/* Quick Actions Zone */}
          <div className="flex items-center gap-2">
            
            {/* Indicatore Live Sync Cloud Stile Social Network */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800/90 text-zinc-300 text-[11px] font-medium"
              title={isLiveConnected ? "Sincronizzazione in tempo reale attiva per tutti i dispositivi" : "Riconnessione al server..."}
            >
              <Radio className={`w-3 h-3 ${isLiveConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span className="text-[11px] font-semibold text-zinc-300 hidden sm:inline">
                {isLiveConnected ? 'Live' : 'Connessione...'}
              </span>
            </div>

            {/* Link WhatsApp Ufficiale */}
            <a
              href={settings.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 hover:text-white hover:bg-emerald-900/60 text-xs font-semibold transition-all active:scale-95"
              title="Gruppo WhatsApp Ufficiale"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Gruppo WhatsApp</span>
            </a>
          </div>

        </div>
      </header>

      {/* Toast Notifica Cooldown 10 Secondi */}
      {cooldownToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-950/90 border border-amber-500/70 text-amber-200 text-xs font-bold backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2 animate-bounce">
          <span>{cooldownToast}</span>
        </div>
      )}

      {/* 2. AREA CONTENUTI PRINCIPALE DINAMICA */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 pt-4">
        {currentTab === 'home' && (
          <HomeScreen
            gossips={gossips}
            votedIds={votedIds}
            onSelectGossip={(g) => setSelectedGossip(g)}
            onVoteHipe={handleVoteHipe}
            whatsappLink={settings.whatsappLink}
            cooldownRemaining={cooldownRemaining}
          />
        )}

        {currentTab === 'feed' && (
          <FeedScreen
            gossips={gossips}
            votedIds={votedIds}
            onVoteHipe={handleVoteHipe}
            whatsappLink={settings.whatsappLink}
            cooldownRemaining={cooldownRemaining}
          />
        )}

        {currentTab === 'archive' && (
          <ArchiveScreen
            gossips={gossips}
            votedIds={votedIds}
            onSelectGossip={(g) => setSelectedGossip(g)}
            onVoteHipe={handleVoteHipe}
            cooldownRemaining={cooldownRemaining}
          />
        )}
      </main>

      {/* 3. LA BOTTOM BAR FLOTTANTE (ORDINE RIGOROSO: HOME, FEED, ARCHIVIO, "+") */}
      <BottomNavBar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenNewGossip={() => setIsNewGossipModalOpen(true)}
        onAdminTrigger={() => setIsAdminModalOpen(true)}
        pendingAdminCount={pendingCount}
      />

      {/* MODALE DI INSERIMENTO NUOVO GOSSIP */}
      <NewGossipModal
        isOpen={isNewGossipModalOpen}
        onClose={() => setIsNewGossipModalOpen(false)}
        onSubmitGossip={handleSubmitGossip}
      />

      {/* MODALE DETTAGLIO GOSSIP */}
      <GossipDetailModal
        gossip={selectedGossip}
        onClose={() => setSelectedGossip(null)}
        onVoteHipe={handleVoteHipe}
        isVoted={selectedGossip ? votedIds.has(selectedGossip.id) : false}
        whatsappLink={settings.whatsappLink}
        cooldownRemaining={cooldownRemaining}
      />

      {/* PANNELLO ADMIN SEGRETO */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        adminPassword={settings.adminPassword}
        gossips={gossips}
        settings={settings}
        onApproveGossip={handleApproveGossip}
        onDeleteGossip={handleDeleteGossip}
        onUpdateGossipText={handleUpdateGossipText}
        onSaveSettings={handleSaveSettings}
      />

    </div>
  );
}
