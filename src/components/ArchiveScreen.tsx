import React, { useState, useMemo } from 'react';
import { Search, Filter, Flame, ChevronRight, Calendar, BookOpen } from 'lucide-react';
import { Gossip } from '../types';

interface ArchiveScreenProps {
  gossips: Gossip[];
  votedIds: Set<string>;
  onSelectGossip: (gossip: Gossip) => void;
  onVoteHipe: (gossip: Gossip, e: React.MouseEvent) => void;
  cooldownRemaining: number;
}

const ALL_MONTHS = [
  'Tutti i Mesi',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno'
];

export const ArchiveScreen: React.FC<ArchiveScreenProps> = ({
  gossips,
  votedIds,
  onSelectGossip,
  onVoteHipe,
  cooldownRemaining
}) => {
  const approvedGossips = gossips.filter(g => g.status === 'Approvato');

  // Estrai tutti gli anni scolastici unici presenti
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    approvedGossips.forEach(g => {
      if (g.schoolYear) set.add(g.schoolYear);
    });
    // Aggiungi anni default se vuoto
    set.add('2025/2026');
    set.add('2024/2025');
    return ['Tutti gli Anni', ...Array.from(set)];
  }, [approvedGossips]);

  const [selectedYear, setSelectedYear] = useState<string>('Tutti gli Anni');
  const [selectedMonth, setSelectedMonth] = useState<string>('Tutti i Mesi');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtra e ordina cronologicamente
  const filteredGossips = useMemo(() => {
    return approvedGossips
      .filter(g => {
        const matchYear = selectedYear === 'Tutti gli Anni' || g.schoolYear === selectedYear;
        const matchMonth = selectedMonth === 'Tutti i Mesi' || g.month.toLowerCase() === selectedMonth.toLowerCase();
        const matchSearch = !searchQuery.trim() ||
          g.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchYear && matchMonth && matchSearch;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [approvedGossips, selectedYear, selectedMonth, searchQuery]);

  return (
    <div className="space-y-6 pb-28 pt-2">
      
      {/* Intestazione Sezione */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#FF0033]" />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
            Archivio Storico
          </h2>
        </div>
        <span className="text-xs text-zinc-400 font-medium">
          Tutti i gossip passati
        </span>
      </div>

      {/* 1. I DUE MENU A TENDINA STILIZZATI IN ROSSO/NERO + BARRA DI RICERCA */}
      <div className="p-4 rounded-3xl liquid-glass border border-zinc-800/90 space-y-3">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Menu a tendina 1: Anno Scolastico */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Anno Scolastico
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full appearance-none bg-[#0a0a0d] border border-zinc-700/80 hover:border-[#FF0033]/70 focus:border-[#FF0033] rounded-2xl py-2.5 px-4 text-sm font-semibold text-white outline-none transition-all cursor-pointer shadow-inner"
              >
                {availableYears.map(yr => (
                  <option key={yr} value={yr} className="bg-zinc-900 text-white">
                    {yr}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#FF0033]">
                ▼
              </div>
            </div>
          </div>

          {/* Menu a tendina 2: Mese */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Mese
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full appearance-none bg-[#0a0a0d] border border-zinc-700/80 hover:border-[#FF0033]/70 focus:border-[#FF0033] rounded-2xl py-2.5 px-4 text-sm font-semibold text-white outline-none transition-all cursor-pointer shadow-inner"
              >
                {ALL_MONTHS.map(m => (
                  <option key={m} value={m} className="bg-zinc-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#FF0033]">
                ▼
              </div>
            </div>
          </div>

        </div>

        {/* Barra di ricerca testuale */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 mt-0.5" />
          <input
            type="text"
            placeholder="Cerca parole chiave, classi o autori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#07070a] border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#FF0033] transition-colors"
          />
        </div>

      </div>

      {/* 2. ELENCO CRONOLOGICO DEI VECCHI GOSSIP */}
      <div className="space-y-3">
        {filteredGossips.length === 0 ? (
          <div className="p-8 rounded-3xl liquid-glass text-center border border-zinc-800 text-zinc-400 text-sm">
            Nessun gossip trovato con questi filtri. Prova a selezionare "Tutti gli Anni" o "Tutti i Mesi".
          </div>
        ) : (
          filteredGossips.map(gossip => {
            const isVoted = votedIds.has(gossip.id);

            return (
              <div
                key={gossip.id}
                onClick={() => onSelectGossip(gossip)}
                className="group relative flex items-center justify-between p-4 rounded-2xl liquid-glass border border-zinc-800/80 hover:border-[#FF0033]/50 transition-all duration-200 cursor-pointer shadow-lg"
              >
                <div className="space-y-1.5 max-w-[200px] sm:max-w-md md:max-w-xl text-left">
                  {/* Data & Anno */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{gossip.displayDate || `${gossip.month} ${gossip.schoolYear}`}</span>
                    <span>·</span>
                    <span className="font-semibold text-zinc-300">{gossip.author}</span>
                  </div>

                  {/* Anteprima Testo */}
                  <p className="text-sm font-medium text-zinc-100 line-clamp-2 group-hover:text-white transition-colors">
                    "{gossip.text}"
                  </p>
                </div>

                {/* Hipe & Bottone Apri */}
                <div className="flex items-center gap-3 shrink-0 pl-3">
                  <button
                    onClick={(e) => onVoteHipe(gossip, e)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-105 ${
                      cooldownRemaining > 0
                        ? 'bg-zinc-900 border-zinc-700/80 text-zinc-400 opacity-80'
                        : isVoted
                        ? 'bg-[#FF0033] border-[#FF0033] text-white shadow-[0_0_10px_rgba(255,0,51,0.5)]'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-[#FF0033]/60 hover:text-white'
                    }`}
                    title={cooldownRemaining > 0 ? `Attendi ${cooldownRemaining}s prima di un altro voto` : 'Vota Hipe'}
                  >
                    <Flame className={`w-3.5 h-3.5 ${cooldownRemaining > 0 ? 'text-amber-400 fill-amber-400' : isVoted ? 'fill-white' : 'text-[#FF0033]'}`} />
                    <span className="tabular-nums">{cooldownRemaining > 0 ? `${cooldownRemaining}s` : gossip.hipe}</span>
                  </button>

                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-[#FF0033] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>



    </div>
  );
};
