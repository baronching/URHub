// IndexedDB utility for persisting and retrieving original submitted PDF manuscripts
const DB_NAME = 'UDM_ResearchHub_PDF_Store';
const DB_VERSION = 1;
const STORE_NAME = 'manuscripts';

function openPdfDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an original uploaded PDF File or Blob into IndexedDB
 */
export async function saveOriginalPdf(key: string, fileOrBlob: Blob | File): Promise<void> {
  if (!key) return;
  try {
    const db = await openPdfDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fileOrBlob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[pdfStorage] Failed to save PDF to IndexedDB:', err);
  }
}

/**
 * Retrieve an original uploaded PDF Blob from IndexedDB
 */
export async function getOriginalPdf(key: string): Promise<Blob | null> {
  if (!key) return null;
  try {
    const db = await openPdfDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[pdfStorage] Failed to retrieve PDF from IndexedDB:', err);
    return null;
  }
}

/**
 * Attempt to retrieve an original PDF using a priority list of identifiers
 * Returns a live blob: URL if found, or null
 */
export async function getOriginalPdfUrl(candidateKeys: (string | undefined | null)[]): Promise<string | null> {
  for (const key of candidateKeys) {
    if (!key) continue;
    const blob = await getOriginalPdf(key);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  }
  return null;
}
