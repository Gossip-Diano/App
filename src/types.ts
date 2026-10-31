export type PostitColor = 'yellow' | 'pink' | 'blue' | 'green';

export interface Gossip {
  id: string;
  timestamp: string;      // ISO string e.g. "2026-10-30T10:15:00.000Z"
  displayDate: string;   // e.g. "30 Ott 2026, 11:30"
  schoolYear: string;    // e.g. "2025/2026"
  month: string;         // e.g. "Ottobre"
  author: string;        // "Anonimo 🕵️‍♂️" or real student name
  isAnonymous: boolean;
  text: string;
  hipe: number;
  status: 'Approvato' | 'In attesa' | 'Rifiutato';
  color: PostitColor;
  pinColor: string;      // '#FF0033' | '#FBBF24' | '#3B82F6' | '#10B981'
  rotation: number;      // -4 to 4 degrees for realistic post-it board look
  flaggedWords?: string[];
}

export interface AppSettings {
  whatsappLink: string;
  adminPassword: string;
  googleScriptUrl: string;
  schoolName: string;
}

export type ScreenTab = 'home' | 'feed' | 'archive';
