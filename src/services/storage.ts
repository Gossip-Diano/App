import { Gossip, AppSettings, PostitColor } from '../types';
import { DEFAULT_GOOGLE_SCRIPT_URL } from '../config';

const STORAGE_GOSSIP_KEY = 'gossip_diano_posts_v2';
const STORAGE_SETTINGS_KEY = 'gossip_diano_settings_v2';
const STORAGE_VOTES_KEY = 'gossip_diano_voted_ids_v1';
const STORAGE_LAST_VOTE_KEY = 'gossip_diano_last_vote_timestamp';

export const HIPE_COOLDOWN_SECONDS = 10;

export const DEFAULT_SETTINGS: AppSettings = {
  whatsappLink: 'https://chat.whatsapp.com/GossipDianoOfficial',
  adminPassword: 'diano2026',
  googleScriptUrl: DEFAULT_GOOGLE_SCRIPT_URL || '',
  schoolName: 'Gossip Diano'
};

const INITIAL_GOSSIPS: Gossip[] = [
  {
    id: 'g-001',
    timestamp: '2026-10-29T14:20:00.000Z',
    displayDate: '29 Ott 2026, 15:20',
    schoolYear: '2025/2026',
    month: 'Ottobre',
    author: 'Anonimo 🕵️‍♂️',
    isAnonymous: true,
    text: 'Avvistati durante l\'ora buca in aula magna: il rappresentante d\'istituto e la ragazza della 5^C dietro le quinte del palco... e non stavano preparando la festa di Natale! 🤫🔥',
    hipe: 142,
    status: 'Approvato',
    color: 'pink',
    pinColor: '#FF0033',
    rotation: -2.5
  },
  {
    id: 'g-002',
    timestamp: '2026-10-29T10:15:00.000Z',
    displayDate: '29 Ott 2026, 11:15',
    schoolYear: '2025/2026',
    month: 'Ottobre',
    author: 'Marco P. (4^B)',
    isAnonymous: false,
    text: 'Il prof di matematica ha dimenticato la chiavetta USB con il compito di recupero inserita nel computer della classe 3^A. Chiunque l\'abbia presa è pregato di condividere i file nel gruppo Telegram o WhatsApp!',
    hipe: 98,
    status: 'Approvato',
    color: 'yellow',
    pinColor: '#FBBF24',
    rotation: 1.8
  },
  {
    id: 'g-003',
    timestamp: '2026-10-28T18:45:00.000Z',
    displayDate: '28 Ott 2026, 19:45',
    schoolYear: '2025/2026',
    month: 'Ottobre',
    author: 'Anonimo 🕵️‍♂️',
    isAnonymous: true,
    text: 'Le due "coppie storiche" della 4^ scientifico sono ufficialmente scoppiate e... sorpresa! Sabato sera si sono scambiati i partner al locale sotto gli occhi di mezza scuola.',
    hipe: 184,
    status: 'Approvato',
    color: 'blue',
    pinColor: '#3B82F6',
    rotation: -1.2
  },
  {
    id: 'g-004',
    timestamp: '2026-10-27T12:05:00.000Z',
    displayDate: '27 Ott 2026, 13:05',
    schoolYear: '2025/2026',
    month: 'Ottobre',
    author: 'Anonimo 🕵️‍♂️',
    isAnonymous: true,
    text: 'La macchinetta del caffè al secondo piano tra l\'aula professori e il bagno delle ragazze oggi ha regalato merendine e resto doppio per 45 minuti. Chi è il genio che ha hackerato la molla?',
    hipe: 76,
    status: 'Approvato',
    color: 'green',
    pinColor: '#10B981',
    rotation: 3.1
  },
  {
    id: 'g-005',
    timestamp: '2026-10-26T09:30:00.000Z',
    displayDate: '26 Ott 2026, 10:30',
    schoolYear: '2025/2026',
    month: 'Ottobre',
    author: 'Chiara R.',
    isAnonymous: false,
    text: 'Ma avete visto la dedica anonima scritta con pennarello indelebile rosso sul banco 14 del laboratorio di chimica? "Sei bella come l\'ora di buca di lunedì". Fatevi avanti!',
    hipe: 112,
    status: 'Approvato',
    color: 'pink',
    pinColor: '#FF0033',
    rotation: -2.8
  },
  {
    id: 'g-006',
    timestamp: '2026-10-25T16:10:00.000Z',
    displayDate: '25 Ott 2026, 17:10',
    schoolYear: '2025/2026',
    month: 'Ottobre',
    author: 'Anonimo 🕵️‍♂️',
    isAnonymous: true,
    text: 'Qualcuno ha invertito le etichette delle aule dei prof di lettere e di disegno tecnico al terzo piano: 60 studenti sono finiti nell\'aula sbagliata fingendo che fosse la lezione corretta per 20 minuti!',
    hipe: 65,
    status: 'Approvato',
    color: 'yellow',
    pinColor: '#FBBF24',
    rotation: 2.2
  },
  {
    id: 'g-007',
    timestamp: '2026-10-24T14:00:00.000Z',
    displayDate: '24 Ott 2026, 15:00',
    schoolYear: '2025/2026',
    month: 'Ottobre',
    author: 'Anonimo 🕵️‍♂️',
    isAnonymous: true,
    text: 'La prof di inglese ha scoperto per caso il video su TikTok con 80k visualizzazioni registrato nell\'intervallo coi balletti della 2^D. In arrivo note di classe di massa?',
    hipe: 129,
    status: 'Approvato',
    color: 'blue',
    pinColor: '#3B82F6',
    rotation: -1.7
  },
  {
    id: 'g-008',
    timestamp: '2026-09-28T11:20:00.000Z',
    displayDate: '28 Set 2026, 12:20',
    schoolYear: '2025/2026',
    month: 'Settembre',
    author: 'Lorenzo (5^A)',
    isAnonymous: false,
    text: 'Primo giorno di assemblea e c\'è già una dichiarazione pubblica al megafono durante il discorso d\'apertura! Risposta della ragazza: "Ti rispondo su Gossip Diano".',
    hipe: 220,
    status: 'Approvato',
    color: 'green',
    pinColor: '#10B981',
    rotation: 2.6
  },
  {
    id: 'g-009',
    timestamp: '2026-09-15T08:50:00.000Z',
    displayDate: '15 Set 2026, 09:50',
    schoolYear: '2025/2026',
    month: 'Settembre',
    author: 'Anonimo 🕵️‍♂️',
    isAnonymous: true,
    text: 'Nuovo anno scolastico, soliti amori impossibili: il capitano della squadra di pallavolo è stato visto accompagnare la nuova arrivata della prima fino all\'armadietto.',
    hipe: 89,
    status: 'Approvato',
    color: 'pink',
    pinColor: '#FF0033',
    rotation: -3.0
  },
  {
    id: 'g-010',
    timestamp: '2026-05-18T17:30:00.000Z',
    displayDate: '18 Mag 2026, 18:30',
    schoolYear: '2024/2025',
    month: 'Maggio',
    author: 'Anonimo 🕵️‍♂️',
    isAnonymous: true,
    text: 'Alla gita di fine anno a Barcellona qualcuno ha dimenticato lo zaino con le chiavi dell\'hotel sulla spiaggia... e abbiamo dormito tutti nella hall cantando canzoni fino all\'alba.',
    hipe: 254,
    status: 'Approvato',
    color: 'yellow',
    pinColor: '#FBBF24',
    rotation: 1.5
  },
  {
    id: 'g-pending-01',
    timestamp: '2026-10-30T09:10:00.000Z',
    displayDate: '30 Ott 2026, 10:10',
    schoolYear: '2025/2026',
    month: 'Ottobre',
    author: 'Anonimo 🕵️‍♂️',
    isAnonymous: true,
    text: 'Quel compito a sorpresa di fisica era illegale! Ma è vero che il prof ha preso le risposte da Yahoo Answers?',
    hipe: 14,
    status: 'In attesa',
    color: 'pink',
    pinColor: '#FF0033',
    rotation: -2.0,
    flaggedWords: ['compito a sorpresa']
  }
];

export function getStoredSettings(): AppSettings {
  let settings: AppSettings = {
    ...DEFAULT_SETTINGS,
    googleScriptUrl: DEFAULT_GOOGLE_SCRIPT_URL || ''
  };

  // Controlla se la Web App URL è passata come parametro nell'URL (es: ?db=https://... o ?sheet=...)
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryDb = urlParams.get('db') || urlParams.get('sheet') || urlParams.get('url');
      if (queryDb && queryDb.startsWith('http')) {
        settings.googleScriptUrl = decodeURIComponent(queryDb.trim());
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
        // Pulisci l'URL nella barra indirizzi in modo pulito
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch {}
  }

  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      settings = { ...settings, ...parsed };
      // Se parsed non ha un URL configurato ma esiste DEFAULT_GOOGLE_SCRIPT_URL, usalo
      if (!settings.googleScriptUrl && DEFAULT_GOOGLE_SCRIPT_URL) {
        settings.googleScriptUrl = DEFAULT_GOOGLE_SCRIPT_URL.trim();
      }
    }
  } catch {
    // fallback
  }

  return settings;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function getStoredGossips(): Gossip[] {
  try {
    const raw = localStorage.getItem(STORAGE_GOSSIP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to initial
  }
  localStorage.setItem(STORAGE_GOSSIP_KEY, JSON.stringify(INITIAL_GOSSIPS));
  return INITIAL_GOSSIPS;
}

export function saveStoredGossips(gossips: Gossip[]): void {
  try {
    localStorage.setItem(STORAGE_GOSSIP_KEY, JSON.stringify(gossips));
  } catch (e) {
    console.error('Error saving gossips', e);
  }
}

export function getVotedGossipIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_VOTES_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // fallback
  }
  return new Set();
}

export function recordGossipVote(id: string): void {
  try {
    const votes = getVotedGossipIds();
    votes.add(id);
    localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(Array.from(votes)));
  } catch (e) {
    console.error('Error recording vote', e);
  }
}

export function getLastVoteTimestamp(): number {
  try {
    const raw = localStorage.getItem(STORAGE_LAST_VOTE_KEY);
    if (raw) {
      return Number(raw) || 0;
    }
  } catch {
    // fallback
  }
  return 0;
}

export function setLastVoteTimestamp(timestamp: number): void {
  try {
    localStorage.setItem(STORAGE_LAST_VOTE_KEY, String(timestamp));
  } catch (e) {
    console.error('Error saving last vote timestamp', e);
  }
}

export function getRemainingCooldown(): number {
  const lastTime = getLastVoteTimestamp();
  if (!lastTime) return 0;
  const elapsedSeconds = Math.floor((Date.now() - lastTime) / 1000);
  const remaining = HIPE_COOLDOWN_SECONDS - elapsedSeconds;
  return remaining > 0 ? remaining : 0;
}

export function pickRandomColor(): { color: PostitColor; pinColor: string; rotation: number } {
  const colors: PostitColor[] = ['yellow', 'pink', 'blue', 'green'];
  const pinColors = ['#FF0033', '#FBBF24', '#3B82F6', '#10B981'];
  
  const chosenColor = colors[Math.floor(Math.random() * colors.length)];
  const chosenPin = pinColors[Math.floor(Math.random() * pinColors.length)];
  const rot = Number(((Math.random() * 7) - 3.5).toFixed(1));
  
  return {
    color: chosenColor,
    pinColor: chosenPin,
    rotation: rot === 0 ? 1.5 : rot
  };
}

export function getCurrentSchoolYearAndMonth(): { schoolYear: string; month: string } {
  const now = new Date();
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  
  const schoolYear = monthIdx >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  const month = months[monthIdx];
  
  return { schoolYear, month };
}

/**
 * Verifica la connessione al Google Sheet (ping)
 */
export async function testGoogleSheetConnection(url: string): Promise<{ success: boolean; message: string; count?: number }> {
  if (!url || !url.startsWith('http')) {
    return { success: false, message: 'URL non valido. Inserisci un link https://' };
  }
  try {
    const separator = url.includes('?') ? '&' : '?';
    const pingUrl = `${url}${separator}action=ping&_t=${Date.now()}`;
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      return { success: false, message: `Server Google ha risposto con codice ${response.status}` };
    }
    const data = await response.json();
    if (data && data.success) {
      return {
        success: true,
        message: data.message || 'Connessione stabilita con successo!',
        count: data.totalGossips ?? 0
      };
    }
    return { success: false, message: data.error || 'Risposta inattesa da Google Apps Script' };
  } catch (err: any) {
    return { success: false, message: 'Impossibile contattare lo script. Assicurati che l\'accesso sia impostato su "Chiunque".' };
  }
}

/**
 * Funzione asincrona di sincronizzazione con Google Apps Script
 * Garantisce che tutti i dispositivi (iPhone Safari, Android, PC, Mac) leggano gli stessi dati
 */
export async function syncWithGoogleSheet(url: string): Promise<{ gossips?: Gossip[]; config?: Partial<AppSettings>; totalGossips?: number } | null> {
  if (!url || !url.startsWith('http')) return null;
  try {
    const separator = url.includes('?') ? '&' : '?';
    const cacheBusterUrl = `${url}${separator}_t=${Date.now()}`;
    const response = await fetch(cacheBusterUrl, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.success) {
      return {
        gossips: data.gossips,
        config: data.config,
        totalGossips: data.totalGossips ?? (data.gossips ? data.gossips.length : 0)
      };
    }
  } catch (err) {
    console.warn('Errore sync Google Apps Script:', err);
  }
  return null;
}

export async function sendGossipToGoogleSheet(url: string, gossip: Gossip): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'addGossip', gossip })
    });
    return true;
  } catch {
    try {
      const gParam = encodeURIComponent(JSON.stringify(gossip));
      await fetch(`${url}${url.includes('?') ? '&' : '?'}action=addGossip&gossip=${gParam}&_t=${Date.now()}`, {
        method: 'GET',
        mode: 'no-cors'
      });
      return true;
    } catch (e2) {
      console.warn('Errore salvataggio gossip su Google Sheet:', e2);
      return false;
    }
  }
}

export async function voteHipeInGoogleSheet(url: string, id: string): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'voteHipe', id })
    });
    return true;
  } catch {
    try {
      await fetch(`${url}${url.includes('?') ? '&' : '?'}action=voteHipe&id=${encodeURIComponent(id)}&_t=${Date.now()}`, {
        method: 'GET',
        mode: 'no-cors'
      });
      return true;
    } catch (e2) {
      console.warn('Errore voto Google Sheet:', e2);
      return false;
    }
  }
}

export async function updateGossipInGoogleSheet(url: string, id: string, updates: Partial<Gossip>): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateGossip', id, updates })
    });
    return true;
  } catch {
    try {
      const uParam = encodeURIComponent(JSON.stringify(updates));
      await fetch(`${url}${url.includes('?') ? '&' : '?'}action=updateGossip&id=${encodeURIComponent(id)}&updates=${uParam}&_t=${Date.now()}`, {
        method: 'GET',
        mode: 'no-cors'
      });
      return true;
    } catch (e2) {
      console.warn('Errore update Google Sheet:', e2);
      return false;
    }
  }
}

export async function deleteGossipInGoogleSheet(url: string, id: string): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'deleteGossip', id })
    });
    return true;
  } catch {
    try {
      await fetch(`${url}${url.includes('?') ? '&' : '?'}action=deleteGossip&id=${encodeURIComponent(id)}&_t=${Date.now()}`, {
        method: 'GET',
        mode: 'no-cors'
      });
      return true;
    } catch (e2) {
      console.warn('Errore delete Google Sheet:', e2);
      return false;
    }
  }
}

export async function updateConfigInGoogleSheet(url: string, key: string, value: string): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateConfig', key, value })
    });
    return true;
  } catch {
    try {
      await fetch(`${url}${url.includes('?') ? '&' : '?'}action=updateConfig&key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}&_t=${Date.now()}`, {
        method: 'GET',
        mode: 'no-cors'
      });
      return true;
    } catch (e2) {
      console.warn('Errore salvataggio config Google Sheet:', e2);
      return false;
    }
  }
}

/**
 * Caricamento massivo di tutti i gossip locali sul Google Sheet
 * Utile quando si collega un nuovo foglio per popolarlo all'istante
 */
export async function bulkUploadToGoogleSheet(url: string, gossips: Gossip[]): Promise<{ success: boolean; count: number }> {
  if (!url || !url.startsWith('http') || !gossips.length) {
    return { success: false, count: 0 };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'bulkUpload', gossips })
    });
    if (res.ok) {
      try {
        const json = await res.json();
        return { success: true, count: json.added ?? gossips.length };
      } catch {
        return { success: true, count: gossips.length };
      }
    }
  } catch (err) {
    console.warn('POST bulkUpload error, falling back to individual items:', err);
  }

  // Fallback: invio singolo se il payload massivo fallisce
  let uploaded = 0;
  for (const g of gossips) {
    const ok = await sendGossipToGoogleSheet(url, g);
    if (ok) uploaded++;
  }
  return { success: uploaded > 0, count: uploaded };
}
