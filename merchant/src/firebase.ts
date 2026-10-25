import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB9IIQYGO4vYbfRyasHpA2zfTm-gxDoLwY",
  authDomain: "tkpaybd-fe87c.firebaseapp.com",
  databaseURL: "https://tkpaybd-fe87c-default-rtdb.firebaseio.com",
  projectId: "tkpaybd-fe87c",
  storageBucket: "tkpaybd-fe87c.firebasestorage.app",
  messagingSenderId: "746739789462",
  appId: "1:746739789462:web:9fcc540fa0936b39805cb7"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const db = getFirestore(app);
