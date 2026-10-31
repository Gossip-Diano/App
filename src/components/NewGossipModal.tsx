import React, { useState } from 'react';
import { X, Send, EyeOff, User, Flame } from 'lucide-react';
import { scanTextForProfanity } from '../services/filter';
import { pickRandomColor, getCurrentSchoolYearAndMonth } from '../services/storage';
import { triggerBigCelebration } from '../services/confetti';
import { Gossip } from '../types';

interface NewGossipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitGossip: (gossip: Gossip) => void;
}

export const NewGossipModal: React.FC<NewGossipModalProps> = ({
  isOpen,
  onClose,
  onSubmitGossip
}) => {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [authorName, setAuthorName] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const charLimit = 350;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);

    // Esegui la scansione linguistica ultra-rigida
    const scanResult = scanTextForProfanity(text);

    const { schoolYear, month } = getCurrentSchoolYearAndMonth();
    const stylePick = pickRandomColor();
    const now = new Date();

    const authorDisplayName = isAnonymous
      ? 'Anonimo 🕵️‍♂️'
      : (authorName.trim() || 'Studente Diano');

    const status: 'Approvato' | 'In attesa' = scanResult.isClean ? 'Approvato' : 'In attesa';

    const newGossip: Gossip = {
      id: `g-${Date.now()}`,
      timestamp: now.toISOString(),
      displayDate: `${now.getDate()} ${month.slice(0, 3)} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      schoolYear,
      month,
      author: authorDisplayName,
      isAnonymous,
      text: text.trim(),
      hipe: 1, // ogni nuovo gossip parte con 1 fiamma
      status,
      color: stylePick.color,
      pinColor: stylePick.pinColor,
      rotation: stylePick.rotation,
      flaggedWords: scanResult.flaggedWords
    };

    triggerBigCelebration();

    // Feedback uniforme e silenzioso: non rivela se il gossip è pulito o finito in quarantena
    setSubmissionFeedback('🔥 Gossip inviato con successo!');

    setTimeout(() => {
      onSubmitGossip(newGossip);
      setIsSubmitting(false);
      setText('');
      setAuthorName('');
      setIsAnonymous(true);
      setSubmissionFeedback(null);
      onClose();
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Contenitore Modale con bordi rossi e look liquido */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border-2 border-[#FF0033] bg-[#0c0c10]/95 p-6 md:p-8 shadow-[0_0_50px_rgba(255,0,51,0.35)] liquid-glass overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF0033]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Tasto Chiudi */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-10"
          aria-label="Chiudi finestra"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Morfante: Tasto "+" allargato in barra d'inserimento "NUOVO GOSSIP" con bordi rossi */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF0033]/20 via-[#FF0033]/30 to-[#FF0033]/20 border border-[#FF0033] shadow-[0_0_20px_rgba(255,0,51,0.4)]">
            <Flame className="w-5 h-5 text-[#FF0033] fill-[#FF0033]" />
            <h2 className="text-base sm:text-lg font-black tracking-wider text-white font-display uppercase">
              Nuovo Gossip
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Condividi le ultime novità della scuola. Sii piccante ma rispettoso!
          </p>
        </div>

        {/* Feedback uniforme di invio */}
        {submissionFeedback ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FF0033]/20 border border-[#FF0033] mx-auto flex items-center justify-center animate-bounce">
              <Flame className="w-8 h-8 text-[#FF0033] fill-current" />
            </div>
            <p className="text-base font-bold text-white px-4">
              {submissionFeedback}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* AREA DI TESTO GOSSIP */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wide">
                Cosa è successo?
              </label>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  maxLength={charLimit}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Es: Avvistati nell'intervallo al bar... oppure: Il prof di fisica ha fatto un'interrogazione da infarto..."
                  className="w-full bg-[#07070a] border border-zinc-800 focus:border-[#FF0033] rounded-2xl p-4 text-sm text-white placeholder-zinc-500 outline-none transition-all resize-none shadow-inner leading-relaxed"
                />
                
                {/* Contatore caratteri */}
                <span className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-500">
                  {text.length}/{charLimit}
                </span>
              </div>
            </div>

            {/* SEZIONE TOGGLE ANONIMO CON ANIMAZIONE FLUIDA */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <EyeOff className="w-4 h-4 text-[#FF0033]" />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Pubblica in Anonimo
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Nessuno saprà chi ha inviato questo gossip
                    </div>
                  </div>
                </div>

                {/* Lo Switcher Toggle */}
                <button
                  type="button"
                  onClick={() => setIsAnonymous(prev => !prev)}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAnonymous ? 'bg-[#FF0033]' : 'bg-zinc-700'
                  }`}
                  aria-pressed={isAnonymous}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isAnonymous ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Se Anonimo è spento (OFF), scivola in basso facendo spazio al campo nome */}
              {!isAnonymous && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300 pt-1">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FF0033]" />
                    Nome o Firma in chiaro
                  </label>
                  <input
                    type="text"
                    required={!isAnonymous}
                    placeholder="Es: Giulia (4^B) o Il Detective"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-[#07070a] border border-zinc-800 focus:border-[#FF0033] rounded-2xl py-2.5 px-4 text-sm text-white placeholder-zinc-500 outline-none transition-all shadow-inner"
                  />
                </div>
              )}
            </div>

            {/* PULSANTE FINALE: INVIA GOSSIP */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!text.trim() || isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#FF0033] hover:bg-[#e0002d] text-white font-bold text-base shadow-[0_0_20px_rgba(255,0,51,0.5)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Invio in corso...' : 'Invia Gossip 🚀'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
