const DB_NAME = "big-file-upload-mock-db-v1";
const DB_VERSION = 1;
const STORE_CHUNKS = "upload_chunks";
const STORE_FILES = "upload_files";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_CHUNKS))
        db.createObjectStore(STORE_CHUNKS);
      if (!db.objectStoreNames.contains(STORE_FILES))
        db.createObjectStore(STORE_FILES);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function dbPut(store: string, key: string, value: unknown) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbGet<T = unknown>(
  store: string,
  key: string,
): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function dbKeys(store: string): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAllKeys();
    req.onsuccess = () => resolve(req.result as string[]);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetChunksInOrder(
  fileHash: string,
  totalChunks: number,
): Promise<Blob[]> {
  const db = await openDB();
  const result: Blob[] = [];
  for (let i = 0; i < totalChunks; i++) {
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_CHUNKS, "readonly");
      const req = tx.objectStore(STORE_CHUNKS).get(`${fileHash}_${i}`);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
    if (!blob) throw new Error(`缺少分片 ${i}`);
    result.push(blob);
  }
  return result;
}

export async function dbDeleteChunks(fileHash: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_CHUNKS, "readwrite");
    const store = tx.objectStore(STORE_CHUNKS);
    const req = store.getAllKeys();
    req.onsuccess = () => {
      const keys = req.result as string[];
      const prefix = fileHash + "_";
      keys.forEach((k) => {
        if (k.startsWith(prefix)) store.delete(k);
      });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbDeleteFile(fileHash: string) {
  await dbDeleteChunks(fileHash);
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, "readwrite");
    tx.objectStore(STORE_FILES).delete(fileHash);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export { STORE_CHUNKS, STORE_FILES };
