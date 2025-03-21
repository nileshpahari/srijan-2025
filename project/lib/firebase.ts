import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA-lAjkDNCO1G4orUHLdfnjP7WB2IGMJpk",
  authDomain: "skillsync-63e31.firebaseapp.com",
  projectId: "skillsync-63e31",
  storageBucket: "skillsync-63e31.firebasestorage.app",
  messagingSenderId: "78965663048",
  appId: "1:78965663048:web:a4199be1e1b255dc87ff7d",
  measurementId: "G-RSGTCJ4PKJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics and export it
export const initializeAnalytics = async () => {
  const analyticsSupported = await isSupported();
  if (analyticsSupported) {
    return getAnalytics(app);
  }
  return null;
};