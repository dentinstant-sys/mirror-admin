// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBw2kCw9bvaBq8QsAaSxF2VkkKhaZ8WAqg",
    authDomain: "maison-mirror-1ab5b.firebaseapp.com",
    projectId: "maison-mirror-1ab5b",
    storageBucket: "maison-mirror-1ab5b.firebasestorage.app",
    messagingSenderId: "33315771783",
    appId: "1:33315771783:web:22733677650f80995d6f22",
    measurementId: "G-RZ3ZVV4681"
};

// Evita inicializar múltiples veces en Server Components / HMR
// Inicializar Firebase evitando múltiples instancias y exportando 'app'

// Exportar Firestore
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);