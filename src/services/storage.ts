import { Gossip, AppSettings, PostitColor } from '../types';
import { DEFAULT_GOOGLE_SCRIPT_URL } from '../config';

const STORAGE_GOSSIP_KEY = 'gossip_diano_posts_v3';
const STORAGE_SETTINGS_KEY = 'gossip_diano_settings_v3';
const STORAGE_VOTES_KEY = 'gossip_diano_voted_ids_v2';
const STORAGE_LAST_VOTE_KEY = 'gossip_diano_last_vote_timestamp';

export const HIPE_COOLDOWN_SECONDS = 10;

export const DEFAULT_SETTINGS: AppSettings = {
  whatsappLink: 'https://chat.whatsapp.com/GossipDianoOfficial',
  adminPassword: 'diano2026',
  googleScriptUrl: DEFAULT_GOOGLE_SCRIPT_URL || '',
  schoolName: 'Gossip Diano'
};

export const INITIAL_GOSSIPS: Gossip[] = [];

export function getStoredSettings(): AppSettings {
  let settings: AppSettings = {
    ...DEFAULT_SETTINGS,
    googleScriptUrl: DEFAULT_GOOGLE_SCRIPT_URL || ''
  };

  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      settings = { ...settings, ...parsed };
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
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback to initial
  }
  return [];
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
