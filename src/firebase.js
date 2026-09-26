/**
 * Firebase client-side initialisation.
 * All credentials are public web-app config — safe for the browser bundle.
 * Sensitive server secrets (API keys) are never stored here.
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC2i49Z5V7U1BsN5mpsxHVPq5mREmmrzWU',
  authDomain: 'lex-ai-53f88.firebaseapp.com',
  projectId: 'lex-ai-53f88',
  storageBucket: 'lex-ai-53f88.firebasestorage.app',
  messagingSenderId: '959583049590',
  appId: '1:959583049590:web:f96ff636cb06db5dfb8c57',
  measurementId: 'G-7FHG1YXKQ8',
};

// Guard against double-initialisation in hot-reload environments
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
