// utils/indexedDB.js
import { openDB } from 'idb';

let dbPromise;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB('BingoGameDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('offlineGameState')) {
          db.createObjectStore('offlineGameState', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('offlineBalance')) {
          db.createObjectStore('offlineBalance', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('commissions')) {
          db.createObjectStore('commissions', { autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('gameSummaries')) {
          db.createObjectStore('gameSummaries', { autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('offlineNotifications')) {
          db.createObjectStore('offlineNotifications', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cachedSupport')) {
          db.createObjectStore('cachedSupport', { keyPath: 'email' });
        }
      },
    });
  }

  return dbPromise;
};

const getDB = async () => {
  return await initDB();
};

//
// 🔐 Save and Get Support Credentials
//
export const saveGameState = async (state) => {
  try {
    const db = await getDB();
    const tx = db.transaction('offlineGameState', 'readwrite');
    await tx.objectStore('offlineGameState').put(state);
    await tx.done;
  } catch (error) {
    console.error("❌ Failed to save game state:", error);
  }
};

export const loadGameState = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction('offlineGameState', 'readonly');
    const result = await tx.objectStore('offlineGameState').get(id);
    await tx.done;
    return result || null;
  } catch (error) {
    console.error("❌ Failed to load game state:", error);
    return null;
  }
};

export const saveSupportCredentials = async (user) => {
  try {
    if (!user || !user._id || !user.email) {
      console.warn("⚠️ Incomplete user data. Skipping save.");
      return;
    }

    const db = await getDB();
    const tx = db.transaction('cachedSupport', 'readwrite');
    await tx.objectStore('cachedSupport').put({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password, // optional: only if needed offline
    });
    await tx.done;

    console.log("✅ Support credentials cached offline");
  } catch (error) {
    console.error("❌ Error saving support credentials:", error);
  }
};

export const getSupportCredentials = async (email) => {
  try {
    const db = await getDB();
    const tx = db.transaction('cachedSupport', 'readonly');
    const result = await tx.objectStore('cachedSupport').get(email);
    await tx.done;

    return result || null;
  } catch (error) {
    console.error("❌ Error getting support credentials:", error);
    return null;
  }
};

//
// 💰 Offline Balance
//
export const saveOfflineBalance = async (id, balance) => {
  try {
    const db = await getDB();
    const tx = db.transaction('offlineBalance', 'readwrite');
    await tx.objectStore('offlineBalance').put({ id, balance });
    await tx.done;
  } catch (error) {
    console.error("❌ Failed to save offline balance:", error);
  }
};

export const getOfflineBalance = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction('offlineBalance', 'readonly');
    const result = await tx.objectStore('offlineBalance').get(id);
    await tx.done;
    return result?.balance ?? null;
  } catch (error) {
    console.error("❌ Failed to get offline balance:", error);
    return null;
  }
};

//
// 🔔 Notifications (Offline Mode)
//
export const saveOfflineNotification = async (notification) => {
  try {
    const db = await getDB();
    const tx = db.transaction('offlineNotifications', 'readwrite');
    await tx.objectStore('offlineNotifications').put(notification);
    await tx.done;
  } catch (error) {
    console.error("❌ Failed to save offline notification:", error);
  }
};

export const getAllOfflineNotifications = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction('offlineNotifications', 'readonly');
    const all = await tx.objectStore('offlineNotifications').getAll();
    await tx.done;
    return all;
  } catch (error) {
    console.error("❌ Failed to fetch offline notifications:", error);
    return [];
  }
};

export const clearOfflineNotifications = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction('offlineNotifications', 'readwrite');
    await tx.objectStore('offlineNotifications').clear();
    await tx.done;
  } catch (error) {
    console.error("❌ Failed to clear offline notifications:", error);
  }
};

//
// 💼 Commissions (Offline Saved Games)
//
export const saveCommission = async (commission) => {
  try {
    const db = await getDB();
    const tx = db.transaction('commissions', 'readwrite');
    await tx.objectStore('commissions').add(commission);
    await tx.done;
  } catch (error) {
    console.error("❌ Failed to save commission:", error);
  }
};

export const getAllCommissions = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction('commissions', 'readonly');
    const all = await tx.objectStore('commissions').getAll();
    await tx.done;
    return all;
  } catch (error) {
    console.error("❌ Failed to fetch commissions:", error);
    return [];
  }
};

export const clearAllCommissions = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction('commissions', 'readwrite');
    await tx.objectStore('commissions').clear();
    await tx.done;
  } catch (error) {
    console.error("❌ Failed to clear commissions:", error);
  }
};

//
// 🧾 Game Summaries (Offline Support Results)
//
export const saveGameSummary = async (summary) => {
  try {
    const db = await getDB();
    const tx = db.transaction('gameSummaries', 'readwrite');
    await tx.objectStore('gameSummaries').add(summary);
    await tx.done;
  } catch (error) {
    console.error("❌ Failed to save game summary:", error);
  }
};

export const getAllGameSummaries = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction('gameSummaries', 'readonly');
    const all = await tx.objectStore('gameSummaries').getAll();
    await tx.done;
    return all;
  } catch (error) {
    console.error("❌ Failed to fetch game summaries:", error);
    return [];
  }
};

export const clearAllGameSummaries = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction('gameSummaries', 'readwrite');
    await tx.objectStore('gameSummaries').clear();
    await tx.done;
  } catch (error) {
    console.error("❌ Failed to clear game summaries:", error);
  }
};
