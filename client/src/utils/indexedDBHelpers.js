import { openDB } from 'idb';

let dbPromise;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB('BingoGameDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cachedSupport')) {
          db.createObjectStore('cachedSupport', { keyPath: 'email' });
        }
      },
    });
  }
  return dbPromise;
};

export const saveSupportCredentials = async (email, password) => {
  const db = await initDB();
  await db.put('cachedSupport', { email, password });
};

export const getSupportCredentials = async (email) => {
  const db = await initDB();
  return await db.get('cachedSupport', email);
};
