import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Flame, MessageCircle, ChevronUp, ChevronDown, Share2, Sparkles, User, Calendar } from 'lucide-react';
import { Gossip } from '../types';

interface FeedScreenProps {
  gossips: Gossip[];
  votedIds: Set<string>;
  onVoteHipe: (gossip: Gossip, e: React.MouseEvent) => void;
  whatsappLink: string;
  cooldownRemaining: number;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({
  gossips,
  votedIds,
  onVoteHipe,
  whatsappLink,
  cooldownRemaining
}) => {
  const approvedGossips = gossips.filter(g => g.status === 'Approvato');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Assicura indice valido
  useEffect(() => {
    if (currentIndex >= approvedGossips.length) {
      setCurrentIndex(Math.max(0, approvedGossips.length - 1));
    }
  }, [approvedGossips.length, currentIndex]);

  const currentGossip = approvedGossips[currentIndex];

  const goNext = () => {
    if (currentIndex < approvedGossips.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Supporto tastiera frecce su/giù
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        goNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, approvedGossips.length]);

  // Gestione gesture swipe mobile
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.y;
    const velocity = info.velocity.y;

    if (offset < -50 || velocity < -350) {
      goNext();
    } else if (offset > 50 || velocity > 350) {
      goPrev();
    }
  };

  const handleShare = async (gossip: Gossip) => {
    const shareText = `🔥 Gossip Diano:\n"${gossip.text}"\n— Autore: ${gossip.author}\nVotalo subito sull'app!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gossip Diano',
          text: shareText,
          url: window.location.href
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedId(gossip.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  if (approvedGossips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55dvh] text-center p-6 liquid-glass rounded-3xl border border-zinc-800 my-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#FF0033]/15 border border-[#FF0033]/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,0,51,0.25)]">
          <Sparkles className="w-7 h-7 text-[#FF0033]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-display">Nessun gossip nel Feed</h3>
        <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
          I nuovi gossip approvati compariranno qui a scorrimento verticale. Usa il tasto <strong>"+"</strong> per aggiungerne uno!
        </p>
      </div>
    );
  }

  const isVoted = votedIds.has(currentGossip.id);

  // Varianti di animazione ottimizzate per mobile a 60fps
  const cardVariants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 120 : dir < 0 ? -120 : 0,
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 28,
        mass: 0.7
      }
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.94,
      transition: {
        duration: 0.18,
        ease: 'easeInOut' as const
      }
    })
  };

  return (
    <div className="relative w-full h-[calc(100dvh-130px)] max-h-[640px] min-h-[460px] flex flex-col items-center justify-center px-1 sm:px-2 select-none touch-none">
      
      {/* Controlli compatti di navigazione card */}
      <div className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 z-30 pointer-events-auto">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full liquid-glass border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#FF0033] disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90 shadow-md"
          aria-label="Gossip precedente"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <div className="text-center font-mono text-[10px] text-zinc-400 font-bold py-1 px-1.5 bg-black/60 rounded-full border border-zinc-800">
          {currentIndex + 1}/{approvedGossips.length}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex === approvedGossips.length - 1}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full liquid-glass border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#FF0033] disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90 shadow-md"
          aria-label="Gossip successivo"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* CARTA SHORTS MOBILE-FIRST */}
      <div className="relative w-full max-w-sm sm:max-w-md h-full max-h-[540px] flex items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentGossip.id}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 rounded-[28px] border border-[#FF0033]/40 bg-gradient-to-b from-[#131318]/98 via-[#0c0c10]/98 to-[#060608]/98 p-5 sm:p-7 flex flex-col justify-between shadow-[0_15px_45px_rgba(0,0,0,0.9),0_0_20px_rgba(255,0,51,0.18)] overflow-hidden cursor-grab active:cursor-grabbing backdrop-blur-2xl"
          >
            {/* Glow decorativo */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FF0033]/15 rounded-full blur-3xl pointer-events-none" />

            {/* 1. IN ALTO: AUTORE E TIMESTAMP */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 z-10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[#FF0033] shadow-inner">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span className="truncate max-w-[140px]">{currentGossip.author}</span>
                    {currentGossip.isAnonymous && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                        Anonimo
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    <span>{currentGossip.displayDate || `${currentGossip.month} ${currentGossip.schoolYear}`}</span>
                  </div>
                </div>
              </div>

              {/* Tasto Condividi touch-friendly */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(currentGossip);
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/60 active:scale-90 transition-all"
                title="Condividi Gossip"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* 2. AL CENTRO: TESTO DEL GOSSIP */}
            <div className="my-auto py-3 z-10 flex flex-col justify-center text-left overflow-y-auto max-h-[260px] pr-1">
              <div className="text-[#FF0033] text-3xl font-serif font-black mb-1 opacity-60 select-none">
                “
              </div>
              <p className="text-base sm:text-lg font-medium text-zinc-100 leading-relaxed tracking-normal font-display">
                {currentGossip.text}
              </p>
              <div className="text-right text-[#FF0033] text-3xl font-serif font-black -mt-1 opacity-60 select-none">
                ”
              </div>
              {copiedId === currentGossip.id && (
                <div className="text-center text-xs font-semibold text-emerald-400 animate-bounce mt-1">
                  ✓ Testo copiato!
                </div>
              )}
            </div>

            {/* 3. IN BASSO: HIPE VOTE & COMMENTA SU WHATSAPP */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80 z-10 shrink-0">
              
              <div className="grid grid-cols-2 gap-2.5">
                {/* Tasto Hipe interattivo */}
                <button
                  onClick={(e) => onVoteHipe(currentGossip, e)}
                  className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl border font-bold text-xs sm:text-sm min-h-[46px] transition-all duration-200 active:scale-95 shadow-lg ${
                    cooldownRemaining > 0
                      ? 'bg-zinc-900 border-zinc-700/80 text-zinc-400 opacity-80'
                      : isVoted
                      ? 'bg-[#FF0033] border-[#FF0033] text-white shadow-[0_0_18px_rgba(255,0,51,0.6)]'
                      : 'bg-zinc-900 border-zinc-700/80 text-zinc-100 hover:border-[#FF0033]/60 hover:text-white'
                  }`}
                  title={cooldownRemaining > 0 ? `Attendi ${cooldownRemaining}s` : 'Vota Hipe'}
                >
                  <Flame className={`w-4 h-4 ${cooldownRemaining > 0 ? 'text-amber-400 fill-amber-400' : isVoted ? 'fill-white text-white' : 'text-[#FF0033]'}`} />
                  <span>{cooldownRemaining > 0 ? `${cooldownRemaining}s` : 'Hipe 🔥'}</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/40">
                    {currentGossip.hipe}
                  </span>
                </button>

                {/* Link rapido Commenta su WhatsApp */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-white hover:border-emerald-400 font-bold text-xs sm:text-sm min-h-[46px] transition-all duration-200 active:scale-95 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp 💬</span>
                </a>
              </div>

              <p className="text-[10px] text-zinc-500 text-center tracking-tight">
                Scorri verso l'alto o il basso per sfogliare
              </p>

            </div>

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};
