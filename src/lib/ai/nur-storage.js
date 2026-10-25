/**
 * Nur AI Client-Side Storage Engine (IndexedDB & PWA Offline Cache)
 * Provides local resilience for Quran Mushaf, audio clips, and offline student sessions.
 */

const DB_NAME = "NurQuranTutorDB";
const DB_VERSION = 1;

const STORES = {
  MUSHAF: "mushaf_cache",
  AUDIO: "audio_cache",
  OFFLINE_SESSIONS: "offline_sessions",
  MEMORY: "student_memory_cache"
};

class NurStorageEngine {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async getDB() {
    if (typeof window === "undefined") return null;
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Mushaf Cache (Key: `${surah}:${ayah}`)
        if (!db.objectStoreNames.contains(STORES.MUSHAF)) {
          db.createObjectStore(STORES.MUSHAF, { keyPath: "key" });
        }

        // 2. Audio Cache (Key: audio_hash or URL)
        if (!db.objectStoreNames.contains(STORES.AUDIO)) {
          db.createObjectStore(STORES.AUDIO, { keyPath: "id" });
        }

        // 3. Offline Unsynced Sessions
        if (!db.objectStoreNames.contains(STORES.OFFLINE_SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.OFFLINE_SESSIONS, {
            keyPath: "id",
            autoIncrement: true
          });
          sessionStore.createIndex("synced", "synced", { unique: false });
        }

        // 4. Student Local Memory Profile Cache
        if (!db.objectStoreNames.contains(STORES.MEMORY)) {
          db.createObjectStore(STORES.MEMORY, { keyPath: "studentId" });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn("NurStorageEngine IndexedDB error:", event.target.error);
        resolve(null); // gracefully degrade to in-memory/localStorage
      };
    });

    return this.initPromise;
  }

  // --- Mushaf Cache ---
  async getAyah(surah, ayah) {
    const db = await this.getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.MUSHAF, "readonly");
        const store = tx.objectStore(STORES.MUSHAF);
        const req = store.get(`${surah}:${ayah}`);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async saveAyah(surah, ayah, data) {
    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.MUSHAF, "readwrite");
        const store = tx.objectStore(STORES.MUSHAF);
        store.put({ key: `${surah}:${ayah}`, surah, ayah, ...data });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  // --- Offline Session Queue ---
  async queueOfflineRecitation(record) {
    const db = await this.getDB();
    if (!db) {
      // Fallback to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("nur_offline_queue") || "[]");
        existing.push({ ...record, id: Date.now(), synced: false });
        localStorage.setItem("nur_offline_queue", JSON.stringify(existing));
        return true;
      } catch {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.OFFLINE_SESSIONS, "readwrite");
        const store = tx.objectStore(STORES.OFFLINE_SESSIONS);
        store.add({ ...record, synced: false, timestamp: new Date().toISOString() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async getUnsyncedSessions() {
    const db = await this.getDB();
    if (!db) {
      try {
        return JSON.parse(localStorage.getItem("nur_offline_queue") || "[]");
      } catch {
        return [];
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.OFFLINE_SESSIONS, "readonly");
        const store = tx.objectStore(STORES.OFFLINE_SESSIONS);
        const index = store.index("synced");
        const req = index.getAll(false);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  async markSessionSynced(id) {
    const db = await this.getDB();
    if (!db) {
      try {
        const existing = JSON.parse(localStorage.getItem("nur_offline_queue") || "[]");
        const updated = existing.filter((item) => item.id !== id);
        localStorage.setItem("nur_offline_queue", JSON.stringify(updated));
        return true;
      } catch {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.OFFLINE_SESSIONS, "readwrite");
        const store = tx.objectStore(STORES.OFFLINE_SESSIONS);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  // --- Student Memory Profile ---
  async getStudentMemory(studentId) {
    const db = await this.getDB();
    if (!db) {
      try {
        return JSON.parse(localStorage.getItem(`nur_memory_${studentId}`) || "null");
      } catch {
        return null;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.MEMORY, "readonly");
        const store = tx.objectStore(STORES.MEMORY);
        const req = store.get(studentId);
        req.onsuccess = () => resolve(req.result?.data || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async setStudentMemory(studentId, data) {
    const db = await this.getDB();
    if (!db) {
      try {
        localStorage.setItem(`nur_memory_${studentId}`, JSON.stringify(data));
        return true;
      } catch {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.MEMORY, "readwrite");
        const store = tx.objectStore(STORES.MEMORY);
        store.put({ studentId, data, updatedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }
}

export const nurStorage = new NurStorageEngine();
