/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Flame, MessageCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Gossip, AppSettings, ScreenTab } from './types';
import { 
  getStoredGossips, saveStoredGossips, 
  getStoredSettings, saveStoredSettings, 
  getVotedGossipIds, recordGossipVote,
  syncWithGoogleSheet, sendGossipToGoogleSheet, 
  voteHipeInGoogleSheet, updateGossipInGoogleSheet, 
  deleteGossipInGoogleSheet, updateConfigInGoogleSheet,
  bulkUploadToGoogleSheet,
  getRemainingCooldown, setLastVoteTimestamp, HIPE_COOLDOWN_SECONDS
} from './services/storage';
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
  
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [sheetConnected, setSheetConnected] = useState<boolean>(false);

  // Cooldown di 10 secondi per i voti Hipe
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() => getRemainingCooldown());
  const [cooldownToast, setCooldownToast] = useState<string | null>(null);

  // Per evitare sync paralleli sovrapposti
  const syncingRef = useRef<boolean>(false);
  const initialUploadDoneRef = useRef<boolean>(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const remaining = getRemainingCooldown();
      setCooldownRemaining(remaining);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  // Funzione core di sincronizzazione multi-dispositivo
  const performSync = useCallback(async (forced: boolean = false) => {
    if (!settings.googleScriptUrl || syncingRef.current) return;
    
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      const result = await syncWithGoogleSheet(settings.googleScriptUrl);
      if (result) {
        setSheetConnected(true);
        setLastSyncTime(new Date());

        // Se il Google Sheet è appena stato creato ed è vuoto, carichiamo automaticamente i gossip locali!
        if ((!result.gossips || result.gossips.length === 0) && !initialUploadDoneRef.current) {
          initialUploadDoneRef.current = true;
          const currentLocal = getStoredGossips();
          if (currentLocal.length > 0) {
            await bulkUploadToGoogleSheet(settings.googleScriptUrl, currentLocal);
          }
        } else if (result.gossips && result.gossips.length > 0) {
          // Unione intelligente: aggiorna o aggiunge gossip
          setGossips(result.gossips);
          saveStoredGossips(result.gossips);
        }

        // Sincronizza configurazioni (es. link WhatsApp o nuova password impostati da Admin)
        if (result.config) {
          setSettings(prev => {
            const updated = { ...prev, ...result.config };
            saveStoredSettings(updated);
            return updated;
          });
        }
      } else {
        if (forced) {
          setSheetConnected(false);
        }
      }
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  }, [settings.googleScriptUrl]);

  // 1. Sincronizzazione automatica all'avvio e ad ogni cambio URL
  useEffect(() => {
    performSync(true);
  }, [performSync]);

  // 2. Polling periodico in background ogni 8 secondi (Multi-Device Live Sync)
  useEffect(() => {
    if (!settings.googleScriptUrl) return;

    const interval = window.setInterval(() => {
      performSync(false);
    }, 8000);

    return () => clearInterval(interval);
  }, [settings.googleScriptUrl, performSync]);

  // 3. Sincronizza istantaneamente quando l'utente torna sull'app (Focus / Mobile screen unlock)
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && settings.googleScriptUrl) {
        performSync(false);
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [settings.googleScriptUrl, performSync]);

  // Voto Hipe 🔥 con Cooldown di 10 secondi anti-spam
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

    // Aggiorna lo stato e il contatore locale all'istante
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

    // Se stiamo visualizzando il dettaglio, aggiorna anche la scheda aperta
    setSelectedGossip(prev => {
      if (prev && prev.id === gossip.id) {
        return { ...prev, hipe: prev.hipe + 1 };
      }
      return prev;
    });

    // Salva voto tra gli ID votati dall'utente
    recordGossipVote(gossip.id);
    setVotedIds(prev => new Set(prev).add(gossip.id));

    // Effetto visivo particellare
    triggerFireworkConfetti();

    // Sincronizza asincrono con Google Sheet (in tempo reale sul cloud)
    if (settings.googleScriptUrl) {
      voteHipeInGoogleSheet(settings.googleScriptUrl, gossip.id);
    }
  }, [settings.googleScriptUrl]);

  // Invio nuovo gossip
  const handleSubmitGossip = (newGossip: Gossip) => {
    setGossips(prev => {
      const updated = [newGossip, ...prev];
      saveStoredGossips(updated);
      return updated;
    });

    // Invia direttamente al Google Sheet
    if (settings.googleScriptUrl) {
      sendGossipToGoogleSheet(settings.googleScriptUrl, newGossip);
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

    if (settings.googleScriptUrl) {
      updateGossipInGoogleSheet(settings.googleScriptUrl, id, { status: 'Approvato' });
    }
  };

  // Admin: Elimina gossip
  const handleDeleteGossip = (id: string) => {
    setGossips(prev => {
      const updated = prev.filter(g => g.id !== id);
      saveStoredGossips(updated);
      return updated;
    });

    if (settings.googleScriptUrl) {
      deleteGossipInGoogleSheet(settings.googleScriptUrl, id);
    }
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

    if (settings.googleScriptUrl) {
      updateGossipInGoogleSheet(settings.googleScriptUrl, id, { text: newText });
    }
  };

  // Admin: Salva impostazioni (link WhatsApp e password)
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);

    if (newSettings.googleScriptUrl) {
      updateConfigInGoogleSheet(newSettings.googleScriptUrl, 'whatsappLink', newSettings.whatsappLink);
      updateConfigInGoogleSheet(newSettings.googleScriptUrl, 'adminPassword', newSettings.adminPassword);
      // Forza una nuova sincronizzazione
      performSync(true);
    }
  };

  const handleManualSync = async () => {
    await performSync(true);
  };

  const pendingCount = gossips.filter(g => g.status === 'In attesa').length;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col justify-between selection:bg-[#FF0033] selection:text-white">
      
      {/* 1. TOP APP BAR CON BRAND ZONE, STATO SINCRONIZZAZIONE E WHATSAPP */}
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
            
            {/* Indicatore Live Sync Cloud / Google Sheet */}
            {settings.googleScriptUrl && (
              <div 
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-[11px] font-medium"
                title={lastSyncTime ? `Ultima sincronizzazione: ${lastSyncTime.toLocaleTimeString('it-IT')}` : 'Connesso a Google Sheet'}
              >
                {isSyncing ? (
                  <RefreshCw className="w-3 h-3 text-[#FF0033] animate-spin" />
                ) : sheetConnected ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
                <span className="text-zinc-400 font-mono text-[10px]">
                  {isSyncing ? 'Sincronizzazione...' : 'Live Sync'}
                </span>
              </div>
            )}

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
        onManualSync={handleManualSync}
      />

    </div>
  );
}
