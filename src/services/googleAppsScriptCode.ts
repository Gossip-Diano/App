/**
 * BACKEND GOSSIP DIANO - GOOGLE APPS SCRIPT
 * Questo codice va incollato nell'editor di Google Apps Script collegato al tuo Google Sheet:
 * 1. Apri Google Sheets -> Estensioni -> Apps Script
 * 2. Incolla questo codice dentro Code.gs (sostituendo tutto ciò che c'è già)
 * 3. Clicca su "Distribuisci" -> "Nuova distribuzione" -> Tipo: "Applicazione web"
 * 4. Descrizione: "Gossip Diano Backend v2"
 * 5. Esegui come: "Me (tua email)"
 * 6. Chi ha accesso: "Chiunque" (CRUCIALE per permettere ai telefoni e browser di connettersi)
 * 7. Copia l'URL dell'applicazione web (termina con /exec) e incollalo nelle impostazioni Admin dell'app!
 */

export const GOOGLE_APPS_SCRIPT_SOURCE = `/**
 * BACKEND GOSSIP DIANO - GOOGLE APPS SCRIPT
 * Sincronizzazione in tempo reale multi-dispositivo (iOS Safari, Android, PC, Mac)
 */

const SHEET_GOSSIP = "Gossip";
const SHEET_CONFIG = "Config";

// Inizializza automaticamente fogli e intestazioni se non esistono
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Foglio Gossip
  let gossipSheet = ss.getSheetByName(SHEET_GOSSIP);
  if (!gossipSheet) {
    const sheets = ss.getSheets();
    // Se c'è solo un foglio vuoto (es. "Foglio1" o "Sheet1"), rinominalo
    if (sheets.length === 1 && sheets[0].getLastRow() === 0) {
      gossipSheet = sheets[0];
      gossipSheet.setName(SHEET_GOSSIP);
    } else {
      gossipSheet = ss.insertSheet(SHEET_GOSSIP);
    }
  }
  if (gossipSheet.getLastRow() === 0) {
    gossipSheet.appendRow([
      "ID",
      "Data",
      "Anno Scolastico",
      "Mese",
      "Autore",
      "Testo",
      "Hipe",
      "Stato",
      "Colore"
    ]);
    gossipSheet.getRange(1, 1, 1, 9)
      .setFontWeight("bold")
      .setBackground("#FF0033")
      .setFontColor("#FFFFFF");
  }

  // 2. Foglio Configurazione
  let configSheet = ss.getSheetByName(SHEET_CONFIG);
  if (!configSheet) {
    configSheet = ss.insertSheet(SHEET_CONFIG);
  }
  if (configSheet.getLastRow() === 0) {
    configSheet.appendRow(["Chiave", "Valore", "Descrizione"]);
    configSheet.getRange(1, 1, 1, 3)
      .setFontWeight("bold")
      .setBackground("#18181b")
      .setFontColor("#FFFFFF");
    configSheet.appendRow(["whatsappLink", "https://chat.whatsapp.com/GossipDianoOfficial", "Link del gruppo WhatsApp ufficiale"]);
    configSheet.appendRow(["adminPassword", "diano2026", "Password per sbloccare il pannello Admin segreto"]);
    configSheet.appendRow(["schoolName", "Gossip Diano", "Nome della scuola / community"]);
  }
}

// GET: Lettura dati e supporto azioni via query params (senza blocchi CORS su Safari/Chrome)
function doGet(e) {
  setupSheets();
  const params = (e && e.parameter) ? e.parameter : {};

  // Se c'è un'azione nei parametri, eseguila (supporto universale cross-browser)
  if (params.action) {
    return handleAllActions(params);
  }

  return fetchAllData();
}

// POST: Supporto scrittura dati standard
function doPost(e) {
  setupSheets();
  let payload = {};
  try {
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }
  } catch (err) {
    payload = e.parameter || {};
  }

  return handleAllActions(payload);
}

// Ritorna tutti i gossip e le impostazioni
function fetchAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Leggi Config
  const configSheet = ss.getSheetByName(SHEET_CONFIG);
  const configData = configSheet ? configSheet.getDataRange().getValues() : [];
  const config = {
    whatsappLink: "https://chat.whatsapp.com/GossipDianoOfficial",
    adminPassword: "diano2026",
    schoolName: "Gossip Diano"
  };
  
  if (configData.length > 1) {
    for (let i = 1; i < configData.length; i++) {
      const key = configData[i][0];
      const val = configData[i][1];
      if (key && val) {
        config[key] = String(val);
      }
    }
  }

  // Leggi Gossip
  const gossipSheet = ss.getSheetByName(SHEET_GOSSIP);
  const rows = gossipSheet ? gossipSheet.getDataRange().getValues() : [];
  const gossips = [];
  
  if (rows.length > 1) {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      gossips.push({
        id: String(row[0]),
        timestamp: String(row[1] || new Date().toISOString()),
        schoolYear: String(row[2] || "2025/2026"),
        month: String(row[3] || "Ottobre"),
        author: String(row[4] || "Anonimo 🕵️‍♂️"),
        isAnonymous: String(row[4] || "").toLowerCase().includes("anonimo"),
        text: String(row[5] || ""),
        hipe: Number(row[6]) || 0,
        status: String(row[7] || "Approvato"),
        color: String(row[8] || "yellow"),
        displayDate: String(row[1] || "")
      });
    }
  }

  return respondJson({
    success: true,
    connected: true,
    totalGossips: gossips.length,
    config: config,
    gossips: gossips
  });
}

// Gestore universale delle azioni di scrittura e aggiornamento
function handleAllActions(payload) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const gossipSheet = ss.getSheetByName(SHEET_GOSSIP);
    const configSheet = ss.getSheetByName(SHEET_CONFIG);

    // 0. TEST CONNESSIONE (PING)
    if (action === "ping") {
      const rows = gossipSheet ? gossipSheet.getDataRange().getValues() : [];
      const total = Math.max(0, rows.length - 1);
      return respondJson({
        success: true,
        message: "Connessione a Google Sheets attiva!",
        totalGossips: total
      });
    }

    // 1. NUOVO GOSSIP
    if (action === "addGossip") {
      let g = payload.gossip;
      if (typeof g === "string") {
        try { g = JSON.parse(g); } catch(e) {}
      }
      if (!g || !g.id) {
        return respondJson({ success: false, error: "Dati gossip mancanti" });
      }

      // Verifica che non sia già presente per evitare duplicati
      const rows = gossipSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(g.id)) {
          return respondJson({ success: true, message: "Gossip già presente" });
        }
      }

      gossipSheet.appendRow([
        g.id,
        g.displayDate || g.timestamp || new Date().toLocaleString("it-IT"),
        g.schoolYear || "2025/2026",
        g.month || "Ottobre",
        g.author || "Anonimo 🕵️‍♂️",
        g.text || "",
        (g.hipe !== undefined && g.hipe !== null) ? Number(g.hipe) : 1,
        g.status || "Approvato",
        g.color || "yellow"
      ]);
      return respondJson({ success: true, message: "Gossip salvato nel Google Sheet" });
    }

    // 2. VOTO HIPE (+1)
    if (action === "voteHipe") {
      const id = String(payload.id);
      const rows = gossipSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === id) {
          const currentHipe = Number(rows[i][6]) || 0;
          const newHipe = currentHipe + 1;
          gossipSheet.getRange(i + 1, 7).setValue(newHipe);
          return respondJson({ success: true, newHipe: newHipe });
        }
      }
      return respondJson({ success: false, error: "ID non trovato" });
    }

    // 3. AGGIORNA STATO O TESTO (ADMIN)
    if (action === "updateGossip") {
      const id = String(payload.id);
      let updates = payload.updates || {};
      if (typeof updates === "string") {
        try { updates = JSON.parse(updates); } catch(e) {}
      }
      const rows = gossipSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === id) {
          if (updates.text !== undefined) gossipSheet.getRange(i + 1, 6).setValue(updates.text);
          if (updates.status !== undefined) gossipSheet.getRange(i + 1, 8).setValue(updates.status);
          if (updates.hipe !== undefined) gossipSheet.getRange(i + 1, 7).setValue(updates.hipe);
          return respondJson({ success: true, message: "Gossip aggiornato" });
        }
      }
      return respondJson({ success: false, error: "Gossip non trovato" });
    }

    // 4. ELIMINA GOSSIP (ADMIN)
    if (action === "deleteGossip") {
      const id = String(payload.id);
      const rows = gossipSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === id) {
          gossipSheet.deleteRow(i + 1);
          return respondJson({ success: true, message: "Gossip eliminato" });
        }
      }
      return respondJson({ success: false, error: "Gossip non trovato" });
    }

    // 5. CARICAMENTO MASSIVO / SINCRONIZZAZIONE INIZIALE
    if (action === "bulkUpload") {
      let list = payload.gossips;
      if (typeof list === "string") {
        try { list = JSON.parse(list); } catch(e) {}
      }
      if (Array.isArray(list)) {
        const rows = gossipSheet.getDataRange().getValues();
        const existingIds = new Set(rows.map(r => String(r[0])));
        let addedCount = 0;
        
        list.forEach(g => {
          if (!existingIds.has(String(g.id))) {
            gossipSheet.appendRow([
              g.id,
              g.displayDate || g.timestamp || new Date().toLocaleString("it-IT"),
              g.schoolYear || "2025/2026",
              g.month || "Ottobre",
              g.author || "Anonimo 🕵️‍♂️",
              g.text || "",
              (g.hipe !== undefined && g.hipe !== null) ? Number(g.hipe) : 1,
              g.status || "Approvato",
              g.color || "yellow"
            ]);
            existingIds.add(String(g.id));
            addedCount++;
          }
        });
        return respondJson({ success: true, message: addedCount + " gossip aggiunti al Google Sheet", added: addedCount });
      }
      return respondJson({ success: false, error: "Formato gossip non valido" });
    }

    // 6. AGGIORNA CONFIGURAZIONE (WhatsApp link o Password)
    if (action === "updateConfig") {
      const key = payload.key;
      const value = String(payload.value);
      const rows = configSheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === key) {
          configSheet.getRange(i + 1, 2).setValue(value);
          found = true;
          break;
        }
      }
      if (!found) {
        configSheet.appendRow([key, value, "Impostazione personalizzata"]);
      }
      return respondJson({ success: true, message: "Configurazione salvata nel foglio" });
    }

    return respondJson({ success: false, error: "Azione non riconosciuta" });

  } catch (err) {
    return respondJson({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function respondJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
