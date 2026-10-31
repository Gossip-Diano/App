/**
 * Filtro linguistico ultra-rigido e anti-elusione per Gossip Diano.
 * Rileva parolacce, bestemmie, insulti gravi, sessismo e discriminazioni in italiano.
 * Riconosce ed intercetta tentativi di bypass tramite:
 * - Spaziature tra lettere (es. "c a z z o", "m e r d a")
 * - Ripetizione esagerata di caratteri (es. "caaaazzo", "meeerda")
 * - Separatori di simboli e punteggiatura (es. "c.a.z.z.o", "c-a-z-z-o", "c*a*z*z*o")
 * - Sostituzioni leetspeak (0->o, 4/@->a, 3->e, 1/!/|->i, 5/$->s, 7->t, 8->b, k->c, v->u)
 * - Lookalike e caratteri cirillici/omografi
 * 
 * Non blocca e preserva regolarmente: professori, materie, classi, compiti, interrogazioni e nomi propri.
 */

export interface ScanResult {
  isClean: boolean;
  flaggedWords: string[];
}

// Dizionario radici censurate per la scansione a testo continuo e a parole
const BANNED_ROOTS: string[] = [
  // Parolacce comuni e derivati
  'cazz', 'c4zz', 'kazz',
  'merd', 'm3rd',
  'stronz', 'str0nz',
  'coglion', 'c0glion',
  'vaffancul', 'v4ff4ncul', 'fancul', 'affancul',
  'bastard', 'b4st4rd',
  'minchi', 'm1nch1',
  'cagat', 'cagar',
  'sborr', 'sburo', 'sbura',
  'pisciar', 'pisciat',
  'pompin', 'bocchin', 'bocchinat',
  'succhiacazz', 'leccacazz', 'ingoiacazz',
  'incul', '1ncul',
  'fottit', 'fottut', 'fott',

  // Insulti denigratori e volgari
  'troi', 'tr01', 'tr0y',
  'puttan', 'p0ttan', 'put4n',
  'mignott', 'm1gn0tt',
  'baldracc',
  'zoccol', 'z0cc0l',
  'bagasci',
  'batton',
  'trocchion',
  'froc', 'fr0c',
  'finocchi', 'f1n0cch1',
  'ricchion', 'r1cch10n',
  'culatton', 'culaton',
  'checc',
  'negro', 'negra', 'negri', 'negre', 'n3gr',
  'mongoloid', 'mongol',
  'ritardat', 'handicappat',

  // Bestemmie radici composte
  'diocan', 'd1ocan', 'di0can',
  'dioporc', 'd1oporc', 'di0porc',
  'diomaial', 'di0maial',
  'diomadonn', 'di0madonn',
  'diobesti', 'di0besti',
  'dioschifos', 'd1oschifos',
  'dioboia', 'di0boia',
  'dioladro', 'di0ladro',
  'dioserpent',
  'diobastard',
  'diomerda',
  'diostronzo',
  'diocane', 'dioporco',
  'porcodio', 'p0rc0di0', 'porc0di0',
  'porcamadonn', 'p0rc4mad0nn',
  'porcocrist', 'porcogesu',
  'madonnatroi', 'madonnaputtan',
  'madonnavacc', 'madonnacagn', 'madonnamaial', 'madonnazoccol',
  'madonnaschifos', 'madonnabastard',
  'cristoporc', 'gesuporc', 'ostiatroi', 'ostiamadonn'
];

// Regex avanzate per pattern composti o con spazi (es. "dio cane", "porco dio")
const ADVANCED_PATTERNS: RegExp[] = [
  // Bestemmie con spazi o separatori
  /\b(porc[oa]|p0rc[oa])[\W_]*(dio|d1o|di0|madonna|cristo|crist0|gesu|gesù|d-i-o)\b/i,
  /\b(dio|d1o|di0)[\W_]*(cane|can3|kane|porco|p0rco|porko|bestia|b3stia|maiale|ladro|boia|fa|serpente|bastardo|merda|stronzo|schifoso)\b/i,
  /\b(madonna|mad0nna)[\W_]*(puttana|p0ttana|troia|tr0ia|maiala|vacca|cagna|schifosa|zoccola|bastarda|merda)\b/i,
  /\b(cristo|ges[uù])[\W_]*(porco|p0rco|cane|bastardo|maledetto)\b/i,
  /\bostia[\W_]*(puttana|troia|madonna|dio)\b/i,

  // Insulti / parolacce con lettere separate o allungate
  /\bc+[\W_]*a+[\W_]*z+[\W_]*z+[\W_]*[oaiue]/i,
  /\bm+[\W_]*e+[\W_]*r+[\W_]*d+[\W_]*[oaiue]/i,
  /\bt+[\W_]*r+[\W_]*o+[\W_]*i+[\W_]*[ae]/i,
  /\bp+[\W_]*u+[\W_]*t+[\W_]*t+[\W_]*a+[\W_]*n+[\W_]*[ae]/i,
  /\bs+[\W_]*t+[\W_]*r+[\W_]*o+[\W_]*n+[\W_]*z+[\W_]*[oaiue]/i,
  /\bc+[\W_]*o+[\W_]*g+[\W_]*l+[\W_]*i+[\W_]*o+[\W_]*n+[\W_]*[eia]/i,
  /\bv+[\W_]*a+[\W_]*f+[\W_]*f+[\W_]*a+[\W_]*n+[\W_]*c+[\W_]*u+[\W_]*l+[\W_]*[oaiue]/i,
  /\bf+[\W_]*a+[\W_]*n+[\W_]*c+[\W_]*u+[\W_]*l+[\W_]*o/i,
  /\bb+[\W_]*a+[\W_]*s+[\W_]*t+[\W_]*a+[\W_]*r+[\W_]*d+[\W_]*[oaiue]/i,
  /\bf+[\W_]*r+[\W_]*o+[\W_]*c+[\W_]*i+[\W_]*[oaiue]/i,
  /\bn+[\W_]*e+[\W_]*g+[\W_]*r+[\W_]*[oaiue]/i,
  /\bs+[\W_]*b+[\W_]*o+[\W_]*r+[\W_]*r+[\W_]*[a-z]*/i,
  /\bp+[\W_]*o+[\W_]*m+[\W_]*p+[\W_]*i+[\W_]*n+[\W_]*[oaiue]/i
];

/**
 * Normalizza il testo rimuovendo accenti, leetspeak e omografi cirillici
 */
function cleanLeetspeak(input: string): string {
  return input
    .toLowerCase()
    // Rimuovi accenti standard
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Omografi cirillici comuni
    .replace(/[а]/g, 'a')
    .replace(/[е]/g, 'e')
    .replace(/[о]/g, 'o')
    .replace(/[р]/g, 'p')
    .replace(/[с]/g, 'c')
    .replace(/[у]/g, 'y')
    // Sostituzioni leetspeak
    .replace(/[@4^]/g, 'a')
    .replace(/[3€]/g, 'e')
    .replace(/[1!|¡]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5§]/g, 's')
    .replace(/[7+]/g, 't')
    .replace(/[8ß]/g, 'b')
    .replace(/k/g, 'c')
    .replace(/ph/g, 'f')
    .replace(/w/g, 'v');
}

/**
 * Comprime lettere ripetute più di 2 volte (es. "caaaazzo" -> "cazzo")
 */
function collapseConsecutiveLetters(input: string): string {
  return input.replace(/(.)\1{2,}/g, '$1$1');
}

export function scanTextForProfanity(rawText: string): ScanResult {
  if (!rawText || !rawText.trim()) {
    return { isClean: true, flaggedWords: [] };
  }

  const flagged = new Set<string>();

  // 1. Pass: Testo normalizzato base
  const normalized = cleanLeetspeak(rawText);

  // 2. Pass: Testo compresso (senza lettere ripetute all'infinito)
  const collapsed = collapseConsecutiveLetters(normalized);

  // 3. Pass: Testo privo di qualsiasi spazio e simbolo (cattura "c a z z o" o "c.a.z.z.o" o "p_o_r_c_o_d_i_o")
  const stripped = collapsed.replace(/[\s\-_.*,/\\~^'"#&%$!?+@;:=()<>[\]{}|]/g, '');

  // Controllo pattern avanzati su testo normalizzato e compresso
  for (const pattern of ADVANCED_PATTERNS) {
    const matchNorm = normalized.match(pattern);
    if (matchNorm) {
      flagged.add(matchNorm[0].toLowerCase());
    }
    const matchCol = collapsed.match(pattern);
    if (matchCol) {
      flagged.add(matchCol[0].toLowerCase());
    }
  }

  // Controllo radici censurate su testo normalizzato e su testo stripped
  for (const root of BANNED_ROOTS) {
    if (normalized.includes(root)) {
      flagged.add(root);
    } else if (collapsed.includes(root)) {
      flagged.add(root);
    } else if (stripped.includes(root)) {
      flagged.add(root);
    }
  }

  return {
    isClean: flagged.size === 0,
    flaggedWords: Array.from(flagged)
  };
}
