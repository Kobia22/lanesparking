// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmNIOnMHl0zdF6VV1q8VUB1fjoqAI_S5I",
  authDomain: "lanesparking.firebaseapp.com",
  projectId: "lanesparking",
  storageBucket: "lanesparking.firebasestorage.app",
  messagingSenderId: "1052301765341",
  appId: "1:1052301765341:web:cdd5f4ecd3afdb197d8934",
  measurementId: "G-BYNY9QHJNC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase Auth (default web persistence for Expo Go)
const auth = getAuth(app);

// Debug: Log auth state to verify persistence
import { onAuthStateChanged } from 'firebase/auth';
onAuthStateChanged(auth, user => {
  if (user) {
    console.log('Firebase Auth: User is logged in:', user.uid);
  } else {
    console.log('Firebase Auth: No user is logged in.');
  }
});

// Analytics: Only initialize if supported (web only, not in Expo Go or React Native)
let analytics: ReturnType<typeof getAnalytics> | undefined;
analyticsIsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Export initialized Firebase instances
export { app, analytics, auth, db};