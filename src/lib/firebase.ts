import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';

export interface ScoreRecord {
  id?: string;
  name: string;
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  lang: 'mn' | 'en';
  timestamp: string; // ISO string
}

let firebaseApp: any = null;
let firestoreDb: any = null;
let isFirebaseActive = false;

// Attempt to detect Firebase configuration from window or environment
const loadFirebase = async () => {
  try {
    // 1. Try to fetch the config file if it exists in the public path
    const response = await fetch('/firebase-applet-config.json').catch(() => null);
    let config = null;
    
    if (response && response.ok) {
      config = await response.json();
    } else {
      // 2. Try to fallback to VITE environment variables if set
      const metaEnv = (import.meta as any).env || {};
      const apiKey = metaEnv.VITE_FIREBASE_API_KEY;
      if (apiKey) {
        config = {
          apiKey: metaEnv.VITE_FIREBASE_API_KEY,
          authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
          storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: metaEnv.VITE_FIREBASE_APP_ID
        };
      }
    }

    if (config && config.apiKey && config.projectId) {
      if (!getApps().length) {
        firebaseApp = initializeApp(config);
      } else {
        firebaseApp = getApp();
      }
      firestoreDb = getFirestore(firebaseApp);
      isFirebaseActive = true;
      console.log('Firebase Firestore initialized successfully.');
    } else {
      console.warn('Firebase configuration not found. Running in Local Storage simulation mode.');
    }
  } catch (error) {
    console.error('Error checking or initializing Firebase:', error);
  }
};

// Immediately invoke loader
loadFirebase();

export function isCloudSyncEnabled(): boolean {
  return isFirebaseActive && firestoreDb !== null;
}

// Save score record
export async function saveScore(score: Omit<ScoreRecord, 'id' | 'timestamp'>): Promise<{ success: boolean; id: string; source: 'cloud' | 'local' }> {
  const timestampIso = new Date().toISOString();
  
  if (isCloudSyncEnabled()) {
    try {
      const scoresCol = collection(firestoreDb, 'typeracer_scores');
      const docRef = await addDoc(scoresCol, {
        ...score,
        // Ensure wpm and accuracy are saved as numbers/integers
        wpm: Math.round(score.wpm),
        accuracy: Math.round(score.accuracy),
        errors: Math.round(score.errors),
        timeElapsed: Number(score.timeElapsed.toFixed(2)),
        timestamp: timestampIso
      });
      return { success: true, id: docRef.id, source: 'cloud' };
    } catch (e) {
      console.error('Error saving to cloud Firestore:', e);
      // Fallback to local on error
    }
  }

  // Local storage save logic fallback
  const localScores = getLocalScores();
  const newScore: ScoreRecord = {
    ...score,
    id: 'local_' + Math.random().toString(36).substr(2, 9),
    timestamp: timestampIso
  };
  
  localScores.push(newScore);
  localStorage.setItem('typeracer_local_scores', JSON.stringify(localScores));
  return { success: true, id: newScore.id!, source: 'local' };
}

// Get Top 10 scores
export async function getTopScores(lang: 'mn' | 'en'): Promise<ScoreRecord[]> {
  if (isCloudSyncEnabled()) {
    try {
      const scoresCol = collection(firestoreDb, 'typeracer_scores');
      // Create Firestore query: filter by language, order by WPM desc, limit to 10
      const q = query(
        scoresCol,
        where('lang', '==', lang),
        orderBy('wpm', 'desc'),
        orderBy('accuracy', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const results: ScoreRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          name: data.name || 'Anonymous',
          wpm: data.wpm || 0,
          accuracy: data.accuracy || 100,
          errors: data.errors || 0,
          timeElapsed: data.timeElapsed || 0,
          lang: data.lang || lang,
          timestamp: data.timestamp || new Date().toISOString()
        });
      });
      return results;
    } catch (e) {
      console.error('Failed to fetch from cloud Firestore, falling back to local scores:', e);
    }
  }

  // Local storage fetch logic fallback
  const allLocal = getLocalScores();
  // Filter by language, sort by WPM desc, then accuracy desc
  const filtered = allLocal.filter(s => s.lang === lang);
  filtered.sort((a, b) => {
    if (b.wpm !== a.wpm) {
      return b.wpm - a.wpm;
    }
    return b.accuracy - a.accuracy;
  });
  
  return filtered.slice(0, 10);
}

// Helper to get local scores safely
function getLocalScores(): ScoreRecord[] {
  try {
    const data = localStorage.getItem('typeracer_local_scores');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading local scores:', e);
  }
  
  // Provide some default dummy high scores for the initial list so it doesn't look empty
  const defaultScores: ScoreRecord[] = [
    { id: 'def_1', name: 'Bat-Erdene ⚡', wpm: 88, accuracy: 98, errors: 2, timeElapsed: 22.4, lang: 'mn', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'def_2', name: 'Anujin 🏎️', wpm: 74, accuracy: 97, errors: 3, timeElapsed: 26.1, lang: 'mn', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: 'def_3', name: 'Gantulga 🤖', wpm: 65, accuracy: 95, errors: 5, timeElapsed: 31.8, lang: 'mn', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
    { id: 'def_4', name: 'Saruul ✨', wpm: 58, accuracy: 99, errors: 1, timeElapsed: 35.0, lang: 'mn', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
    
    { id: 'def_5', name: 'TypingPro ⚡', wpm: 92, accuracy: 99, errors: 1, timeElapsed: 20.2, lang: 'en', timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
    { id: 'def_6', name: 'Speedy Racer', wpm: 81, accuracy: 96, errors: 4, timeElapsed: 24.5, lang: 'en', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
    { id: 'def_7', name: 'Keyboard Cat 🐱', wpm: 60, accuracy: 94, errors: 6, timeElapsed: 32.1, lang: 'en', timestamp: new Date(Date.now() - 3600000 * 10).toISOString() }
  ];
  
  localStorage.setItem('typeracer_local_scores', JSON.stringify(defaultScores));
  return defaultScores;
}
