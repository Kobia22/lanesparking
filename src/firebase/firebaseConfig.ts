// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";


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
const analytics = getAnalytics(app);
const auth = getAuth();
auth.languageCode = 'it';

export { app, analytics, auth };