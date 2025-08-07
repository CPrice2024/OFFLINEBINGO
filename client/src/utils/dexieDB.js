import Dexie from "dexie";

export const db = new Dexie("BingoGameDB");

db.version(2).stores({
  offlineSummaries: "++id,isSynced",
  commissions: "++id",
  offlineBalance: "id",
  offlineNotifications: "id",
  offlineGameState: "id",
  supportCredentials: "++id,email,_id",
  
});

