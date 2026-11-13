// Firebase Application & Firestore Cloud Persistence Layer
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  enableIndexedDbPersistence 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// User's Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyArLeaAlfRw6QerRYcKVFxVY7sihORvE_M",
  authDomain: "momo-8cac5.firebaseapp.com",
  projectId: "momo-8cac5",
  storageBucket: "momo-8cac5.firebasestorage.app",
  messagingSenderId: "1003020115932",
  appId: "1:1003020115932:web:2d73a91312fae3e77df919",
  measurementId: "G-SPS58N6F7M"
};

let app = null;
let db = null;
let syncStatus = {
  connected: false,
  statusText: 'جارِ التهيئة...',
  lastSync: null,
  error: null
};

export function initFirebase() {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    syncStatus.connected = true;
    syncStatus.statusText = 'متصل بالسحابة (Firebase)';
    syncStatus.lastSync = new Date();
    emitStatus();
    console.log("Firebase initialized successfully on project:", firebaseConfig.projectId);
  } catch (err) {
    console.warn("Firebase initialization warning (falling back to offline local storage):", err);
    syncStatus.connected = false;
    syncStatus.statusText = 'حفظ محلي (LocalStorage)';
    syncStatus.error = err.message;
    emitStatus();
  }
}

function emitStatus() {
  window.dispatchEvent(new CustomEvent('firebase-sync-status', { detail: { ...syncStatus } }));
}

export function getSyncStatus() {
  return { ...syncStatus };
}

// Save or Update a Document in Firestore
export async function cloudSave(collectionName, docId, data) {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    syncStatus.connected = true;
    syncStatus.statusText = 'متزامن مع Firebase';
    syncStatus.lastSync = new Date();
    syncStatus.error = null;
    emitStatus();
    return true;
  } catch (err) {
    console.warn(`Firestore save error in ${collectionName}/${docId}:`, err);
    syncStatus.connected = false;
    syncStatus.statusText = 'حفظ محلي (تنبيه سحابي)';
    syncStatus.error = err.message;
    emitStatus();
    return false;
  }
}

// Delete Document from Firestore
export async function cloudDelete(collectionName, docId) {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
    syncStatus.connected = true;
    syncStatus.statusText = 'متزامن مع Firebase';
    syncStatus.lastSync = new Date();
    emitStatus();
    return true;
  } catch (err) {
    console.warn(`Firestore delete error in ${collectionName}/${docId}:`, err);
    return false;
  }
}

// Fetch all documents in a collection
export async function cloudFetchCollection(collectionName) {
  if (!db) return null;
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const items = [];
    snap.forEach((d) => {
      items.push({ id: d.id, ...d.data() });
    });
    return items;
  } catch (err) {
    console.warn(`Firestore fetch error in ${collectionName}:`, err);
    return null;
  }
}
