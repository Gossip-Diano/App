import React, { useState, useEffect, useRef } from 'react';
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
  const [direction, setDirection] = useState<number>(0); // 1 = giù (prossimo), -1 = su (precedente)
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

  // Gestione rilascio drag per scorrimento Shorts
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.y;
    const velocity = info.velocity.y;

    if (offset < -60 || velocity < -400) {
      goNext();
    } else if (offset > 60 || velocity > 400) {
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
      } catch {
        // Fallback al clipboard
      }
    }
    await navigator.clipboard.writeText(shareText);
    setCopiedId(gossip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (approvedGossips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 liquid-glass rounded-3xl border border-zinc-800">
        <Sparkles className="w-12 h-12 text-[#FF0033] mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Nessun gossip nel Feed</h3>
        <p className="text-zinc-400 text-sm max-w-xs">
          Non sono ancora presenti gossip approvati. Usa il tasto "+" in basso a destra per aggiungerne uno!
        </p>
      </div>
    );
  }

  const isVoted = votedIds.has(currentGossip.id);

  // Varianti di animazione per la transizione fluida delle card
  const cardVariants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 140 : dir < 0 ? -140 : 0,
      opacity: 0,
      scale: 0.92,
      rotateX: dir > 0 ? 12 : dir < 0 ? -12 : 0
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 280,
        damping: 26,
        mass: 0.8
      }
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -140 : 140,
      opacity: 0,
      scale: 0.92,
      rotateX: dir > 0 ? -12 : 12,
      transition: {
        duration: 0.22,
        ease: 'easeInOut' as const
      }
    })
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] flex flex-col items-center justify-center px-2 py-4 select-none perspective-[1000px]">
      
      {/* Controlli laterali di navigazione card (desktop & touch helper) */}
      <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-30">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="w-10 h-10 rounded-full liquid-glass border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#FF0033] disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90"
          aria-label="Gossip precedente"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        <div className="text-center font-mono text-[11px] text-zinc-400 font-bold py-1 bg-black/40 px-2 rounded-full border border-zinc-800">
          {currentIndex + 1}/{approvedGossips.length}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex === approvedGossips.length - 1}
          className="w-10 h-10 rounded-full liquid-glass border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#FF0033] disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90"
          aria-label="Gossip successivo"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* CARTA SHORTS ANIMATA CON ANIMATEPRESENCE E DRAG GESTURE */}
      <div className="relative w-full max-w-md h-full max-h-[580px] flex items-center justify-center">
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
            dragElastic={0.25}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 rounded-3xl border border-[#FF0033]/40 bg-gradient-to-b from-[#111116]/95 via-[#0b0b0f]/95 to-[#060608]/98 p-6 md:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(255,0,51,0.18)] overflow-hidden cursor-grab active:cursor-grabbing backdrop-blur-2xl"
          >
            {/* Glow decorativo d'atmosfera */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#FF0033]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#FF0033]/10 rounded-full blur-3xl pointer-events-none" />

            {/* 1. IN ALTO: AUTORE E TIMESTAMP */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[#FF0033] shadow-inner">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>{currentGossip.author}</span>
                    {currentGossip.isAnonymous && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                        Secret
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    <span>{currentGossip.displayDate || currentGossip.month + ' ' + currentGossip.schoolYear}</span>
                  </div>
                </div>
              </div>

              {/* Tasto Condividi */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(currentGossip);
                }}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                title="Condividi Gossip"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* 2. AL CENTRO: TESTO DEL GOSSIP */}
            <div className="my-auto py-4 z-10 flex flex-col justify-center text-left overflow-y-auto max-h-[300px]">
              <div className="text-[#FF0033] text-4xl font-serif font-black mb-1 opacity-50 select-none">
                “
              </div>
              <p className="text-lg md:text-xl font-medium text-zinc-100 leading-relaxed tracking-normal font-display">
                {currentGossip.text}
              </p>
              <div className="text-right text-[#FF0033] text-4xl font-serif font-black -mt-2 opacity-50 select-none">
                ”
              </div>
              {copiedId === currentGossip.id && (
                <div className="text-center text-xs font-semibold text-emerald-400 animate-bounce mt-2">
                  ✓ Testo copiato negli appunti!
                </div>
              )}
            </div>

            {/* 3. IN BASSO: HIPE VOTE & COMMENTA SU WHATSAPP */}
            <div className="space-y-3 pt-3 border-t border-zinc-800/80 z-10 shrink-0">
              
              <div className="grid grid-cols-2 gap-3">
                {/* Tasto Hipe interattivo con cooldown */}
                <button
                  onClick={(e) => onVoteHipe(currentGossip, e)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border font-bold text-sm transition-all duration-200 active:scale-95 shadow-lg ${
                    cooldownRemaining > 0
                      ? 'bg-zinc-900 border-zinc-700/80 text-zinc-400 opacity-80'
                      : isVoted
                      ? 'bg-[#FF0033] border-[#FF0033] text-white shadow-[0_0_20px_rgba(255,0,51,0.6)]'
                      : 'bg-zinc-900 border-zinc-700/80 text-zinc-100 hover:border-[#FF0033]/60 hover:text-white'
                  }`}
                  title={cooldownRemaining > 0 ? `Attendi ${cooldownRemaining}s prima di un altro Hipe` : 'Vota Hipe'}
                >
                  <Flame className={`w-5 h-5 ${cooldownRemaining > 0 ? 'text-amber-400 fill-amber-400' : isVoted ? 'fill-white text-white' : 'text-[#FF0033]'}`} />
                  <span>{cooldownRemaining > 0 ? `Attendi (${cooldownRemaining}s)` : 'Hipe 🔥'}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/30">
                    {currentGossip.hipe}
                  </span>
                </button>

                {/* Link rapido Commenta su WhatsApp */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-white hover:border-emerald-400 font-bold text-sm transition-all duration-200 active:scale-95 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>WhatsApp 💬</span>
                </a>
              </div>

              <p className="text-[10px] text-zinc-500 text-center">
                Trascina in alto/basso o usa le frecce per cambiare gossip
              </p>

            </div>

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};
