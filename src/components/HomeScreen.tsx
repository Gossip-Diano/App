import React from 'react';
import { Flame, Trophy, ExternalLink, Sparkles } from 'lucide-react';
import { Gossip, PostitColor } from '../types';

interface HomeScreenProps {
  gossips: Gossip[];
  votedIds: Set<string>;
  onSelectGossip: (gossip: Gossip) => void;
  onVoteHipe: (gossip: Gossip, e: React.MouseEvent) => void;
  whatsappLink?: string;
  cooldownRemaining: number;
}

const POSTIT_STYLES: Record<PostitColor, { bg: string; border: string; text: string; pinBg: string }> = {
  yellow: {
    bg: 'bg-[#FEF9C3]',
    border: 'border-[#FDE047]',
    text: 'text-zinc-900',
    pinBg: 'bg-red-500'
  },
  pink: {
    bg: 'bg-[#FCE7F3]',
    border: 'border-[#F472B6]',
    text: 'text-zinc-900',
    pinBg: 'bg-pink-600'
  },
  blue: {
    bg: 'bg-[#E0F2FE]',
    border: 'border-[#38BDF8]',
    text: 'text-zinc-900',
    pinBg: 'bg-blue-600'
  },
  green: {
    bg: 'bg-[#DCFCE7]',
    border: 'border-[#4ADE80]',
    text: 'text-zinc-900',
    pinBg: 'bg-emerald-600'
  }
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  gossips,
  votedIds,
  onSelectGossip,
  onVoteHipe,
  cooldownRemaining
}) => {
  // Solo quelli approvati
  const approvedGossips = gossips.filter(g => g.status === 'Approvato');

  // Ultimi 10 gossip inseriti per la Bacheca
  const latestTen = [...approvedGossips]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // Classifica ordinata per Hipe decrescente
  const rankedGossips = [...approvedGossips]
    .sort((a, b) => b.hipe - a.hipe);

  return (
    <div className="w-full space-y-7 sm:space-y-10 pb-28 pt-1">
      
      {/* 1. SEZIONE IN ALTO: BACHECA DEI POST-IT */}
      <section className="w-full space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0033] shadow-[0_0_8px_#FF0033]" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white font-display">
              Bacheca Post-it
            </h2>
          </div>
          <span className="text-xs font-medium text-zinc-400">
            Ultimi gossip
          </span>
        </div>

        {/* Griglia Post-it con overflow-hidden per evitare qualsiasi slittamento dello zoom su Android */}
        {latestTen.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl liquid-glass text-center border border-zinc-800 text-zinc-400 text-sm">
            <Sparkles className="w-8 h-8 text-[#FF0033] mx-auto mb-2 opacity-80" />
            Nessun gossip ancora in bacheca. Tocca il tasto <strong className="text-white">"+"</strong> in basso per pubblicare il primo!
          </div>
        ) : (
          <div className="w-full max-w-full overflow-hidden p-3 sm:p-5 bg-[#09090b]/80 border border-zinc-800/80 rounded-3xl shadow-2xl relative">
            {/* Texture sughero stilizzata di sfondo */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
              {latestTen.map((gossip) => {
                const style = POSTIT_STYLES[gossip.color] || POSTIT_STYLES.yellow;
                const isVoted = votedIds.has(gossip.id);
                // Rotazione limitata a max +-2 gradi su mobile per impedire clipping o overflow orizzontale
                const safeRotation = Math.min(2, Math.max(-2, gossip.rotation || 0));

                return (
                  <div key={gossip.id} className="p-0.5 overflow-hidden">
                    <div
                      onClick={() => onSelectGossip(gossip)}
                      style={{
                        transform: `rotate(${safeRotation}deg)`
                      }}
                      className={`group relative ${style.bg} ${style.text} p-3 sm:p-4 rounded-xl postit-shadow cursor-pointer transition-all duration-200 active:scale-95 hover:scale-105 hover:z-20 border ${style.border}/60 flex flex-col justify-between min-h-[160px] sm:min-h-[170px] select-none`}
                    >
                      {/* Puntina colorata realistica */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center z-10 pointer-events-none">
                        <div
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white/80 postit-pin-shadow shadow-md flex items-center justify-center"
                          style={{ backgroundColor: gossip.pinColor || '#FF0033' }}
                        >
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/70" />
                        </div>
                      </div>

                      {/* Intestazione Post-it */}
                      <div className="pt-1.5 text-left">
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-zinc-700/80 mb-1 border-b border-black/10 pb-1">
                          <span className="truncate max-w-[80px] sm:max-w-[100px]">{gossip.author}</span>
                          <span className="text-[9px] sm:text-[10px] text-zinc-500 shrink-0 font-mono">
                            {gossip.month ? gossip.month.slice(0, 3) : ''}
                          </span>
                        </div>

                        {/* Testo gossip */}
                        <p className="text-xs sm:text-sm leading-snug line-clamp-4 font-normal text-zinc-900 mt-1 italic">
                          "{gossip.text}"
                        </p>
                      </div>

                      {/* Footer del Post-it con Hipe e Apri */}
                      <div className="flex items-center justify-between pt-2 border-t border-black/10 text-[10px] sm:text-[11px] font-medium mt-2">
                        <button
                          onClick={(e) => onVoteHipe(gossip, e)}
                          className={`flex items-center gap-1 px-2 py-1 min-h-[28px] rounded-full transition-transform active:scale-110 ${
                            cooldownRemaining > 0
                              ? 'bg-zinc-800 text-zinc-300 font-semibold'
                              : isVoted ? 'bg-red-500 text-white font-bold' : 'bg-black/10 hover:bg-black/20 text-zinc-800'
                          }`}
                          title={cooldownRemaining > 0 ? `Attendi ${cooldownRemaining}s` : 'Vota Hipe'}
                        >
                          <Flame className={`w-3.5 h-3.5 ${cooldownRemaining > 0 ? 'text-amber-400 fill-amber-400' : 'fill-current'}`} />
                          <span>{cooldownRemaining > 0 ? `${cooldownRemaining}s` : gossip.hipe}</span>
                        </button>
                        <span className="text-[10px] text-zinc-600 group-hover:text-black font-semibold flex items-center gap-0.5">
                          Apri <ExternalLink className="w-2.5 h-2.5 inline" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. SEZIONE IN BASSO: CLASSIFICA HIPE */}
      <section className="w-full space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF0033] fill-[#FF0033]" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white font-display">
              Classifica Hipe 🔥
            </h2>
          </div>
          <span className="text-xs font-medium text-zinc-400">
            I più votati
          </span>
        </div>

        {rankedGossips.length === 0 ? (
          <div className="p-8 rounded-3xl liquid-glass text-center border border-zinc-800 text-zinc-400 text-sm">
            Nessun gossip ancora in classifica.
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3 w-full">
            {rankedGossips.map((gossip, index) => {
              const rank = index + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;
              const isVoted = votedIds.has(gossip.id);

              return (
                <div
                  key={gossip.id}
                  onClick={() => onSelectGossip(gossip)}
                  className={`group relative flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer border active:scale-[0.99] w-full max-w-full overflow-hidden ${
                    isTop1
                      ? 'bg-gradient-to-r from-amber-950/40 via-[#0e0e12] to-zinc-950 border-amber-500/40 shadow-[0_0_18px_rgba(245,158,11,0.12)]'
                      : isTop2
                      ? 'bg-gradient-to-r from-slate-900/40 via-[#0e0e12] to-zinc-950 border-slate-400/40'
                      : isTop3
                      ? 'bg-gradient-to-r from-amber-950/20 via-[#0e0e12] to-zinc-950 border-amber-700/40'
                      : 'liquid-glass border-zinc-800/80 hover:border-[#FF0033]/40'
                  }`}
                >
                  {/* Badge Posizione & Testo */}
                  <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-display font-black text-xs sm:text-base border shadow-md shrink-0">
                      {isTop1 ? (
                        <div className="w-full h-full rounded-xl bg-amber-500/20 border-amber-400/60 text-amber-300 flex items-center justify-center gap-0.5">
                          <span>1°</span>
                          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400" />
                        </div>
                      ) : isTop2 ? (
                        <div className="w-full h-full rounded-xl bg-slate-300/20 border-slate-300/50 text-slate-200 flex items-center justify-center">
                          <span>2°</span>
                        </div>
                      ) : isTop3 ? (
                        <div className="w-full h-full rounded-xl bg-amber-800/20 border-amber-700/50 text-amber-400 flex items-center justify-center">
                          <span>3°</span>
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-xl bg-zinc-900 border-zinc-800 text-zinc-400 flex items-center justify-center font-mono">
                          {rank}°
                        </div>
                      )}
                    </div>

                    {/* Testo e Autore con ellissi sicura */}
                    <div className="min-w-0 text-left flex-1">
                      <p className="text-xs sm:text-sm font-medium text-zinc-100 line-clamp-1 group-hover:text-white transition-colors">
                        "{gossip.text}"
                      </p>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[11px] text-zinc-400">
                        <span className="font-semibold text-[#FF0033] truncate max-w-[95px] sm:max-w-[140px]">
                          {gossip.author}
                        </span>
                        <span>·</span>
                        <span className="truncate">{gossip.month} {gossip.schoolYear}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pulsante Hipe con tocco comodo */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => onVoteHipe(gossip, e)}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all active:scale-105 min-h-[38px] ${
                        cooldownRemaining > 0
                          ? 'bg-zinc-900 border-zinc-700/80 text-zinc-400 opacity-80'
                          : isVoted
                          ? 'bg-[#FF0033] border-[#FF0033] text-white shadow-[0_0_12px_rgba(255,0,51,0.5)] font-bold'
                          : 'bg-zinc-900/90 border-zinc-700/80 text-zinc-300 hover:border-[#FF0033]/60 hover:text-white'
                      }`}
                      title={cooldownRemaining > 0 ? `Attendi ${cooldownRemaining}s` : 'Supporta con un Hipe'}
                    >
                      <Flame className={`w-3.5 h-3.5 ${cooldownRemaining > 0 ? 'text-amber-400 fill-amber-400' : isVoted ? 'fill-white text-white' : 'text-[#FF0033]'}`} />
                      <span className="text-xs sm:text-sm font-bold tabular-nums">
                        {cooldownRemaining > 0 ? `${cooldownRemaining}s` : gossip.hipe}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
