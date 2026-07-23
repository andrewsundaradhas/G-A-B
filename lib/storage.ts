// Session history in browser IndexedDB — no server DB (Section 3).

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Session } from "./types";

interface GaitDB extends DBSchema {
  sessions: {
    key: string;
    value: Session;
    indexes: { "by-date": number };
  };
}

let dbPromise: Promise<IDBPDatabase<GaitDB>> | null = null;

function getDB() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser.");
  }
  if (!dbPromise) {
    dbPromise = openDB<GaitDB>("ps2gat-gait", 1, {
      upgrade(db) {
        const store = db.createObjectStore("sessions", { keyPath: "id" });
        store.createIndex("by-date", "createdAt");
      },
    });
  }
  return dbPromise;
}

export async function saveSession(session: Session): Promise<void> {
  const db = await getDB();
  await db.put("sessions", session);
}

export async function listSessions(): Promise<Session[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("sessions", "by-date");
  return all.reverse(); // newest first
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("sessions", id);
}

export async function clearSessions(): Promise<void> {
  const db = await getDB();
  await db.clear("sessions");
}
