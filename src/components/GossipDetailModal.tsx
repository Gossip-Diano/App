import React, { useState } from 'react';
import { X, Flame, MessageCircle, Share2, Calendar, User } from 'lucide-react';
import { Gossip } from '../types';

interface GossipDetailModalProps {
  gossip: Gossip | null;
  onClose: () => void;
  onVoteHipe: (gossip: Gossip, e: React.MouseEvent) => void;
  isVoted: boolean;
  whatsappLink: string;
  cooldownRemaining: number;
}

export const GossipDetailModal: React.FC<GossipDetailModalProps> = ({
  gossip,
  onClose,
  onVoteHipe,
  isVoted,
  whatsappLink,
  cooldownRemaining
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!gossip) return null;

  const handleShare = async () => {
    const text = `🔥 Gossip Diano:\n"${gossip.text}"\n— ${gossip.author}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gossip Diano',
          text: text,
          url: window.location.href
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl border border-[#FF0033]/50 bg-[#0e0e13]/98 p-5 sm:p-7 liquid-glass shadow-[0_0_40px_rgba(255,0,51,0.25)] space-y-5 animate-in zoom-in-95 duration-200 overscroll-contain"
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0033]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Tasto Chiudi con target 44px */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Chiudi dettaglio"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Intestazione Autore e Data */}
        <div className="flex items-center gap-3 pr-8 pt-1">
          <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[#FF0033] shadow-inner shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{gossip.author}</span>
              {gossip.isAnonymous && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                  Anonimo
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
              <Calendar className="w-3 h-3 text-zinc-500" />
              <span>{gossip.displayDate || `${gossip.month} ${gossip.schoolYear}`}</span>
            </div>
          </div>
        </div>

        {/* Testo del Gossip */}
        <div className="p-4 rounded-2xl bg-[#08080a] border border-zinc-800/90 shadow-inner">
          <p className="text-base sm:text-lg font-medium text-zinc-100 leading-relaxed italic">
            "{gossip.text}"
          </p>
        </div>

        {/* Azioni: Hipe & WhatsApp */}
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Tasto Hipe con cooldown */}
            <button
              onClick={(e) => onVoteHipe(gossip, e)}
              className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl border font-bold text-xs sm:text-sm min-h-[46px] transition-all duration-200 active:scale-95 shadow-md ${
                cooldownRemaining > 0
                  ? 'bg-zinc-900 border-zinc-700/80 text-zinc-400 opacity-80'
                  : isVoted
                  ? 'bg-[#FF0033] border-[#FF0033] text-white shadow-[0_0_15px_rgba(255,0,51,0.5)]'
                  : 'bg-zinc-900 border-zinc-700/80 text-zinc-200 hover:border-[#FF0033]/60 hover:text-white'
              }`}
              title={cooldownRemaining > 0 ? `Attendi ${cooldownRemaining}s prima di un altro voto` : 'Vota Hipe'}
            >
              <Flame className={`w-4 h-4 ${cooldownRemaining > 0 ? 'text-amber-400 fill-amber-400' : isVoted ? 'fill-white text-white' : 'text-[#FF0033]'}`} />
              <span>{cooldownRemaining > 0 ? `${cooldownRemaining}s` : 'Hipe 🔥'}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/30">
                {gossip.hipe}
              </span>
            </button>

            {/* Link WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-white hover:border-emerald-400 font-bold text-xs sm:text-sm min-h-[46px] transition-all duration-200 active:scale-95 shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Commenta 💬</span>
            </a>
          </div>

          {/* Tasto Condividi */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 text-zinc-400 hover:text-white text-xs font-semibold transition-colors min-h-[40px] active:scale-[0.98]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? '✓ Copiato negli appunti!' : 'Condividi questo gossip'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
