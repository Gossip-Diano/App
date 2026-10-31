import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, onSnapshot, setDoc, updateDoc, 
  deleteDoc, increment, getDocs, getDocFromServer
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Gossip, AppSettings } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Inizializzazione singleton Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/* CRITICAL: The app will break without specifying firestoreDatabaseId */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test di connessione Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    return false;
  }
}

const GOSSIPS_COLLECTION = 'gossips';
const CONFIG_COLLECTION = 'config';
const CONFIG_DOC_ID = 'main_config';

/**
 * Ascolta in tempo reale tutti i gossip con onSnapshot (stile Social Network / Live Sync)
 * Ogni modifica (nuovo gossip, voto Hipe, cancellazione) si riflette istantaneamente
 * su tutti i telefoni e computer connessi!
 */
export function subscribeToGossips(
  onUpdate: (gossips: Gossip[]) => void,
  onError?: (err: any) => void
): () => void {
  const gossipsRef = collection(db, GOSSIPS_COLLECTION);

  return onSnapshot(
    gossipsRef,
    (snapshot) => {
      const items: Gossip[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Gossip;
        items.push({
          ...data,
          id: docSnap.id
        });
      });

      // Ordina per timestamp decrescente (i più recenti in cima)
      items.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, GOSSIPS_COLLECTION);
      if (onError) onError(error);
    }
  );
}

/**
 * Ascolta in tempo reale le impostazioni globali (link WhatsApp e password)
 */
export function subscribeToConfig(
  onUpdate: (config: Partial<AppSettings>) => void
): () => void {
  const configDocRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);

  return onSnapshot(
    configDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as Partial<AppSettings>);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${CONFIG_COLLECTION}/${CONFIG_DOC_ID}`);
    }
  );
}

/**
 * Elimina tutti i vecchi gossip di esempio (g-001 ... g-010, g-pending-01) da Firestore
 */
export async function deleteAllExampleGossips(): Promise<void> {
  const exampleIds = [
    'g-001', 'g-002', 'g-003', 'g-004', 'g-005',
    'g-006', 'g-007', 'g-008', 'g-009', 'g-010', 'g-pending-01'
  ];

  try {
    for (const id of exampleIds) {
      const ref = doc(db, GOSSIPS_COLLECTION, id);
      await deleteDoc(ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, GOSSIPS_COLLECTION);
  }
}

/**
 * Elimina tutti i documenti dalla collezione gossips (Admin)
 */
export async function clearAllGossipsFromFirestore(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, GOSSIPS_COLLECTION));
    for (const docSnap of snap.docs) {
      await deleteDoc(docSnap.ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, GOSSIPS_COLLECTION);
  }
}

/**
 * Salva un nuovo gossip su Firebase
 */
export async function addGossipToFirestore(gossip: Gossip): Promise<void> {
  const path = `${GOSSIPS_COLLECTION}/${gossip.id}`;
  try {
    await setDoc(doc(db, GOSSIPS_COLLECTION, gossip.id), gossip);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Incrementa in modo atomico il voto Hipe (+1)
 */
export async function voteHipeInFirestore(gossipId: string): Promise<void> {
  const path = `${GOSSIPS_COLLECTION}/${gossipId}`;
  try {
    const ref = doc(db, GOSSIPS_COLLECTION, gossipId);
    await updateDoc(ref, {
      hipe: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Aggiorna testo o stato di un gossip (Admin)
 */
export async function updateGossipInFirestore(gossipId: string, updates: Partial<Gossip>): Promise<void> {
  const path = `${GOSSIPS_COLLECTION}/${gossipId}`;
  try {
    const ref = doc(db, GOSSIPS_COLLECTION, gossipId);
    await updateDoc(ref, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Elimina definitivamente un gossip (Admin)
 */
export async function deleteGossipFromFirestore(gossipId: string): Promise<void> {
  const path = `${GOSSIPS_COLLECTION}/${gossipId}`;
  try {
    const ref = doc(db, GOSSIPS_COLLECTION, gossipId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

/**
 * Aggiorna la configurazione dell'app (Link WhatsApp, password)
 */
export async function updateConfigInFirestore(updates: Partial<AppSettings>): Promise<void> {
  const path = `${CONFIG_COLLECTION}/${CONFIG_DOC_ID}`;
  try {
    const ref = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
    await setDoc(ref, updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}
