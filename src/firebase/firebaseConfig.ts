// Import from React Native Firebase packages
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// Configuration object - only needed if initializing manually
const firebaseConfig = {
  apiKey: "AIzaSyAmNIOnMHl0zdF6VV1q8VUB1fjoqAI_S5I",
  authDomain: "lanesparking.firebaseapp.com",
  projectId: "lanesparking",
  storageBucket: "lanesparking.firebasestorage.app",
  messagingSenderId: "1052301765341",
  appId: "1:1052301765341:web:cdd5f4ecd3afdb197d8934",
  measurementId: "G-BYNY9QHJNC"
};

// Initialize Firebase if it's not already initialized
// (usually unnecessary with RN Firebase as it auto-initializes)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Access services
const firestore = firebase.firestore();
const auth = firebase.auth();

// Debug: Log auth state to verify persistence
// Using the RN Firebase auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('Firebase Auth: User is logged in:', user.uid);
  } else {
    console.log('Firebase Auth: No user is logged in.');
  }
});

// For React Native, we should use a different analytics approach
// The Firebase/analytics import from web SDK won't work properly
// React Native Firebase provides its own analytics module
let analytics = null;
try {
  // Only import analytics if we need it (optional)
  const analyticsModule = require('@react-native-firebase/analytics').default;
  analytics = analyticsModule();
} catch (e) {
  console.log('Analytics not available or not set up');
}

// Export initialized Firebase instances
export { firebase, firestore, auth, analytics };