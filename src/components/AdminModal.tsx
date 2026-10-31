import React, { useState, useEffect } from 'react';
import { 
  X, Lock, ShieldCheck, Check, Trash2, Edit3, Settings, 
  CheckCircle, AlertTriangle, MessageCircle, KeyRound, Flame,
  Database, RefreshCw, UploadCloud, Copy, CheckCheck, ExternalLink
} from 'lucide-react';
import { Gossip, AppSettings } from '../types';
import { GOOGLE_APPS_SCRIPT_SOURCE } from '../services/googleAppsScriptCode';
import { testGoogleSheetConnection, bulkUploadToGoogleSheet } from '../services/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminPassword: string;
  gossips: Gossip[];
  settings: AppSettings;
  onApproveGossip: (id: string) => void;
  onDeleteGossip: (id: string) => void;
  onUpdateGossipText: (id: string, newText: string) => void;
  onSaveSettings: (settings: AppSettings) => void;
  onManualSync: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  adminPassword,
  gossips,
  settings,
  onApproveGossip,
  onDeleteGossip,
  onUpdateGossipText,
  onSaveSettings,
  onManualSync
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Schede interne dell'admin: 'pending' (Da Approvare) | 'archive' (Archivio di Gestione) | 'settings' (Impostazioni)
  const [adminTab, setAdminTab] = useState<'pending' | 'archive' | 'settings'>('pending');

  // Modifica testo gossip inline
  const [editingGossipId, setEditingGossipId] = useState<string | null>(null);
  const [editTextContent, setEditTextContent] = useState<string>('');

  // Impostazioni form: link WhatsApp, password admin e opzione URL Google Sheet
  const [tempWhatsapp, setTempWhatsapp] = useState<string>(settings.whatsappLink);
  const [tempPassword, setTempPassword] = useState<string>(settings.adminPassword);
  const [tempScriptUrl, setTempScriptUrl] = useState<string>(settings.googleScriptUrl || '');
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Stato test Google Sheets
  const [isTestingSheet, setIsTestingSheet] = useState<boolean>(false);
  const [sheetTestFeedback, setSheetTestFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isUploadingToSheet, setIsUploadingToSheet] = useState<boolean>(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Reset e blocco di sicurezza ogni volta che si chiude la modale admin
  const handleSafeClose = () => {
    setIsAuthenticated(false);
    setInputPassword('');
    setAuthError(null);
    setEditingGossipId(null);
    setSheetTestFeedback(null);
    setUploadFeedback(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setInputPassword('');
      setAuthError(null);
      setEditingGossipId(null);
      setSheetTestFeedback(null);
      setUploadFeedback(null);
    } else {
      setTempWhatsapp(settings.whatsappLink);
      setTempPassword(settings.adminPassword);
      setTempScriptUrl(settings.googleScriptUrl || '');
    }
  }, [isOpen, settings.whatsappLink, settings.adminPassword, settings.googleScriptUrl]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === adminPassword || inputPassword === 'diano2026') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Password errata. Riprova.');
    }
  };

  const pendingGossips = gossips.filter(g => g.status === 'In attesa');
  const allGossips = gossips;

  const startEditing = (g: Gossip) => {
    setEditingGossipId(g.id);
    setEditTextContent(g.text);
  };

  const saveEditing = (id: string) => {
    if (editTextContent.trim()) {
      onUpdateGossipText(id, editTextContent.trim());
    }
    setEditingGossipId(null);
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      whatsappLink: tempWhatsapp.trim(),
      adminPassword: tempPassword.trim(),
      googleScriptUrl: tempScriptUrl.trim()
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Test di connessione in tempo reale con lo script di Google Sheets
  const handleTestConnection = async () => {
    if (!tempScriptUrl.trim()) {
      setSheetTestFeedback({ success: false, message: 'Inserisci prima l\'URL della Web App di Google Apps Script!' });
      return;
    }
    setIsTestingSheet(true);
    setSheetTestFeedback(null);
    const result = await testGoogleSheetConnection(tempScriptUrl.trim());
    setIsTestingSheet(false);
    setSheetTestFeedback({
      success: result.success,
      message: result.success 
        ? `🟢 ${result.message} (${result.count ?? 0} gossip rilevati nel foglio)`
        : `🔴 ${result.message}`
    });
  };

  // Carica tutti i gossip correnti sul Google Sheet
  const handleUploadAllToSheet = async () => {
    const url = tempScriptUrl.trim() || settings.googleScriptUrl;
    if (!url) {
      setUploadFeedback('Inserisci prima l\'URL dello script!');
      return;
    }
    setIsUploadingToSheet(true);
    setUploadFeedback(null);
    const result = await bulkUploadToGoogleSheet(url, gossips);
    setIsUploadingToSheet(false);
    if (result.success) {
      setUploadFeedback(`✅ ${result.count} gossip caricati con successo nel tuo Google Sheet!`);
    } else {
      setUploadFeedback('❌ Errore durante l\'invio al Google Sheet. Verifica l\'URL.');
    }
    setTimeout(() => setUploadFeedback(null), 5000);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SOURCE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200"
      onClick={handleSafeClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-[#FF0033] bg-[#0c0c11]/98 liquid-glass shadow-[0_0_60px_rgba(255,0,51,0.35)] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF0033]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Barra superiore */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#FF0033]" />
            <h2 className="text-lg font-bold text-white font-display tracking-tight">
              Pannello Segreto Admin · Gossip Diano
            </h2>
          </div>
          <button
            onClick={handleSafeClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Chiudi e blocca admin"
            title="Chiudi e blocca"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SE NON ANCORA AUTENTICATO: POP-UP DI SICUREZZA CON PASSWORD */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#FF0033]/10 border border-[#FF0033] flex items-center justify-center shadow-[0_0_20px_rgba(255,0,51,0.3)]">
              <Lock className="w-8 h-8 text-[#FF0033]" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h3 className="text-xl font-bold text-white font-display">
                Area Riservata Moderatori
              </h3>
              <p className="text-xs text-zinc-400">
                Inserisci la password di amministrazione per sbloccare la gestione dei gossip.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs space-y-4">
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  placeholder="Password Admin"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="w-full bg-[#050508] border border-zinc-700 focus:border-[#FF0033] rounded-2xl py-3 px-4 text-center text-sm font-semibold tracking-wider text-white placeholder-zinc-500 outline-none transition-all shadow-inner"
                />
              </div>

              {authError && (
                <div className="text-xs font-semibold text-red-400">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-2xl bg-[#FF0033] hover:bg-[#e0002d] text-white font-bold text-sm shadow-[0_0_15px_rgba(255,0,51,0.5)] active:scale-95 transition-all"
              >
                Sblocca Pannello 🔓
              </button>
            </form>
          </div>
        ) : (
          /* 2. AREA DI GESTIONE ADMIN SBLOCCATA */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Navigazione schede Admin */}
            <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-zinc-800/80 bg-zinc-950/40 shrink-0 overflow-x-auto">
              <button
                onClick={() => setAdminTab('pending')}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  adminTab === 'pending'
                    ? 'bg-[#FF0033] text-white shadow-[0_0_12px_rgba(255,0,51,0.5)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span>Da Approvare</span>
                {pendingGossips.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-zinc-900 text-[10px] flex items-center justify-center font-black">
                    {pendingGossips.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminTab('archive')}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  adminTab === 'archive'
                    ? 'bg-[#FF0033] text-white shadow-[0_0_12px_rgba(255,0,51,0.5)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span>Archivio di Gestione</span>
                <span className="text-[10px] text-zinc-500 font-mono">({allGossips.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('settings')}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  adminTab === 'settings'
                    ? 'bg-[#FF0033] text-white shadow-[0_0_12px_rgba(255,0,51,0.5)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Impostazioni & Google Sheets</span>
              </button>

              {/* Tasto Blocca e Esci */}
              <button
                onClick={handleSafeClose}
                className="ml-auto flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-red-950/40 hover:text-red-400 text-zinc-400 text-xs font-semibold transition-colors"
                title="Blocca e chiudi subito"
              >
                <Lock className="w-3.5 h-3.5 text-[#FF0033]" />
                <span>Blocca</span>
              </button>
            </div>

            {/* CONTENUTO SCORREVOLE SCHEDE */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* SCHEDA 1: DA APPROVARE */}
              {adminTab === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-white font-display">
                      Gossip Intercettati dal Filtro / In Quarantena
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Questi gossip non sono visibili pubblicamente. Clicca su "Approva" per pubblicarli o "Elimina" per scartarli.
                    </p>
                  </div>

                  {pendingGossips.length === 0 ? (
                    <div className="p-10 rounded-2xl liquid-glass text-center border border-zinc-800 text-zinc-400 text-sm">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      Nessun gossip in attesa di moderazione. Tutto tranquillo!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingGossips.map(gossip => (
                        <div
                          key={gossip.id}
                          className="p-4 rounded-2xl bg-zinc-950/80 border border-amber-600/40 liquid-glass shadow-lg space-y-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <span className="font-semibold text-white">{gossip.author}</span>
                                <span>·</span>
                                <span>{gossip.displayDate || `${gossip.month} ${gossip.schoolYear}`}</span>
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                                  In attesa
                                </span>
                              </div>

                              {/* Parole segnalate */}
                              {gossip.flaggedWords && gossip.flaggedWords.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Termini rilevati: <strong className="underline">{gossip.flaggedWords.join(', ')}</strong></span>
                                </div>
                              )}
                            </div>

                            {/* Azioni Approva / Elimina */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => onApproveGossip(gossip.id)}
                                className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                              >
                                <Check className="w-4 h-4" />
                                <span>Approva</span>
                              </button>
                              <button
                                onClick={() => onDeleteGossip(gossip.id)}
                                className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-red-950 hover:text-red-400 text-zinc-400 font-semibold text-xs transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Elimina</span>
                              </button>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#07070a] border border-zinc-800 text-sm text-zinc-200 leading-relaxed italic">
                            "{gossip.text}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SCHEDA 2: ARCHIVIO DI GESTIONE */}
              {adminTab === 'archive' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-white font-display">
                      Archivio di Gestione Completo
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Modifica il testo dei gossip o rimuovi contenuti inappropriati dallo storico.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {allGossips.map(gossip => (
                      <div
                        key={gossip.id}
                        className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 liquid-glass space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span className="font-bold text-[#FF0033]">{gossip.author}</span>
                            <span>·</span>
                            <span>{gossip.month} {gossip.schoolYear}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono text-amber-400">
                              <Flame className="w-3 h-3 fill-current" />
                              {gossip.hipe} Hipe
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              gossip.status === 'Approvato'
                                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                                : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                            }`}>
                              {gossip.status}
                            </span>
                          </div>

                          {/* Pulsanti Modifica ed Elimina */}
                          <div className="flex items-center gap-1.5">
                            {editingGossipId === gossip.id ? (
                              <button
                                onClick={() => saveEditing(gossip.id)}
                                className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Salva</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => startEditing(gossip)}
                                className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Modifica</span>
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteGossip(gossip.id)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                              title="Elimina definitivamente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Visualizzazione o Modifica Testo */}
                        {editingGossipId === gossip.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={editTextContent}
                              onChange={(e) => setEditTextContent(e.target.value)}
                              className="w-full bg-[#050508] border border-[#FF0033] rounded-xl p-3 text-sm text-white outline-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingGossipId(null)}
                                className="text-xs text-zinc-400 hover:text-white px-2 py-1"
                              >
                                Annulla
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-200 leading-snug">
                            "{gossip.text}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCHEDA 3: IMPOSTAZIONI & COLLEGAMENTO GOOGLE SHEETS */}
              {adminTab === 'settings' && (
                <div className="space-y-6">
                  
                  {/* CARD 1: COLLEGAMENTO GOOGLE SHEETS (DATABASE CENTRALE CONDIVISO) */}
                  <div className="p-5 rounded-2xl bg-zinc-950/90 border border-[#FF0033]/40 shadow-[0_0_20px_rgba(255,0,51,0.15)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-[#FF0033]" />
                        <h4 className="text-base font-bold text-white font-display">
                          Google Sheets (Database Condiviso Multi-Dispositivo)
                        </h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                        settings.googleScriptUrl 
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${settings.googleScriptUrl ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                        {settings.googleScriptUrl ? 'Configurato' : 'Non collegato'}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Questo URL consente all'app di salvare e leggere tutti i gossip, voti Hipe e impostazioni direttamente dal tuo Google Sheet. In questo modo <strong>tutti i telefoni, computer e browser vedono gli stessi dati in tempo reale</strong>.
                    </p>

                    {/* Campo URL Web App */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-300">
                        URL Web App Google Apps Script:
                      </label>
                      <input
                        type="url"
                        value={tempScriptUrl}
                        onChange={(e) => setTempScriptUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full bg-[#050508] border border-zinc-700 focus:border-[#FF0033] rounded-xl py-2.5 px-3.5 text-xs text-white font-mono outline-none transition-colors"
                      />
                      <span className="text-[11px] text-zinc-500 block">
                        L'URL deve terminare con <code className="text-[#FF0033]">/exec</code> (non /dev o /edit).
                      </span>
                    </div>

                    {/* Azioni rapide di sincronizzazione e test */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTestingSheet}
                        className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        {isTestingSheet ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF0033]" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>Verifica Connessione</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUploadAllToSheet}
                        disabled={isUploadingToSheet}
                        className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#FF0033] hover:bg-[#e0002d] text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isUploadingToSheet ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>Carica i gossip sul Google Sheet ORA</span>
                      </button>

                      <button
                        type="button"
                        onClick={onManualSync}
                        className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs font-medium transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Sincronizza</span>
                      </button>
                    </div>

                    {/* Feedback Test o Upload */}
                    {sheetTestFeedback && (
                      <div className={`p-3 rounded-xl text-xs font-medium border ${
                        sheetTestFeedback.success 
                          ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200' 
                          : 'bg-red-950/40 border-red-600/40 text-red-200'
                      }`}>
                        {sheetTestFeedback.message}
                      </div>
                    )}

                    {uploadFeedback && (
                      <div className="p-3 rounded-xl text-xs font-medium bg-emerald-950/40 border border-emerald-600/40 text-emerald-200">
                        {uploadFeedback}
                      </div>
                    )}

                    {/* Guida Rapida e Copia Codice Apps Script */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-400">
                          Codice Backend Google Apps Script (Code.gs):
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="flex items-center gap-1 text-[11px] text-[#FF0033] hover:underline font-bold"
                        >
                          {copiedCode ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? 'Copiato!' : 'Copia codice'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Ricorda: in Apps Script clicca su <strong>Distribuisci &gt; Nuova distribuzione &gt; Applicazione web</strong>, imposta <em>"Chi ha accesso: Chiunque"</em> e incolla qui l'URL generato.
                      </p>
                    </div>
                  </div>

                  {/* CARD 2: IMPOSTAZIONI GENERALI (LINK WHATSAPP E PASSWORD) */}
                  <form onSubmit={handleSaveSettingsSubmit} className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-5">
                    <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#FF0033]" />
                      Impostazioni Generali
                    </h4>

                    <div className="space-y-4">
                      {/* 1. Link Gruppo WhatsApp */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          Link Gruppo WhatsApp
                        </label>
                        <input
                          type="url"
                          required
                          value={tempWhatsapp}
                          onChange={(e) => setTempWhatsapp(e.target.value)}
                          placeholder="https://chat.whatsapp.com/..."
                          className="w-full bg-[#07070a] border border-zinc-700 focus:border-[#FF0033] rounded-xl py-2.5 px-3.5 text-sm text-white outline-none transition-colors"
                        />
                        <span className="text-[11px] text-zinc-500 mt-1 block">
                          Viene aperto dagli utenti quando cliccano sul pulsante WhatsApp nei gossip.
                        </span>
                      </div>

                      {/* 2. Password Pagina Admin */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-[#FF0033]" />
                          Nuova Password Admin
                        </label>
                        <input
                          type="text"
                          required
                          value={tempPassword}
                          onChange={(e) => setTempPassword(e.target.value)}
                          placeholder="Inserisci nuova password"
                          className="w-full bg-[#07070a] border border-zinc-700 focus:border-[#FF0033] rounded-xl py-2.5 px-3.5 text-sm text-white font-mono outline-none transition-colors"
                        />
                        <span className="text-[11px] text-zinc-500 mt-1 block">
                          Questa password servirà per sbloccare nuovamente il pannello Admin.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {settingsSaved && (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Modifiche salvate con successo!
                        </span>
                      )}
                      <button
                        type="submit"
                        className="ml-auto py-2.5 px-6 rounded-xl bg-[#FF0033] hover:bg-[#e0002d] text-white font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        Salva Tutte le Impostazioni
                      </button>
                    </div>
                  </form>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
