// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBwj1kwYN7Z3yhdFKoFzVmMutaO3Qk_yPs",
    authDomain: "work-5fa17.firebaseapp.com",
    projectId: "work-5fa17",
    storageBucket: "work-5fa17.firebasestorage.app",
    messagingSenderId: "443790454662",
    appId: "1:443790454662:web:649fe33b4e560d05cd0607",
    measurementId: "G-4XXS59954V"
  };

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore Database
